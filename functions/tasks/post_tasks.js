const { PostTaskType } = require('./consts/task_types');
const { POST_ID, POST_TASK_TYPE, POST_TASK_DATA, POST_TASK } = require('./consts/fields');
const { getFunctions } = require("firebase-admin/functions");
const { fetchRandom10PercentPeople, notificationSentSuccess, fetchMyDevPeople } = require('./../common/notification_services.js')
const { sendNotificationWithoutData, sendNotificationData } = require('./../features/notifications/title_notifications.js')
const { rankAPostGPT } = require('./../common/gpt-services/gpt.js');
const postServices = require('./../common/post_services.js');
const { analyzeComment } = require('./../features/google-apis/perspective_api.js');
const { DEFAULT_CUBE_ID, DEFAULT_FIREBASE_ID } = require('../features/pubsub/love-message/helpers/const.js');
const { sendMessage, sendMessageAsPost } = require('../features/connecty-cube/connectycube_services.js');
const flaggedPostsServices = require('./../common/flagged_posts_services.js');
const { disableAUserByUserId } = require(`./../common/admin_services.js`);
const tts = require('./tts.js');
const { createTTSForPostById } = require('../common/rest-api-services/tts_http_services.js');
const INAPPROPRIATE_WORDS = [
    "cash app",
    "Cashapp",
    "Horny",
    "Horne",
    "Nudes",
    "fuck",
    "horny",
    "Suck",
    "Dick",
    "vagina",
    "milf",
    "h0rny",
    "tits",
    "boobs",
    "ass",
    "cashapp",
    "cash-app",
    "cash app",
    "cash_app",
    "a$$",
    "temu",
    "trade pics",
    "trade talk dirty",
    "I follow back",
    "“I follow back",
    "Looking for fwb",
    "Follow my TikTok",
    "Fwpdrp",
    "my snap",
    "add me",
    "Follow for follow",
    "Boost my followers",
    "Add me on snap",
    "Insta mutes",
    "Follow me",
    "Follow 4 follow",
    "Follow each other",
    "Followeachother",
    "Go follow on",
    "TikTok muts",
    "Hrny",
    "Moots",
    "Insta mutuals",
    "Mutuals",
    "TikTok mutuals",
    "Add me",
    "Instagram mute",
    "TikTok mutes",
    "Nudes",
    "Follow my TikTok",
    "“Follow me on TikTok",
    "Follow my instagram",
    "Follow me on instagram",
    "Fllw me on",
    "Nudes",
    "SHEIN cartt",
    "SHEIN cart",
    "N00ds",
    "Temu",
    "Temu.com",
    "Fwbbbb",
    "Venmo me",
    "Add my snap",
    "follow me",
    "Boys hidden",
    "Hidden boys",
    "To play Roblox",
    "Anyone wanna play",
    "Wanna play fortnight",
    "Wanna play Fortnite",
    "Venmo",
    "send me money",
    "Apple Pay me money",
    "Reach more followers",
    "Subscribe to my",
    "Discord server",
    "Need some hot talk",
    "Can someone please set me up with",
    "Need weed",
    "Sell weed",
    "Need a stoner",
    "Suga mama",
    "Suger mama",
    "Please I’m hungry",
    "Socials",
    "Spam this",
    "Pay for my",
    "Support my TikTok",
    "Can anyone gift me",
    "I need money",
    "Please send me",
    "Send me a",
    "Go comment on my",
    "Can anyone send me",
    "Can anyone set me up",
    "i need $",
    "Dealer",
    "Go like my",
    "Go comment my",
    "Anybody want to date?",
    "I need money",
    "I need a gf",
    "I need a bf",
    "Nuds$",
    "Nbd3$",
    "Flirty friendship anyone",
    "SHEIN",
    "Find me a guy",
    "Find me a boyfriend",
    "Find me a bf",
    "Sugar daddy",
    "Sugar momma",
    "Sugar mami",
    "I’m looking for a relationship",
    "PayPal.me",
    "Cash app",
    "Can someone send me Dollars",
    "Anyone Wanna lend me",
    "Like my recent",
    "Who wants to play fortnight",
    "Follow my",
    "Nud3",
    "Spam call",
    "H*rny",
    "Dirty talk",
    "Trade",
    "Dirty rp",
    "Nds",
    "Like for like",
    "Ndes",
    "Prank call",
    "Exchange pics",
    "H@rny",
    "Groupchat on snap",
    "Gc on snap",
    "Snap gc",
    "Go follow",
    "Spicy pics",
    "Follow you back",
    "Horn",
    "Add me on snap",
    "Self pleasure",
    "I’m so wet",
    "Pleasure tips",
    "Squirting",
    "Fwb",
    "Exchange",
    "Tr@d!ng",
    "Twerk",
    "Prank call"
]

