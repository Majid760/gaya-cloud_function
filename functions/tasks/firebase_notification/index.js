

////
/// Firebase Task Queue Functions for Notifications
//// # Important note:
//// This class must be call from /feature/... with its own services
////



const {FirebaseNotificationType, TASK_NAME, NOTIFICATION_TYPE, NOTIFICATION_DATA} = require('./consts.js');
const {performActivityOnUser} = require('../../features/notifications/user_activity/services.js'); 
const validator = require('./validator.js');
const { getFunctions } = require("firebase-admin/functions");


/**
 * Enqueue a firebase notification task to be handled by the `${TASK_NAME}`
 * 
 * @param {FirebaseNotificationType} notificationType - (Required)
 * @param {Object} notificationData - Must contain  userId of user (Required)
 * @param {Number} delayInSec - default 30 seconds  (Optional)
 * 
 * @example
    *  
    const payload { 
            userId: 'userId', (required)
            ... // other data 
        }
        EnqueueFirebaseNotificationTask(FirebaseNotificationType.USER_ACTIVITY, payload);
 */
const EnqueueFirebaseNotificationTask = async (notificationType, notificationData, delayInSec = 30) => {
    try{
        delayInSec = Math.abs(delayInSec);
        console.log(`🔥 Delayed: ${delayInSec}`); 
        console.log(`Enqueuing firebase notification task for notificationType ${notificationType}...⏳ `);
        validator.notificationValidator(notificationType, notificationData);
        const queue = getFunctions().taskQueue(TASK_NAME);
        console.log(`enqueueFirebaseNotificationTask for notificationType ${notificationType}`);
   
          await queue.enqueue(
            {
                [NOTIFICATION_TYPE]: notificationType,
                [NOTIFICATION_DATA]: notificationData,
            },
            {
                scheduleDelaySeconds: delayInSec,
                dispatchDeadlineSeconds: 60 * 5 // 5 minutes
            },
        );
     
      
        const passedData = {
            notificationType,
            notificationData,
            delayInSec,
        }
        console.log(`Enqueued Successfully 🔥 <><> ${JSON.stringify(passedData)}`)
        return passedData;
    } catch(e) {
        console.log('❌ error during enqueueFirebaseNotificationTask=>>', e);
    }

    return;
};


/**
 * function is called by the `${TASK_NAME}` cloud task
 * 
 * @returns 
 */
const DequeueFirebaseNotificationTask = async (data) => {
    /// Unwrap keys
    const notificationType = data[NOTIFICATION_TYPE];
    const notificationData = data[NOTIFICATION_DATA];

    if (!notificationType || !notificationData) {
        throw new Error(`Invalid Data, notificationType, and notificationData are required. Received: ${JSON.stringify(notificationType) ?? notificationData}`);
    }

    switch (notificationType) {
        case FirebaseNotificationType.USER_ACTIVITY:
            await performActivityOnUser(notificationData);
            break;
        default:
            throw new Error(`Invalid notificationType: ${notificationType}`);
    }

    return;
}



module.exports = {
    EnqueueFirebaseNotificationTask,
    DequeueFirebaseNotificationTask,
    FirebaseNotificationType,
   
}