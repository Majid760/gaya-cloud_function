const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { analyzeVideo } = require('./features/google-apis/video_intelligence_api.js');

// TODO: UnComment this line before release
  const productionServiceAccFile = require("./girlz-dev-3233fb523984.json");
//  const DevServiceAccFile = require("./development_key.json");

initializeApp(
  {
  // TODO: UnComment this line before release
    credential: cert(productionServiceAccFile),
  storageBucket: "girlz-dev.appspot.com",
   }
);
getFirestore();
const functions = require("firebase-functions");


const { onUserCollectionUpdate, onUserCollectionDelete, dequeueUserTask, onAuthUserCreate, deleteUserByIDOnCall } = require("./triggers/users/user_functions.js");
const getLocation = require('./features/location/location.js')
const { onTestHttps } = require('./test.js');
const { sendDailyTagNotification } = require('./features/pubsub/notifications/sendDailyTag.js')
const { onPostCreateHTTPS, dequeueLoveMessage, onPostCollectionCreate } = require("./triggers/posts/post_functions.js");
const { onFCMTokenCollectionCreate } = require('./triggers/tokens/fcm_functions.js')
const { saveDailyAnalyticUpdates, saveWeeklyAnalyticUpdates, getAndUpdateCCDailyMessagesAndChatroomCountToFirestore } = require('./features/analytics-sheet/analytics_sheet.js');
const { onTwillioMessageCreate } = require('./triggers/onTwillioMessage/twillio_function.js')
const { dequeuePostTask } = require('./tasks/post_tasks.js')
const { generateTagsHTTPS, createConversationHTTPS } = require('./common/gpt-services/gpt.js')

const { girlzBestieBotMessage } = require('./triggers/onCCMessage/girlBestie/girls_bestie_functions.js');
const { dequeueGirlzBestieBotMessageTask } = require('./triggers/onCCMessage/girlBestie/tasks.js')


/// send daily notifications
const { sendNeedHelpNotification, sendShareYourDayNotification, sendNotificatinOnNewPost, sendNotificatinSeekingAdvice } = require('./triggers/notifications/send_notifications.js');

/// [UserActivityNotification] 
const { DequeueFirebaseNotificationTask } = require('./tasks/firebase_notification/index.js');
/// [UserActivityNotification]
const { populateFCMTokensWithUserActivity, enqueueForAllUsers } = require('./features/notifications/user_activity/index.js');
const { dequeueWeeklyRegistrationsAndCCMessagesAnalyticsTask, dequeueAnalyticsTask, dequeuePostsAndReportedPostsAnalyticsTask, dequeueUserRegistrationsAndPotsAndUsersWhoOpenedAppAnalyticsTask, dequeueTop1000PostsAnalyticsTask } = require('./tasks/analytics_tasks/analytics_tasks_for_sheet.js')
const { onUserFcmCollectionUpdate } = require("./triggers/fcmTokens/fcm_tokens_functions.js");

// [author post notification ]
const { sendNotificationForNoResponseOnFirstMessage, enqueueCCNotificationTask, dequeueCCNotificationTask } = require('./tasks/cc_notification/cc_notification_task.js')
const { enqueueNoReplyNotificationTask, dequeueNoReplyNotificationTask } = require('./tasks/no_reply_notification/no_reply_notification_task.js')

const {onScreenshotCreate} = require('./triggers/counts/screenshot_functions.js');
const {onSharePostCreate} = require('./triggers/counts/share_post_functions.js');


/********************************************************************************************
                                TRIGGER FUNCTIONS - FIRESTORE
*********************************************************************************************/

/// Users Functions 

exports.onUserUpdate = functions.firestore.document("users/{userId}").onUpdate(onUserCollectionUpdate);

exports.onUserDelete = functions.firestore.document("users/{userId}").onDelete(onUserCollectionDelete);

exports.AuthUserCreated = functions.auth.user().onCreate(onAuthUserCreate);

/// Posts Functions
exports.onPostCreate = functions.firestore.document("posts/{postId}").onCreate(onPostCollectionCreate);

/// FCM Functions
exports.onFCMTokenCreate = functions.firestore.document("users/{userId}/fcmTokens/{userId}").onCreate(onFCMTokenCollectionCreate);