/**
 * 
 * @param {string} postId - The post Id 
 * @param {Object} taskData - The task data 
 * @param {PostTaskType} taskType  - The task type = PostTaskType.SEND_NOTIFICATION_10_PERCENT
 *
 * @returns void
 *  
 * @description Details are in the `./consts/task_types.js` file 
 */
const enqueuePostTask = async (postId, taskData, taskType = PostTaskType.SEND_NOTIFICATION_10_PERCENT) => {

    if (!postId || !taskType) {
        throw new Error(`Invalid Data, postId, and taskType are required. Received: ${JSON.stringify(data) ?? data}`);
    }

    const queue = getFunctions().taskQueue(POST_TASK);

    console.log(`enqueuePostTask for task ${taskType} for post ${postId}`);
    let scheduleDelaySeconds = 30; // 30 seconds
    if (taskType === PostTaskType.RANK_POST_GPT) {
        scheduleDelaySeconds = 1; //  1 second
    }
    await queue.enqueue(
        {
            [POST_ID]: postId,
            [POST_TASK_DATA]: taskData,
            [POST_TASK_TYPE]: taskType,
        },
        {
            scheduleDelaySeconds,
            dispatchDeadlineSeconds: 60 * 5 // 5 minutes
        },
    );
    console.log(`enqueuePostTask Executed Succesfully ✅, `, JSON.stringify(taskData) ?? taskData);

    return;

};

/**
 * 
 * @param {Object} data - Must Contain postId, taskType, and taskData
 * 
 * @example
 *  {
        POST_ID: id,
        POST_TASK_TYPE: type,
        POST_TASK_DATA: data
    }
* @description Details are in the `./consts/task_types.js` file 
 */
const dequeuePostTask = async (data) => {

    console.log(`Dequeue Post Task: ${JSON.stringify(data) ?? data}`);
    /// Unwrap keys
    const postId = data[POST_ID];
    const taskData = data[POST_TASK_DATA];
    const taskType = data[POST_TASK_TYPE];

    if (!postId || !taskType) {
        logger.error(`🆘 Invalid Data, postId, and taskType are required. Received: ${JSON.stringify(data) ?? data}`);
    }

    switch (taskType) {
        case PostTaskType.SEND_NOTIFICATION_10_PERCENT:
            // await __handleSendNotificationTo10Percent(postId, taskData);
            break;
        case PostTaskType.RANK_POST_GPT:
            await __handleRankPostGPT(postId, taskData);
            break;

        default:
            logger.error(`🆘 Invalid Task ${task}.`);
    }
}



///                     
///
/// PRIVATE FUNCTIONS
///
///




const __handleSendNotificationTo10Percent = async (postId, taskData) => {

    console.log(`title: ${taskData.title}, body: ${taskData.body}, authorUid: ${taskData.authorUid}`);
    const { title, body, authorUid } = taskData;
    if (!title || !authorUid || !body) throw new Error(`Invalid Data, title, body, and data are required. Received: ${JSON.stringify(taskData) ?? taskData}`);


    const titleBody = `${title} - ${body}`;

    /// Check if the post contains inappropriate words
    const isFlaggable = containsInappropriateWord(titleBody);
    if (isFlaggable) {
        console.log(`Post ${postId} contains inappropriate words, not sending notification`);
        return;
    };


    console.log(`__handleSendNotificationTask for post ${postId}`);

    const rawTokens = await fetchRandom10PercentPeople();
    /// Extract tokens from rawTokens
    const tokens = rawTokens.map((token) => token.token);

    /// Send Notification 
    await sendNotificationData(title, body, tokens, { 'postId': `${postId}`, 'messageType': "post" });

    /// Update lastServerSentAt so we can keep track of the last time we sent a notification
    await notificationSentSuccess(rawTokens);

    console.log(`__handleSendNotificationTask Executed Succesfully ✅`);

    return;
}

/**
 * Handle ranking of a post using GPT.
 *
 * @param {string} postId - ID of the post
 * @param {Object} taskData - Data containing post information ({title: string, body?:string})
 * @returns {Promise<void>}
 */
