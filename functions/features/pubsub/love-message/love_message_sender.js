

const { sendMessage, sendMessageAsPost } = require('./../../connecty-cube/connectycube_services.js');
const { isUserSubscribedToLoveMessages } = require('./../../../common/user_services.js');
const { generateLoveMessage } = require('./../../../common/gpt-services/gpt.js')
const { DEFAULT_CUBE_ID, DEFAULT_FIREBASE_ID } = require('./helpers/const.js')
const { enqueueLoveMessage, LoveMessageType } = require('./services/love_message_taskHandler.js');
const utils = require('./../../../utils/helpers.js');
const { insertAComment } = require('../../../common/post_services.js');
/**
 * 
 * @param {FirebaseFirestore.DocumentSnapshot} post - post document snapshot
 * @param {boolean} shouldInsertPostComment - should insert post comment (default: false)
 * @returns 
 */
const sendLoveMessageToSubscribedUsers = async (post, shouldInsertPostComment = false) => {
     
    if (!(post && post.author && post.author.cubeId)) {
        console.log("⚠️ Invalid post data", post ?? "No data");
        return;
    };

    const author = post.author;
    const authorCubeId = author.cubeId;
    const authorFirebaseId = author.uid;

    // const isSubscribed = (await isUserSubscribedToLoveMessages(authorFirebaseId)).data()?.loveMessageStatus ?? false;

    // if (!isSubscribed) {
    //     console.log(`⚠️ User ${authorFirebaseId} is not subscribed to love messages`);
    //     return;
    // };

    let titleBody = `${post.title} - ${post.content}`;
    /// Making sure that it wont exceed 400 chars limit
    if (titleBody.length > 300) {
        console.log(`⚠️ Title body is too long: ${titleBody.length} chars long for user ${authorFirebaseId}`);
        titleBody = titleBody.substring(0, 300);
    };
    const payload = {
        by:  utils.replaceAnonymousGirlWithGirl(post.author.name),
        message: titleBody,
    }; 
    const message = await generateLoveMessage(payload);

    if (!message) {
        console.log(`⚠️ Could not generate love message for user ${authorFirebaseId}`);
        return;
    };

    console.log(`Sending love message to user ${authorFirebaseId} with message: ${message}`);
    
    await sendMessageAsPost(DEFAULT_CUBE_ID, DEFAULT_FIREBASE_ID, authorCubeId, message, {
        id: post.id,
        ...post,
    }).then(async (res) => {
        sendMessage(DEFAULT_CUBE_ID, DEFAULT_FIREBASE_ID, authorCubeId, message); 
        const payload = {
            "postId": post.id,
            "content": message,
            "author": {
                "dob": "1994-01-01",
                "cubeId": DEFAULT_CUBE_ID,
                "uid": DEFAULT_FIREBASE_ID,
            }
        }
        if(shouldInsertPostComment) await insertAComment(payload);

    }).catch((err) => {
        console.log(`⚠️ Could not send love message to user ${authorFirebaseId} with message: ${message}`);
        console.log(err);
    }
    );


    // enqueueLoveMessage({
    //     USER_ID: authorFirebaseId,
    //     LOVE_MESSAGE_SENDER_ID: DEFAULT_FIREBASE_ID,
    //     LOVE_MESSAGE_SENDER_CUBE_ID: DEFAULT_CUBE_ID,
    //     LOVE_MESSAGE_CONTENT: message,
    //     LOVE_MESSAGE_TYPE: LoveMessageType.TEXT,
    // })

}

module.exports = sendLoveMessageToSubscribedUsers