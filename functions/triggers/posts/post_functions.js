
const admin = require("firebase-admin");
const db = admin.firestore();
const sendLoveMessageToSubscribedUsers = require('./../../features/pubsub/love-message/love_message_sender.js')
const { dequeueLoveMessage, enqueueLoveMessage } = require('./../../features/pubsub/love-message/services/love_message_taskHandler.js');
const cc = require('./../../features/connecty-cube/connectycube_services.js')
const { enqueuePostTask, PostTaskType } = require('./../../tasks/post_tasks.js')

const { generateAiAnswersToPost, rankAPostGPT } = require('./../../common/gpt-services/gpt.js')
const { addAiAnswersToPost, addAiAnswersToPostHTTP } = require('../../common/post_services.js')
const functions = require("firebase-functions");
const postServices = require('../../common/post_services.js');

const { enqueueNoReplyNotificationTask } = require('../../tasks/no_reply_notification/no_reply_notification_task.js');


/**
 * [HTTP]
 * When a post is created, this function is triggered.
 * 
 * @param {Object} data - post object
 * @param {functions.https.CallableContext} context
 */
const onPostCreateHTTPS = async (data, context) => {

    const postId = data.id;   
    
   const post = (await postServices.getPostByIdHTTP(data.id)).data;
    if (!post) return;
    /// Rank A Post - Task
    await enqueuePostTask(postId,
        {
            postId: postId,
            title: post.title,
            body: post.content,
            authorCubeId: post.author.cubeId,
            post: post,
            /// feat(audio): [isRanked] this will let us know either i should be calling
            /// the openai api to generate the audio or not... but its just for testing
            // shouldGenerateTTS: data.isRanked == 0
            shouldGenerateTTS: false,
        },
        PostTaskType.RANK_POST_GPT
    );



    // Ad AI answer to post
    const shouldInsertPostComment = true;
    await sendLoveMessageToSubscribedUsers(post, shouldInsertPostComment);
}


/**
 * When a post is created, this function is triggered.
 * 
 * @param {admin.firestore.DocumentSnapshot} snap 
 * @param {*} context 
 */
const onPostCollectionCreate = async (snap, context) => {

    let post = snap.data();
    const postId = snap.id;


    let titleBody = `${post.title} - ${post.content}`;

    /// Rank A Post - Task
    await enqueuePostTask(postId,
        {
            postId: postId,
            title: post.title,
            body: post.content,
        },
        PostTaskType.RANK_POST_GPT
    );

    /// Add AI Answers to Post
    const gptAnswerGenerated = await generateAndAddAiAnswersListToPost(postId, titleBody, false).catch((err) => { }); // future call

    // call the enques on no answers on a post by post author 
    //  enqueueNoReplyNotificationTask(postId,post.author.uid);

    /// If user didnt have cubeId, make one for It.
    /// Case: when user is created before post is created.
    if (!post.author.cubeId) {
        const cubeId = await cc.getCubeIdByFirebaseId(post.author.uid); // future call
        if (cubeId) {
            snap.data().author.cubeId = cubeId;
        } else {
            console.log(`⚠️ User ${post.author.uid} doesnt have a cubeId`);
        }
    }
    sendLoveMessageToSubscribedUsers({
        id: postId,
        ...post,

    });
    // if (shouldSendLoveMessage()) {
    //     console.log(`⚠️ Enqueueing love message for post ${postId}`);
    //     sendLoveMessageToSubscribedUsers(snap); // future call
    // } else {
    //     console.log(`⚠️ Not sending love message for post ${postId}`);
    // }


    /// Enqueue task to send notification to 10% of users
    await enqueuePostTask(postId, { // future call
        postId: postId,
        title: post.author.name,
        body: post.content || post.title,
        authorUid: post.author.uid,
    });


    //[HTTP] - Add AI Answers to Post
    const httpPostPayload = post;
    httpPostPayload.answerTags = gptAnswerGenerated;
    httpPostPayload.isRanked = 1;
    delete httpPostPayload.createdAt;
    delete httpPostPayload.updatedAt;
    post.oldPostId = postId;
    postServices.createPostHTTP(httpPostPayload)
}






// generateAndAddAiAnswersListToPost function
const generateAndAddAiAnswersListToPost = async (postId, titleBody, isRESTAPI = false) => {
    try {
        /// Making sure that it wont exceed 400 chars limit
        if (titleBody.length > 300) {
            titleBody = titleBody.substring(0, 300);
        }
        /// generate ai post answers for input string
        let answers = await generateAiAnswersToPost(titleBody);

        // check if answers length is greater than 0 then add answers to post
        // Add 3 answers to post
        if (answers.length > 0) {
            if (answers.length > 3) {
                ///shuffle the answers
                answers = answers.sort(() => Math.random() - 0.5);
                /// get the first 3 answers
                answers = answers.slice(0, 3);
            }
            if (isRESTAPI) {
                //[HTTP] - Add AI Answers to Post
                await addAiAnswersToPostHTTP(postId, answers);
            } else {
                await addAiAnswersToPost(postId, answers);
            }
            console.log(`Done`);
        }
        else {
            console.log(`No Answers`);
        }

        return answers;
    }
    catch (_) {
        console.log(`Error: ${_}`);
    }

}


const shouldSendLoveMessage = () => {
    /// Generate random number between 0 and 1
    const randomNumber = Math.random();
    console.log(`Random number: ${randomNumber} is less than 0.5: ${randomNumber < 0.5}`);
    /// If random number is less than 0.5 then return true
    return randomNumber < 0.5;
}



module.exports = {
    onPostCreateHTTPS,
    enqueueLoveMessage,
    dequeueLoveMessage,
    onPostCollectionCreate
}