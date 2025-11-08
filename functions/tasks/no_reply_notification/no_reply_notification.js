const admin = require("firebase-admin");
const db = admin.firestore();
const { getOnlyUserFCM } = require('./../../common/user_services.js')
const cc = require('./../../features/connecty-cube/connectycube_services.js')
const { sendIndividualNotification } = require('../../features/notifications/title_notifications.js');
const postServices = require('../../common/post_services.js');


// sending the  notification when no response by post author getting more than 2 answered
const sendNotificationOnNoReply = async (postId, postAuthorId) => {
    try {
        const size = await shouldSendNoReplyNotification(postId);
        console.log('this total response ==>',size);
        if (size!=undefined && size > 2) {
            console.log(`⚠️ sending  no reply notification for post ${postId}`);
            await sendNotificationToPostAuthor(postAuthorId,size);
        } else {
            console.log(`⚠️ Not sending no reply notification for post ${postId}`);
        }
    } catch (e) {
        console.log('error during sending the sendNotificationOnNoReply');
    }
}

// send the notification to post author
const sendNotificationToPostAuthor = async (postAutherId,size) => {
    try {
        const title = "BTL";
        const body = `💬 You got ${size} answers! check them now`;
        const fcm = await getOnlyUserFCM(postAutherId);
        if (fcm != undefined && fcm != null) {
            await sendIndividualNotification(title, body, fcm);
        }
    } catch (e) {
        console.log('error during sendNotificationToPostAuthor =>>', e);
        return false;
    }
}


// check than we should send the notification or not
// check than we should send the notification or not
const shouldSendNoReplyNotification = async (postId) => {
    return await postServices.getUnAnsweredCountByPostId(postId);    
 }

module.exports = {
    sendNotificationOnNoReply
}
