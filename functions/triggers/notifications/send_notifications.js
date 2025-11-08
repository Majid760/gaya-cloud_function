
const admin = require("firebase-admin");
const { allUsersToken } = require("./../../common/notification_services");
const { sendNotificationWithoutData } = require('./../../features/notifications/title_notifications.js')



// //  send notifications to users after 3 days at night
// //  <<<<<<<<<<<<<<<<<<<<<<<<<<<<<< === Need you help Notification === >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

const sendNeedHelpNotification = async function sendNeedHelp() {
  try {
    const usersTokens = await allUsersToken();
    if (usersTokens == undefined || usersTokens.length < 1 || usersTokens == null) {
      console.log("usersTokens undefined,empty or null at sendNeedHelpNotification");
      return;
    }
    const messageTitle = "Someone need your help!";
    const messageText = "Anonymous girl needs your help 🤝. Join the conversation!";
    await sendNotificationWithoutData(messageTitle, messageText, usersTokens);

    // console.log("FCM Response at sendNeedHelpNotification method:", response);
  } catch (error) {
    console.error("Error sending notifications at sendNeedHelpNotification:", error);
    return null;
  }
}

// //  <<<<<<<<<<<<<<<<<<<<<<<<<<<<<< == Share Your Day Notification === >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

//  send notifications to users after 3 days at night
const sendShareYourDayNotification = async function sendShareYourDay() {
  try {
    const usersTokens = await allUsersToken();
    if (usersTokens == undefined || usersTokens.length < 1 || usersTokens == null) {
      console.log("usersTokens undefined,empty or null at sendShareYourDayNotification");
      return;
    }
    const messageTitle = "Share your day!";
    const messageText = "Share your day & connect with girls.";

    await sendNotificationWithoutData(messageTitle, messageText, usersTokens);
  } catch (error) {
    console.error(
      "Error sending notifications of sendShareYourDayNotification ==>:",
      error
    );
    return null;
  }
};

// //  <<<<<<<<<<<<<<<<<<<<<<<<<<<<<< == End Share Your Day Notification=== >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

// //  <<<<<<<<<<<<<<<<<<<<<<<<<<<<<< == New Posts Notification === >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

//  send notifications to users after 3 days at morning
const sendNotificatinOnNewPost = async function sendOnNewPost() {
  try {
    const usersTokens = await allUsersToken();
    if (usersTokens == undefined || usersTokens.length < 1 || usersTokens == null) {
      console.log("usersTokens undefined,empty or null at sendNotificatinOnNewPost");
      return;
    }
    const messageTitle = "New posts are waiting!";
    const messageText = "New posts are waiting! Join the conversation🌟";
    await sendNotificationWithoutData(messageTitle, messageText, usersTokens);
    console.log("FCM Response at sendNotificatinOnNewPost method:", response);

  } catch (error) {
    console.error("Error sending notifications at sendNotificatinOnNewPost:", error);
    return null;
  }
}

// //  <<<<<<<<<<<<<<<<<<<<<<<<<<<<<< == End of  New Posts Notification === >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

// //  <<<<<<<<<<<<<<<<<<<<<<<<<<<<<< == Need Advice Notification === >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

// //  send notifications periodically
const sendNotificatinSeekingAdvice = async function sendSeekingAdvice() {
  try {
    const usersTokens = await allUsersToken();
    if (usersTokens == undefined || usersTokens.length < 1 || usersTokens == null) {
      console.log("usersTokens undefined,empty or null at sendNotificatinSeekingAdvice");
      return;
    }
    const messageTitle = "Seeking advice?";
    const messageText = "Seeking advice? Post your question and get answers!";
    await sendNotificationWithoutData(messageTitle, messageText, usersTokens);
    console.log("FCM Response at sendNotificatinSeekingAdvice method:", response);
  } catch (error) {
    console.error("Error sending notifications at sendNotificatinSeekingAdvice:", error);
    return null;
  }
};

// //  <<<<<<<<<<<<<<<<<<<<<<<<<<<<<< == End Need Advice Notification=== >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

// // Function to send  notifications at 9:00 PM server time
// // exports.sendNotification = functions.pubsub.schedule('0 21 * * *').onRun(sendNeedHelpNotification);


module.exports = {
  sendNeedHelpNotification,
  sendShareYourDayNotification,
  sendNotificatinOnNewPost,
  sendNotificatinSeekingAdvice,
}