/// TWILLIO Messages
exports.onTwillioMessageCreate = functions.firestore.document('twillioMessages/{docId}').onCreate(onTwillioMessageCreate);

// on FCMTokens update
exports.onUserFcmUpdate = functions.firestore.document("fcmTokens/{userId}").onUpdate(onUserFcmCollectionUpdate);

// Logging Counts for BTL-AI
exports.onScreenshotCreateTrigger = functions.firestore.document("screenshots/{docId}").onCreate(onScreenshotCreate);

exports.onSharePostCreateTrigger = functions.firestore.document("sharedPosts/{docId}").onCreate(onSharePostCreate);
 


/********************************************************************************************
                                API FUNCTIONS - HTTP REQUESTS
*********************************************************************************************/

exports.getLocation = functions.https.onRequest(getLocation);


// [🪲🪲🪲 Test 🪲🪲🪲]
exports.test = functions.runWith({ timeoutSeconds: 540, memory: '8GB', }).https.onRequest(onTestHttps);

// generate tags for a given string
exports.generateTags = functions.https.onRequest(generateTagsHTTPS);
exports.createConversationGenerate = functions.https.onRequest(createConversationHTTPS);

// girlz bestie bot message
exports.girlzBestieBotMessageHttp = functions.https.onCall(girlzBestieBotMessage);

exports.disableUserByUid = functions.https.onCall(deleteUserByIDOnCall);

exports.createPostAPI = functions.https.onCall(onPostCreateHTTPS)

/// done by mak
exports.sendTaskNotificationOnNoMessageResponse = functions.https.onCall(async (data, context) => {
  try {
      if (data) {
          console.log('call on first message of chattroom and this is data =>',data);
           await enqueueCCNotificationTask(data);
          // await sendNotificationForNoResponseOnFirstMessage(data);
          return { result: 'Notification sent successfully' };
      }else{
          console.log('oops there no data when calling sendTaskNotificationOnNoMessageResponse');
          return {"message":"not compelted"};
      }
  } catch (e) {
      // throw new functions.https.HttpsError('error caught during sendTaskNotification!', `error is ==>> "${e}"`);
      return {
          "message": e,
          "string": JSON.stringify(e)
      };
  }
});



/********************************************************************************************
                                 CLOUD TASK FUNCTIONS - ENQUEUE DEQUEUE
*********************************************************************************************/
/**
 * Cloud Task - Dispatch  On User Create Task
 * 
 * @param {String} postId - post id
 * @returns {Object} - {result: String} 
 */
exports.handleUserCreationTask = functions.runWith({ timeoutSeconds: 180, memory: '1GB', }).tasks.taskQueue().onDispatch(dequeueUserTask);

exports.handleLoveMessageTask = functions.tasks.taskQueue().onDispatch(dequeueLoveMessage);

exports.handlePostsTask = functions.tasks.taskQueue().onDispatch(dequeuePostTask);

exports.girlzBestieBotMessageTask = functions.tasks.taskQueue().onDispatch(dequeueGirlzBestieBotMessageTask);

// [UserActivityNotification] - Dequeue Firebase Notification Task
exports.firebaseNotificationTask = functions.tasks.taskQueue().onDispatch(DequeueFirebaseNotificationTask);

// analytics tasks
exports.handleAnalyticsTask = functions.runWith({ timeoutSeconds: 540, memory: '4GB', }).tasks.taskQueue().onDispatch(dequeueAnalyticsTask);

// analytics tasks
exports.handlePostsAndReportedPostsAnalyticsTask = functions.runWith({ timeoutSeconds: 540, memory: '4GB', }).tasks.taskQueue().onDispatch(dequeuePostsAndReportedPostsAnalyticsTask);

// analytics tasks
exports.handleUserRegistrationsAndPotsAndUsersWhoOpenedAppAnalyticsTask = functions.runWith({ timeoutSeconds: 540, memory: '4GB', }).tasks.taskQueue().onDispatch(dequeueUserRegistrationsAndPotsAndUsersWhoOpenedAppAnalyticsTask);

// analytics tasks
exports.handleTop1000PostsAnalyticsTask = functions.runWith({ timeoutSeconds: 540, memory: '4GB', }).tasks.taskQueue().onDispatch(dequeueTop1000PostsAnalyticsTask);