const __handleRankPostGPT = async (postId, taskData) => {
    try {
        const MESSAGE = `Hi,
        Your recent post violated our community guidelines and is not currently visible. Please review our guidelines here:
            
        Link: https://www.btl.social/community
        
        We encourage you to post again after reading and understanding the comunity guidelines so you can get new answers.
            
        Community safety and support are important to us
        Best,
        BTL Team`;
        // Extract title and body from taskData
        let { title, body, authorCubeId, post, shouldGenerateTTS } = taskData;



        // Validate that title and body are provided
        if (!title || !body) {
            const fetchedPost = (await postServices.getPostByIdHTTP(postId)).data;
            if (!fetchedPost) return;
            if (!title) title = fetchedPost.title;
            if (!body) body = fetchedPost.content;
        }

        const titleBody = `${title} - ${body}`;

        /**
        /// Check if the post contains inappropriate words
        const isFlaggable = containsInappropriateWord(titleBody);
        if (isFlaggable) {
            console.log(`Post ${postId} contains inappropriate words, so making it hidden from FEED`);
            await postServices.rankAPostByNumber(postId, 0);

            /// Send a message to the author of the post

            await sendMessageAsPost(DEFAULT_CUBE_ID, DEFAULT_FIREBASE_ID, authorCubeId, MESSAGE, {
                id: post.id,
                ...post,
            }).then((_) => {
                sendMessage(DEFAULT_CUBE_ID, DEFAULT_FIREBASE_ID, authorCubeId, MESSAGE);
            }).catch((err) => {
                console.log(`⚠️ Could not send love message to user ${authorCubeId}, err: ${err}`);
                // console.log(err);
            }
            );
            return;
        };
        console.log(`Handling post ranking using GPT for post ${postId}`);
         */


        // Rank the post using [Perspective API]
        /**
         * true = inappropriate
         * false = appropriate
         */
        // let isNegativeComment = await analyzeComment(title + ". " + body);
        const isNegativeComment = false;

        /// feat(audio): [isRanked] this will let us know either i should be calling
        /// the openai api to generate the audio or not... but its just for testing
        if (shouldGenerateTTS) {
            const audioUrlTranscript = await tts(postId, titleBody);
            await createTTSForPostById(postId, audioUrlTranscript.audioUrl, audioUrlTranscript.transcript);
        }
        // Update post ranking in the database [1=show in FEED, 0=hide from FEED]
        await postServices.rankAPostByNumber(postId, isNegativeComment ? 0 : 1);

        /**
                 if (isNegativeComment) {
            __flagAPost(postId, post.author.uid, "Inappropriate Content").catch((err) => { });
            /// Send a message to the author of the post
            await sendMessageAsPost(DEFAULT_CUBE_ID, DEFAULT_FIREBASE_ID, authorCubeId, MESSAGE, {
                id: post.id,
                ...post,
            }).then((_) => {
                sendMessage(DEFAULT_CUBE_ID, DEFAULT_FIREBASE_ID, authorCubeId, MESSAGE);
            }).catch((err) => {
                console.log(`⚠️ Could not send love message to user ${authorFirebaseId} with message: ${message}`);
                console.log(err);
            }
            );
        }
         */


    } catch (error) {
        console.error(`Error in handling post ranking with GPT: ${error}`);
        // If there's an error, by default, rank the post as 1 (show in FEED)
        await postServices.rankAPostByNumber(postId, 1);
    }
};


const __flagAPost = async (postId, userId, reason) => {

    /// If the user has reached the flag limit, block the user
    const shouldBlock = await flaggedPostsServices.isFlaggedLimitReached(userId);

    if (shouldBlock) {
        console.log(`User ${userId} has reached the  flag limit for posts, blocking the user`);
        /// block the user
        await disableAUserByUserId(userId, "User has reached the flag limit for posts");
        return;
    }

    await flaggedPostsServices.flagAPost(postId, userId, reason);
}


function containsInappropriateWord(text, inappropriateWords = INAPPROPRIATE_WORDS) {
    const lowercaseText = text.toLowerCase();

    for (const word of inappropriateWords) {
        if (lowercaseText.includes(word.toLowerCase())) {
            return true;
        }
    }

    return false;
}



module.exports = {
    enqueuePostTask,
    dequeuePostTask,
    POST_TASK,
    PostTaskType,
    containsInappropriateWord,
}