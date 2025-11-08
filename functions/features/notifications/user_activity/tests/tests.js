const { populateFCMTokensWithUserActivity, handleUserActivityNotification, enqueueForAllUsers, enqueueForAUser } = require('../index.js');
const { EnqueueFirebaseNotificationTask, FirebaseNotificationType, } = require('../../../../tasks/firebase_notification/index.js');
const { testDelayForUSTZOffset } = require('./local_tests.js');
const admin = require('firebase-admin');
const db = admin.firestore();
///
const almogUID = `00eQxSS75ORTARJ5tg1rRdQ6ekj2`;
const ubaidUID = `UEtPU8EJ1xe3wA3ZnJaP4Y5l6LY2`;
const hamidUID = `aOnVC7tckVdrKONHkr2tMxGwPil2`;
const call = async () => {
    // pubSubTest();
    // getBigQueryResults();
    // testDelayForUSTZOffset();
    //  await enqueueForAllUsers();
    // await dequeueSingleTask();
    // testDelay();
    enqueueSingleUser(ubaidUID);

}


const pubSubTest = async () => {
    await populateFCMTokensWithUserActivity();
}

const userSingleTest = async () => {
    const payload = {};
    await handleUserActivityNotification(payload);
    return true;
}


const getBigQueryResults = async () => {
    const { getUsersActivityBigQuery } = require('../services.js');
    const result = await getUsersActivityBigQuery();
}

const dequeueSingleTask = async () => {
    const { DequeueFirebaseNotificationTask } = require('../../../../tasks/firebase_notification/index.js');
    const data = {
        notificationType: 'USER_ACTIVITY',
        notificationData: {
            userId: ubaidUID
        }
    }

    await DequeueFirebaseNotificationTask(data);
}


const testDelay = () => {
    EnqueueFirebaseNotificationTask(FirebaseNotificationType.USER_ACTIVITY, {
        userId: ubaidUID
    }, 10)

}

const enqueueSingleUser = async (userId) => {
    const fcmData = await db.collection("fcmTokens").doc(userId).get();
    const { tz_offset, app_opens_per_week } = fcmData.data();
    await enqueueForAUser(userId, tz_offset, app_opens_per_week); 
    console.log(`Enqueued for ${userId}`);
}



module.exports = {
    call
}