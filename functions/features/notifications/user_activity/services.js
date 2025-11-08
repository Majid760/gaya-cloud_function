const { getUserFCM, getUserActivity } = require('../../../common/user_services.js')
const utils = require('../../../utils/helpers.js');
const admin = require('firebase-admin');
const db = admin.firestore();
const { FieldValue } = require("firebase-admin/firestore");
const notificationServices = require('../../../features/notifications/title_notifications.js')
const { runBQUserActivity } = require('../../../features/analytics-sheet/big-query/queries/user_activity.js');
const FCMTOKEN_COLLECTION = require('../../../common/collection_consts.js').fcmTokens;
const { enumActivityType, transformActivityType } = require('./utils.js');
const { getNotificationByTime } = require('./notification_generator.js');

/**
 * Sends a notification to a user by their token, with a title and body.
 * 
 * @param {Object} notificationData - Must contain title, body & userId of user (Required)
 */
const performActivityOnUser = async (notificationData) => {
    const { userId } = notificationData;
    console.log(`ℹ️ [performActivityOnUser] Performing activity for ${userId}`);
    if (!userId) throw new Error(`[performActivityOnUser]: InvalidPayload ${JSON.stringify(notificationData) ?? notificationData}`);

    const userTokenData = (await getUserFCM(userId)).data();
    const { token, app_opens_per_week, tz_offset } = userTokenData;
    if (!token) throw new Error(`User ${userId} does not have a token`);



    /// Directly send notification instead of checking if user can perform activity
    /// As per almog's request its not needed anymore @deprecated
    /// Send Notification
    await __sendNotification(token, tz_offset);
    console.log(`Performed activity`);

    /**
     * @deprecated Remove user activity, as it is not needed anymore (as per almog's request)
    
    if (!app_opens_per_week) throw new Error(`User ${userId} does not have app_opens_per_week`);
    /// User Activity
    const YYYYMMDD = utils.getCurrentDateYYYYMMDD(); 

     /// Get the latest user activity
    await admin.firestore().runTransaction(async (t) => {
        /// Get the latest user activity
        const activityRef = db.collection('activities').doc(userId).collection('activity').doc(YYYYMMDD);
        const activity = await t.get(activityRef);
        const activities = activity.data()?.count ?? 0;
        /// Check if user can perform activity
        if (!__canPerformActivity(app_opens_per_week, activities)) { 
            throw new Error(`Limit has been reached for ${userId} performActivityOnUser ${activities} appOpensPerWeek: ${app_opens_per_week}`);
        } 
        /// Send Notification
        const sentActivity = await __sendNotification(token, tz_offset);

        /// Set Count & add activity data
        /// Workaround: To avoid sending more notifications than required 
        // await __setUserActivity(t, activityRef, sentActivity);
        t.set(activityRef, {
            'activities': FieldValue.arrayUnion(sentActivity),
            'count': FieldValue.increment(1), /// Increment count by 1
            'updatedAt': FieldValue.serverTimestamp()
        },
            { merge: true }
        ); 
        console.log(`Performed activity`);
    });

     */ 
}

/**
 *  Check if user can perform activity based on their activity type and total notifications sent today
 * @param {Number} app_opens_per_week
 * @param {Object} activityData
 * @returns {Boolean} - value
 */
  function __canPerformActivity(app_opens_per_week, count) {
    /// Identify user's activity type
    const activityType = transformActivityType(app_opens_per_week);
    /// Identify total notifications sent today
    const todaySent = count || 0;

    console.log(`ℹ️ [__canPerformActivity] todaySent: ${todaySent} activityType: ${activityType}`)
    switch (activityType) {
        case enumActivityType.HIGH_ACTIVITY:
            // 4-6 notifications/day  
            return todaySent <= 6;
        case enumActivityType.MEDIUM_ACTIVITY:
            // 2-4 notifications/day  
            return todaySent < 4;
        case enumActivityType.LOW_ACTIVITY:
            // 1-2 notifications/day  
            return todaySent < 2;

        default:
            return false;
    }
}
// /**
//  * 
//  * @param {admin.firestore.Transaction} t - firestore transaction
//  * @param {admin.firestore.DocumentReference} ref - firestore document reference
//  * @param {Object} sentActivity - activity data
//  */
// async function __setUserActivity(t, activityRef, sentActivity) {
//     t.set(activityRef, {
//         'activities': FieldValue.arrayUnion(sentActivity),
//         'count': FieldValue.increment(1), /// Increment count by 1
//         'updatedAt': FieldValue.serverTimestamp()
//     },
//         { merge: true }
//     ); 
// }

async function __sendNotification(token, tz_offset) {

    const localTime = utils.getCurrentTimeWithOffset(tz_offset);
    const { title, body } = getNotificationByTime(localTime);

    console.log(`ℹ️ [__sendNotification] Sending Notification to ${token} with title: ${title} and body: ${body}`);
    await notificationServices.sendIndividualNotification(title, body, token);

    return { title, body };
}




////
//// Query for user activity
////

/**
 * @deprecated Remove user activity, as it is not needed anymore (as per almog's request)
 * Get the activity of all users for the current week
 * 
 * @returns {Promise<Array>} - rows
 */
async function getUsersActivityBigQuery() {
    const rows = await runBQUserActivity();
    return rows;
}

/**
 * Write user activity to firestore in batches
 * @param {Array} rows 
 * @returns {Promise<{performed: Number, total: Number, isAllSuccess: Boolean}>} - result
 */
async function writeUserActivityToFirestore(rows) {
    let performed = 0;
    /// Split into batches of 490
    const batchedRows = utils.chunkArray(rows, 490);
    console.log(`ℹ️ Total Batched Rows for User Activity: ${batchedRows.length}`);

    for await (const rows of batchedRows) {
        try {
            /// Write to firestore in batches of 490
            const batch = admin.firestore().batch();
            rows.forEach(row => {
                let { user_id, app_opens_per_week, tz_offset } = row;


                if (typeof app_opens_per_week === 'string') {
                    app_opens_per_week = parseInt(app_opens_per_week);
                }
                if (typeof tz_offset === 'string') {
                    tz_offset = parseInt(tz_offset);
                }
                const ref = admin.firestore().collection(FCMTOKEN_COLLECTION).doc(user_id);
                batch.set(ref, {
                    app_opens_per_week: app_opens_per_week,
                    tz_offset: tz_offset,
                    updatedAt: FieldValue.serverTimestamp()
                }, { merge: true });
            });
            await batch.commit();
            performed += rows.length;
        } catch (e) {
            console.log('error during writeUserActivityToFirestore=>>', e);
        }
    }

    return {
        performed,
        total: rows.length,
        isAllSuccess: performed === rows.length
    }
}



module.exports = {
    performActivityOnUser,
    getUsersActivityBigQuery,
    writeUserActivityToFirestore
}