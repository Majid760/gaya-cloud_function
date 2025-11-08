
const functions = require('firebase-functions');
const {sendNotificationOnNoReply } = require('./no_reply_notification.js');
const { NoReplyNotificationTaskType } = require('./consts/no_reply_task_types.js');
const { POST_ID,POST_AUTHOR_ID,NOREPLY_NOTIFICATION_TASK,NO_REPLY_NOTIFICATIOn_TASK_TYPE} = require('./consts/no_reply_fields.js');
const { getFunctions } = require("firebase-admin/functions");

// const isDevelopment = () => {
//     /// get firebnase project id
//     const projectId = process.env.GCLOUD_PROJECT || process.env.GCP_PROJECT;
//     /// check if project id is development
//     console.log('yes its projecttdkd====');
//     return projectId === 'girlz-96072';
// }

/** 
 * 
 * @param {string} postId - The post Id 
 * @param {string} postAuthorId - The post author id
 * @param {NoReplyNotificationTaskType} taskType  - The task type = CCNotificationTaskType
 *
 * @returns void
 *  
 * @description Details are in the `./consts/task_types.js` file 
 */
const enqueueNoReplyNotificationTask = async (postId,postAuthorId,taskType = NoReplyNotificationTaskType.SEND_NOTIFICATION_ON_NO_REPLY) => {

    try {
        console.log(`received postId :>> ${postId} and postAuthor id is:>> ${postAuthorId} in enqueueNoReplyNotificationTask`);
        if (!postId || !postAuthorId || !taskType) {
            throw new Error(`Invalid Data, postid,postAuthorId, and taskType are required.}`);
        }
        const queue = getFunctions().taskQueue(NOREPLY_NOTIFICATION_TASK);
        console.log(`enqueueNoReplyNotificationTask for task ${taskType} for post id ${postId}`);
        const scheduleDelaySeconds = 3600; // 1 hour
        const enqueueResponse = await queue.enqueue(
            {
                [POST_ID]: postId,
                [POST_AUTHOR_ID]: postAuthorId,
                [NO_REPLY_NOTIFICATIOn_TASK_TYPE]: taskType,
            },
            {
                scheduleDelaySeconds,
                dispatchDeadlineSeconds: 60 * 2 // 5 minutes
            },
        );

        console.log(`Enqueued No_Reply_NotificationTask for task ${taskType} for post ${postId} with response `, enqueueResponse);

    } catch (_) {
        console.log('error during enqueueNoReplyNotificationTask=>>', _);
    }

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
const dequeueNoReplyNotificationTask = async (data) => {

    console.log(`received postId :>> ${data[POST_ID]} and postAuthor id is:>> ${data[POST_AUTHOR_ID]} in dequeueNoReplyNotificationTask`);
    /// Unwrap keys
    const postId = data[POST_ID];
    const postAuthorId = data[POST_AUTHOR_ID];
    const taskType = data[NO_REPLY_NOTIFICATIOn_TASK_TYPE];

    if (!postId) {
        console.error(`🆘 Invalid Data, postId, and taskType are required`);
    }
    switch (taskType) {
        case NoReplyNotificationTaskType.SEND_NOTIFICATION_ON_NO_REPLY:
            await sendNotificationOnNoReply(postId, postAuthorId);
            break;
        default:
            console.error(`🆘 Invalid Task ${task}.`);
    }
}


module.exports = {
    enqueueNoReplyNotificationTask,
    dequeueNoReplyNotificationTask,
    
}