const services = require('./services.js');
const { EnqueueFirebaseNotificationTask, FirebaseNotificationType } = require('../../../tasks/firebase_notification/index.js');
const userServices = require('../../../common/user_services.js');
const utils = require('../../../utils/helpers.js');
const { transformActivityType, enumActivityType, getRandomizedTaskList , getFixTaskList} = require('./utils.js');
/**
 * @deprecated Remove user activity, as it is not needed anymore (as per almog's request)
 * Populate the FCM tokens collection with users activity data from BigQuery
 * 
 * Call by pubsub function `pubSubPopulateFCMTokensWithUserActivity`
 */
const populateFCMTokensWithUserActivity = async () => {
    const bgActivities = await services.getUsersActivityBigQuery();
    if (bgActivities.length === 0) throw new Error('No activities found in BigQuery');

    const { performed, total } = await services.writeUserActivityToFirestore(bgActivities);
    console.log(`ℹ️ [populateFCMTokensWithUserActivity] Total Performed: ${performed} out of ${total} rows`);
    return { performed, total };
}


const enqueueForAllUsers = async () => {
    const users = await userServices.getAllFCMsWithTimeZone();
    console.log(`ℹ️ [enqueueForAllUsers] Total Users: ${users.docs.length}`);
    for await (const user of users.docs) {
        const userId = user.id;
        const { tz_offset, app_opens_per_week } = user.data();
        await enqueueForAUser(userId, tz_offset, app_opens_per_week);
    }

}


const enqueueForAUser = async (userId, tz_offset, app_opens_per_week) => {
    if (!userId) throw new Error('userId is required');
    let currentUserDateTime = utils.getCurrentTimeWithOffset(tz_offset);
    console.log(`
        ℹ️ [enqueueForAUser] Enqueueing for 
        userId: ${userId} 
        with tz_offset: ${tz_offset} 
        currentUserDateTime: ${currentUserDateTime}
        `);

    await ___handleActivityUser(userId, currentUserDateTime);

    /*
    @deprecated - Remove user activity, as it is not needed anymore (as per almog's request)
    if (userActivityType == enumActivityType.HIGH_ACTIVITY) {
            await ___handleHighActivityUser(userId, currentUserDateTime)
        }
        else if (userActivityType == enumActivityType.MEDIUM_ACTIVITY) {
            await ___handleMediumActivityUser(userId, currentUserDateTime)
        }
        else if (userActivityType == enumActivityType.LOW_ACTIVITY) {
            await ___handleLowActivityUser(userId, currentUserDateTime)
        } else {
            console.log(`
            ℹ️ [enqueueForAUser] No activity type found for 
            userId: ${userId} 
            with tz_offset: ${tz_offset} and 
            currentUserDateTime: ${currentUserDateTime}
            `);
        }
    **/




    return true;
};


/**
 * For all users, we will send 3 notifications at 3 different times
 * no matter what their activity-type(which is deprecated). 
 * 
 * @param {String} userId 
 * @param {Date} dateObject 
 */
const ___handleActivityUser = async (userId, dateObject) => {
    const numberOfTasks = 3; /// 3 tasks
    const tasks = getFixTaskList(numberOfTasks);
    for await (const task of tasks) {
        const year = dateObject.getFullYear();
        const month = dateObject.getMonth();
        const day = dateObject.getDate();
        const hour = utils.getRandomInt(task.hourRange[0], task.hourRange[1]);

        const taskDateTime = new Date(year, month, day, hour, 0, 0);
        const delaySec = utils.getDifferenceInSecondsFromNow(taskDateTime); 
        /// Enqueue the task according to the delay
        await EnqueueFirebaseNotificationTask(
            FirebaseNotificationType.USER_ACTIVITY, 
            { userId}, 
            delaySec,
        );
    }
}
/**
 * @deprecated - Remove user activity, as it is not needed anymore (as per almog's request) 
 *
 * @param {String} userId - userId to send notification to
 * @param {Object} dateObject - current date time object of this user
 */
const ___handleHighActivityUser = async (userId, dateObject) => {
    const numberOfTasks = utils.getRandomInt(3, 5);
    const tasks = getRandomizedTaskList(numberOfTasks);
    for await (const task of tasks) {
        const hour = utils.getRandomInt(task.hourRange[0], task.hourRange[1]);
        const taskDateTime = new Date(dateObject.getFullYear(), dateObject.getMonth(), dateObject.getDate(), hour, 0, 0);
        const delaySec = utils.getDifferenceInSecondsFromNow(taskDateTime);
        await EnqueueFirebaseNotificationTask(FirebaseNotificationType.USER_ACTIVITY, { userId, messageCategory: task.messageCategory }, delaySec);
    }

}
/**
 * @deprecated - Remove user activity, as it is not needed anymore (as per almog's request) 

 * @param {String} userId - userId to send notification to
 * @param {Object} dateObject - current date time object of this user
 */
const ___handleMediumActivityUser = async (userId, dateObject) => {
    const numberOfTasks = utils.getRandomInt(2, 4);
    const tasks = getRandomizedTaskList(numberOfTasks);
    for await (const task of tasks) {
        const hour = utils.getRandomInt(task.hourRange[0], task.hourRange[1]);
        const taskDateTime = new Date(dateObject.getFullYear(), dateObject.getMonth(), dateObject.getDate(), hour, 0, 0);
        const delaySec = utils.getDifferenceInSecondsFromNow(taskDateTime);
        await EnqueueFirebaseNotificationTask(FirebaseNotificationType.USER_ACTIVITY, { userId, messageCategory: task.messageCategory }, delaySec);
    }
}
/**
 * @deprecated - Remove user activity, as it is not needed anymore (as per almog's request) 
 * @param {String} userId - userId to send notification to
 * @param {Object} dateObject - current date time object of this user
 */
const ___handleLowActivityUser = async (userId, dateObject) => {
    const numberOfTasks = utils.getRandomInt(1, 2);
    const tasks = getRandomizedTaskList(numberOfTasks);
    for await (const task of tasks) {
        const hour = utils.getRandomInt(task.hourRange[0], task.hourRange[1]);
        const taskDateTime = new Date(dateObject.getFullYear(), dateObject.getMonth(), dateObject.getDate(), hour, 0, 0);
        const delaySec = utils.getDifferenceInSecondsFromNow(taskDateTime);
        await EnqueueFirebaseNotificationTask(FirebaseNotificationType.USER_ACTIVITY, { userId, messageCategory: task.messageCategory }, delaySec);
    }
}







module.exports = {
    populateFCMTokensWithUserActivity,
    enqueueForAllUsers,
    enqueueForAUser,
}