const { CCNotificationTaskType } = require('./consts/cc_notification_task_types.js');
const { CCNOTIFICATION_TASK_TYPE, CCNOTIFICATION_TASK_DATA, CCNOTIFICATION_TASK } = require('./consts/cc_notification_fields.js');
const { getFunctions } = require("firebase-admin/functions");
const { sendNotificationForNoResponseOnFirstMessage } = require('./cc_notification.js');


/** 
 * @param {Object} taskData - The task data 
 * @param {CCNotificationTaskType} taskType  - The task type = CCNotificationTaskType
 * @returns void
 * @description Details are in the `./consts/task_types.js` file 
 */
const enqueueCCNotificationTask = async (taskData, taskType = CCNotificationTaskType.SEND_NOTIFICATION_FIRST_MESSAGE) => {

    try {
        if (!taskData) {
            throw new Error(`Invalid Data, dialog, and taskType are required. Received: ${JSON.stringify(taskData) ?? taskData}`);
        }
        const queue = getFunctions().taskQueue(CCNOTIFICATION_TASK);
        const scheduleDelaySeconds = 3600; // 1 hour
        const enqueueResponse = await queue.enqueue(
            {
                [CCNOTIFICATION_TASK_DATA]: taskData,
                [CCNOTIFICATION_TASK_TYPE]: taskType,
            },
            {
                scheduleDelaySeconds,
                dispatchDeadlineSeconds: 60 * 2 // 5 minutes
            },
        );

        console.log(`Enqueued CCNotificationTask for task ${taskType} for post ${taskData.dialogId} with response `, enqueueResponse);

    } catch (_) {
        console.log('error during enqueueCCNotificationTask=>>', _);
    }

    return;

};

/**
 * 
 * @param {Object} data -  taskType, and taskData
 * 
 * @description Details are in the `./consts/task_types.js` file 
 */
const dequeueCCNotificationTask = async (data) => {

    console.log('X-Called dequeueCCNotificationTask ', data)
    const taskData = data[CCNOTIFICATION_TASK_DATA];
    const taskType = data[CCNOTIFICATION_TASK_TYPE];

    if (!taskData) {
        console.error(`🆘 Invalid Data task data. Received: ${JSON.stringify(taskData) ?? data}`);
    }
    switch (taskType) {
        case CCNotificationTaskType.SEND_NOTIFICATION_FIRST_MESSAGE:
            await sendNotificationForNoResponseOnFirstMessage(taskData);
            break;
        default:
            console.error(`🆘 Invalid Task ${task}.`);
    }
}



module.exports = {
    enqueueCCNotificationTask,
    dequeueCCNotificationTask,
    CCNOTIFICATION_TASK,
    sendNotificationForNoResponseOnFirstMessage
}