// analytics tasks
// exports.handleWeeklyRegsAndMessagesAnalyticsTask = functions.runWith({ timeoutSeconds: 540, memory: '4GB', }).tasks.taskQueue().onDispatch(dequeueWeeklyRegistrationsAndCCMessagesAnalyticsTask);

// analytics tasks


/********************************************************************************************
                                 PUB SUB FUNCTIONS - SEND NOTIFICATIONS
*********************************************************************************************/

//[🔔] Function to send daily notifications at 5:00 PM server time
exports.sendDailyNotification = functions.pubsub.schedule('0 17 * * *').onRun(sendDailyTagNotification);

// Function to send daily notifications at 5:00 PM server time
// exports.sendDailyNotification = functions.pubsub.schedule('0 17 * * *').onRun(sendDailyTagNotification);

//[🔔]send the notificatio of someone need your help after every three days at night (10.p.m) schedule pattern ("0 22 */3 * *")
exports.sendDailySomeOneNeedHelpNotification = functions.pubsub.schedule("0 22 */3 * *").onRun(sendNeedHelpNotification);

//[🔔] send the notificatio of new posts after every three days at night (8.p.m) schedule pattern ("0 20 */3 * *")
exports.sendDailySeekingAdviceNotification = functions.pubsub.schedule("0 20 */3 * *").onRun(sendNotificatinSeekingAdvice);

//[🔔] send the notificatio of share your day after every 4 days at night (6.p.m) schedule pattern ("0 18 */3 * *")
exports.sendDailyShareYourDayNotification = functions.pubsub.schedule("0 22 */4 * *").onRun(sendShareYourDayNotification);

//[🔔] send the notificatio of new posts after every 4 days at night (4.pm) schedule pattern ("0 15 */3 * *")
exports.sendDailyOnNewPostNotification = functions.pubsub.schedule("0 20 */4 * *").onRun(sendNotificatinOnNewPost);

/**
 * @deprecated Remove user activity, as it is not needed anymore (as per almog's request)

/// 
///[🔔 UserActivityNotification] Run Weekly to populate FCM Tokens with user activity
exports.pubSubPopulateFCMTokensWithUserActivity = functions
  .runWith({ memory: '4GB', timeoutSeconds: 540 })
  .pubsub.schedule('0 0 * * 1')
  .onRun(populateFCMTokensWithUserActivity);
 */
///[🔔 UserActivityNotification] Run Daily to enqueue for all users
exports.scheduleUserActivityBasedNotifications = functions
  .runWith({ memory: '4GB', timeoutSeconds: 540 })
  .pubsub.schedule('0 1 * * *')
  .timeZone('Asia/Jerusalem') // Set the time zone to Israel
  .onRun(enqueueForAllUsers);


// Function to update google sheet with daily analytics
exports.sendDailyAnalytics = functions
  .runWith({ memory: '4GB', timeoutSeconds: 540 })
  .pubsub.schedule('50 23 * * *')
  .timeZone('Asia/Jerusalem') // Set the time zone to Israel
  .onRun(async (_) => {
    await saveDailyAnalyticUpdates();
    return null;
  });


// Function to update google sheet with weekly analytics
exports.sendWeeklyAnalytics = functions
  .runWith({ memory: '4GB', timeoutSeconds: 540 })
  .pubsub.schedule('50 23 * * 0') // This will run at 23:50 (11:50 PM) every Sunday
  .timeZone('Asia/Jerusalem') // Set the time zone to Israel
  .onRun(async (_) => {
    await saveWeeklyAnalyticUpdates();
    return null;
  });




 /* ********************************************************************************************
                                 video analysis http callable functions
*********************************************************************************************/
exports.callVideoAnalysis = functions.https.onRequest(async (req, resp) => {
  // Call the analyzeVideo function
  try {
    const videoURL = req.body.videoUri;
      console.log('data is =>', JSON.stringify(req.body.videoUri));
      const result = await analyzeVideo(videoURL);
      return resp.send(result);
  } catch (error) {
      console.error('Error calling Video Intelligence API:', JSON.stringify(error));
      return resp.send({ isFlagged: false });
  }
});