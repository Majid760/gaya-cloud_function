
const fs = require('fs');
const admin = require('firebase-admin');
const db = admin.firestore();
const kFileName = 'user.json';
const utils = require('./utils/helpers.js');
const { FieldValue, Timestamp } = require("firebase-admin/firestore");
const DEFAULT_SHEET_ID = '11cXM4DM_eL6q_nOhlD-Rtna0OOm1xdxH6Rr8cJgnGPs';

const { writeRawDataIntoGoogleSheet } = require('./features/analytics-sheet/analytics-sheet-services/analytics_sheet_services.js');
const {DEFAULT_CUBE_ID, DEFAULT_FIREBASE_ID} = require("./features/pubsub/love-message/helpers/const.js");
const { insertAComment } = require('./common/post_services.js');
const { analyzeVideo } = require('./features/google-apis/video_intelligence_api.js');


const onTestHttps = async (req, res) => {
    const url =  "https://firebasestorage.googleapis.com/v0/b/girlz-dev.appspot.com/o/posts%2Fvideos%2F5ewSjXnkeTcEkZtCNYv2zyiZ45y2%2Fnudity_test_video.mp4?alt=media&token=00777f8f-de3b-4e5c-a2f2-854b640dd2fb";
    const result = await analyzeVideo(url);
    console.log(result);
    // const {runExport} = require('./features/analytics-sheet/big-query/queries/export_bigquery.js');
    // const response = await runExport();
    // utils.makeFile("user_time_spent_hourly_per_month1.json", response);
    
    // const payload = {
    //     "postId": 37720,
    //     "content": "Hi this is from girlz BESTIE",
    //     "author": {
    //         "dob": "2010-12-12",
    //         "cubeId": DEFAULT_CUBE_ID,
    //         "uid": DEFAULT_FIREBASE_ID,
    //     }
    // }
    // const response =  await insertAComment(payload);
    // console.log(response);
    // const {call} = require('./triggers/counts/tests/test_counts.js');
    // call();
    return res.status(200).send("done");
    // const {call} = require('./tasks/tests/tts_test.js');
    // const {createTTSForPostById} = require('./common/rest-api-services/tts_http_services.js');
    // const id = req.query.id || "2536678";
    // const text = req.query.text || "hello I'm new here let me ask a random question... what is the best perfume you have ever used!?";
    // const response = await call(id, text);
    // await createTTSForPostById(id, response.audioUrl, response.transcript);
    // return res.status(200).send(response);
    // const {call} = require('./features/notifications/user_activity/tests/tests.js');
    // await call();
    // const {call } = require("./tasks/tests/post_tasks_test.js");
    // call();
    // console.log(`********** onTestHttps START **********`);
    // // await processUsers();

    // const { saveDailyAnalyticUpdates } = require('./features/analytics-sheet/analytics_sheet.js');
    // await saveDailyAnalyticUpdates();


    // const response = await getWeeklyActiveUsers();
    // // console.table(response);
    // console.log(response);
    // // await runReport();

    // // start and end time of below function
    // const start = new Date();
    // console.log(`--------------> TEST start time: ${start}`);
    // await saveUserData(kFileName);
    // const end = new Date();
    // console.log(`--------------> TEST end time: ${end}`);

    // await sendNotificatinSeekingAdvice();

    // // Getting all users
    // const users = await db.collection("users").get();
    // console.log(`users count: ${users.docs.length}`);

    // let allUsers = [];
    // try {
    //   let pageToken;
    //   do {
    //     const listUsersResult = await admin.auth().listUsers(1000, pageToken);
    //     allUsers = allUsers.concat(listUsersResult.users);
    //     pageToken = listUsersResult.pageToken;
    //   } while (pageToken);
    //   console.error('total users::', allUsers.length);

    // } catch (error) {
    //   console.error('_getProvidersBasedAuthUserCount:', error);
    // }


    // const { saveDailyAnalyticUpdates } = require('./features/analytics-sheet/analytics_sheet.js');
    // await saveDailyAnalyticUpdates();

    // const {onAuthUserCreate } = require("./triggers/users/user_functions.js");
    // const user = {
    //     'uid': '1111111111',
    //     'email': `testing@connectycube.com`,
    //     'phoneNumber': 11111111,
    //     'profilePhoto': '',
    //     'userName': 'testing',
    // }
    // await onAuthUserCreate(user);
    // return;


    // <<<<<<< HEAD
    //      const {getScollPostsAverageByUsers} = require('./features/analytics-sheet/exports/export_average_posts_scrolling.js');
    //      await getScollPostsAverageByUsers();
    //     //  const {exportLastTwoWeeksMessagesToExcelSheet} = require('./features/analytics-sheet/exports/last_2_week_messages.js');
    //     //  await exportLastTwoWeeksMessagesToExcelSheet();
    // =======
    //     const {generateAndAddAiAnswersListToPost} = require('./common/gpt-services/gpt.js');
    //     //  const {call} = require('./features/notifications/user_activity/tests/tests.js');
    //     //  await call();
    // >>>>>>> origin/bahadur/userActivityNotifications
    // const {call} = require('./triggers/onCCMessage/girlBestie/test/onboarding_test.js')
    // call();
    // const {call} = require('./features/pubsub/love-message/test/send_message_test_byPost.js')

    // call();


    // const {generateTagsHTTPS} = require('./common/gpt-services/gpt.js')
    // const reqObj = {
    //     body: {
    //         content: "I love real people!"
    //     }
    // }
    // return generateTagsHTTPS(reqObj, res);


    // const clearStaleFCMTokens = require('./features/notifications/stale_tokens.js').clearStaleFCMTokens;
    // await clearStaleFCMTokens();
    // const ccTest = require('./features/connecty-cube/connectycube_services.js')
    // const message = require('./configs/consts.js').welcomeToAppMessage;
    // const {GIRLZ_BESTIE_CUBE_ID, GIRLZ_BESTIE_FIREBASE_ID} = require('./features/pubsub/love-message/helpers/const.js')
    // const recieverCubeId = 10877567;
    // const senderCubeId = GIRLZ_BESTIE_CUBE_ID;
    // const senderFirebaseId = GIRLZ_BESTIE_FIREBASE_ID;
    // const isMessageFromGirlzBestie = true;

    // const {call} = require('./tasks/tests/send_10_prcnt_tests.js')
    // call();

    // const {scrapeProfile} = require('./features/scraping/scrape.js');
    // const response = await scrapeProfile({type: 'instagram', username: 'bahadur.zamaasdn'})
    // const response2 = await scrapeProfile({type: 'snapchat', username: 'bahado97'})
    // console.log(response);
    // console.log(`response2: ${JSON.stringify(response2)}`);
    // const startDate = 1693940400;
    // const endDate = 1695409200;

    // const { subscribeAllUsersToLoveMessage } = require('./playground.js');
    // await subscribeAllUsersToLoveMessage();


    // testign here done by mak
    // await sendDailyNeedHelpNotification();
    // await testDailyNotificationMethod();








    // const { subscribeAllUsersToLoveMessage } = require('./playground.js');


    // const cc = require("./features/connecty-cube/connectycube_services.js")

    // const senderFirebaseId =  "NS3Uf39M3LSbsWldx4hW12XWqJ72";
    // cc.getCubeIdByFirebaseId(senderFirebaseId);
    // const receiverId =  10877567;
    // const senderFirebaseId =  "NS3Uf39M3LSbsWldx4hW12XWqJ72"; /// bot firebaseId
    // const senderCubeId =  10721361; /// bot cubeId
    // const Content =  "I love real people!";
    // cc.sendMessage(senderCubeId, senderFirebaseId, receiverId, Content);
    // SEND LOVE MESSAGE ===============================
    // const dequeTest = require('./features/pubsub/love-message/test/send_message_test_byPost.js')
    // dequeTest.call();

    // const gpt = require('./common/gpt-services/gpt.js').generateLoveMessage;

    // const data = "I love real people!";

    // const resp = await gpt(data);
    // console.log(resp);


    // /// Array of user sub collections String
    // const userSubCollections = [
    //     "blockedUsers",
    //     "chatRooms",

    //    ]

    //    userSubCollections.forEach((collectionName)=>{

    //    });




    // const cc = require('./features/connecty-cube/connectycube_services.js')
    // const user = require('./common/user_services.js')
    // const userId = "Jcn26eTrwdghYFiU5PhSfSYdtd22"; 
    // cc.deleteUserInConnectyCube(userId) 




    console.log(`********** onTestHttps END**********`);
    return res.status(200).send('ok');
};


module.exports = {
    onTestHttps
}


// const fs = require('fs');
// const admin = require('firebase-admin');
// const db = admin.firestore();
// const kFileName = 'openedAppCohorts.json';
// const utils = require('./utils/helpers.js');
// const { FieldValue, Timestamp } = require("firebase-admin/firestore");

// const { runBigQuery, TABLE_NAME } = require('./features/analytics-sheet/big-query/big_query.js')
// const testingBigQuery = async () => {
//     const query = `SELECT 
//     user_id,
//       ARRAY_AGG(DISTINCT event_date) as engagement_dates
//     FROM 
//       ${TABLE_NAME}
//     GROUP BY 
//       user_id`;
//     const result = await runBigQuery(query);
//     console.log(`result: ${JSON.stringify(result.length)}`);
//     let firstRow = result[0];
//     console.log(`firstRow: ${firstRow.user_id}`);
//     console.log(`firstRow: ${firstRow.engagement_dates.length}`);
//     return result[0].distinct_entries_count || 0;
// }

// function dateStringToFirestoreTimestamp(dateString) {
//     const year = dateString.substring(0, 4);
//     const month = dateString.substring(4, 6);
//     const day = dateString.substring(6, 8);
//     // return admin.firestore.Timestamp.fromDate(new Date(year, month - 1, day));
//     return Timestamp.fromDate(new Date(year, month - 1, day));
// }

// async function saveUserData(filePath) {
//     try {

//         let jsonFileUsers = await utils.loadFile('fcmTokens.json');

//         console.log(`jsonFileUsers: ${JSON.stringify(jsonFileUsers.length)}`);

//         let jsonFileUsersList = [];
//         jsonFileUsers.forEach(user => {
//             jsonFileUsersList.push(user.id);
//         });

//         let results = await utils.loadFile(kFileName);

//         let allUsers = [];

//         results.forEach(user => {
//             let engagementTimestamps = user.engagement_dates.map(dateStringToFirestoreTimestamp);
//             allUsers.push({
//                 id: user.user_id,
//                 allVisitsToApp: engagementTimestamps,
//             });
//         });

//         console.log(`allUsers.length is: ${allUsers.length}`);


//         // convert allUsers to chunks of 240 users for batch and commit 
//         let allUsersChunks = [];
//         let chunkSize = 240;
//         for (let i = 0; i < allUsers.length; i += chunkSize) {
//             let chunk = allUsers.slice(i, i + chunkSize);
//             allUsersChunks.push(chunk);
//         }

//         console.log(`allUsersChunks.length is: ${allUsersChunks.length}`);


//         let validDocsCount = 0;
//         let inValidDocsCount = 0;

//         // Process each chunk in parallel
//         // await Promise.all(allUsersChunks.map(async (chunk) => {
//         //     const batch = db.batch();
//         //     const docChecks = chunk.map(async user => {
//         //         if(user.id != ""){

//         //         const userFcmDocRef = db.collection('testFcmTokens').doc(user.id);
//         //         const doc = await userFcmDocRef.get();
//         //         if (doc.exists) {
//         //             batch.set(userFcmDocRef, { 'allVisitsToApp': user.allVisitsToApp }, { merge: true });
//         //             validDocsCount += 1;
//         //         } else {
//         //             inValidDocsCount += 1;
//         //             console.log('No such document exists! ' + inValidDocsCount);
//         //         }

//         //         }
//         //         else{
//         //             console.log('<-------------------------- DOCUMENT PATH INCORRECT -------------------------->' );
//         //         }

//         //     });

//         //     // Wait for all document checks in the current chunk
//         //     await Promise.all(docChecks);
//         //     console.log('<============================= PROMISE COMPLETED ==========================>' );

//         //     // Commit the batch
//         //     await batch.commit();
//         // }
//         // )
//         // );


//         for (const chunk of allUsersChunks) {
//             const batch = db.batch();

//             for (const user of chunk) {
//                 if (user.id != "") {
//                     // const userFcmDocRef = db.collection('testFcmTokens').doc(user.id);
//                     // const doc = await userFcmDocRef.get();

//                     // check user.id in jsonFileUsersList if it exists then set the firestore else not
//                     if (jsonFileUsersList.includes(user.id)) {
//                         const userFcmDocRef = db.collection('fcmTokens').doc(user.id);
//                         batch.set(userFcmDocRef, { 'allVisitsToApp': user.allVisitsToApp }, { merge: true });
//                         validDocsCount += 1;
//                     }
//                     else {
//                         inValidDocsCount += 1;
//                         console.log('No such document exists! ' + inValidDocsCount);
//                     }


//                     // if (doc.exists) {
//                     //     batch.set(userFcmDocRef, { 'allVisitsToApp': user.allVisitsToApp }, { merge: true });
//                     //     validDocsCount += 1;
//                     // } else {
//                     //     inValidDocsCount += 1;
//                     //     console.log('No such document exists! ' + inValidDocsCount);
//                     // }
//                 } else {
//                     console.log('<-------------------------- DOCUMENT PATH INCORRECT -------------------------->');
//                 }
//             }

//             // After processing the chunk, commit the batch
//             await batch.commit();
//             console.log('<============================= BATCH COMMITTED ==========================>');
//         }

//         console.log('validDocsCount: ' + validDocsCount);
//         console.log('inValidDocsCount: ' + inValidDocsCount);

//     } catch (error) {
//         console.error('Error saving user data:', error);
//     }
// }
// const {BetaAnalyticsDataClient} = require('@google-analytics/data');
// const prodServiceAcc = require("./production-dev.json");
// async function getWeeklyActiveUsers() {
//     const client = new BetaAnalyticsDataClient(
//       {
//         credentials: prodServiceAcc
//     }
//     );
//     const property_id = "404477080"
//     const [response] = await client.runReport({
//         property: `properties/${property_id}`,
//         // Note: Removed dateRanges from the top-level, as it's not used in cohort requests
//         dimensions: [
//           {name: 'cohort'},
//           {name: 'cohortNthWeek'},
//         ],
//         metrics: [
//           {name: 'activeUsers'},
//         ],
//         cohortSpec: {
//           cohorts: [{
//             name: 'cohort1',
//             dimension: 'firstSessionDate',
//             dateRange: {
//               startDate: '2023-11-01', // Adjust this to your cohort's actual start date
//               endDate: '2024-02-01', // Adjust this to your cohort's actual end date
//             },
//           }],
//           cohortsRange: {
//             granularity: 'MONTHLY',
//             startOffset: 0, // The start of the data range for analysis relative to the cohort's startDate
//             endOffset: 4, // Assuming you want to analyze 4 weeks from the start of the cohort, adjust as necessary
//           },
//         },
//       });
//       console.table(response.rows);
//       console.log(JSON.stringify(response.rows, null, 2));
//     return Number(wau) || 0;
// }

// const top30Users = {
//     "11265691": 9620,
//     "10807477": 9084,
//     "11538685": 8356,
//     "11296793": 8130,
//     "11338621": 6722,
//     "11524352": 6133,
//     "11225427": 6110,
//     "11434012": 5754,
//     "11708596": 5077,
//     "11211189": 4967,
//     "11457783": 4672,
//     "11508308": 4552,
//     "11509587": 4527,
//     "11412844": 4516,
//     "11309314": 4442,
//     "11203613": 4241,
//     "11309075": 4061,
//     "11231452": 3990,
//     "11447465": 3869,
//     "11398209": 3801,
//     "11491232": 3706,
//     "11674894": 3632,
//     "11346838": 3588,
//     "11454281": 3484,
//     "11566362": 3410,
//     "11522612": 3377,
//     "11233975": 3335,
//     "11170319": 3318,
//     "11347111": 3259,
//     "11759842": 3237,
//     "11759948": 3230,
//     "11409916": 3224,
//     "11672637": 3217,
//     "11572300": 3172
// };


// function dateStringToFirestoreTimestamp(dateString) {
//     const year = dateString.substring(0, 4);
//     const month = dateString.substring(4, 6);
//     const day = dateString.substring(6, 8);
//     // return admin.firestore.Timestamp.fromDate(new Date(year, month - 1, day));
//     return `${day}/${month}/${year}`; // (year, month - 1, day));
// }

// async function processUsers() {
//     try {
//         let finalSheetData = [];


//         let userInfoHeadings = ['User Id', 'User Name', 'Email', 'Phone', 'Total Messages Sent/Received'];

//         finalSheetData.push(userInfoHeadings);

//         // get all keys of top30Users and save in keys array
//         let keys = Object.keys(top30Users);

//         // // print 1st index value of top30Users
//         // console.log(`top30Users: ${top30Users[keys[0]]}`);

//         // return;

//         // for loop on keys
//         for (let i = 0; i < keys.length; i++) {
//             let userInfoRow = [];
//             let userRef = db.collection('users');

//             let querySnapshot = await userRef.where('cubeId', '==', parseInt(keys[i])).limit(1).get();

//             if (querySnapshot.empty) {
//                 console.log('No such document!');
//             } else {
//                 let doc = querySnapshot.docs[0];
//                 let docId = doc.id;

//                 let messagesCount = top30Users[keys[i]];

//                 let userData = doc.data();

//                 userInfoRow = [
//                     docId || '',
//                     userData.userName || '',
//                     userData.email || '',
//                     userData.phoneNumber || '',
//                     messagesCount || ''
//                 ];

//                 finalSheetData.push(userInfoRow);

//             }
//         }
//         console.table(finalSheetData);
//         const sheetName = 'Top30UsersInfo';
//         const sheetId = DEFAULT_SHEET_ID;
//         const rangeStartingPoint = 'A2';

//         await writeRawDataIntoGoogleSheet(finalSheetData, sheetName, sheetId, rangeStartingPoint);

//         return;



//         // get firestore users collections doc data and print where user id is  = 3TqhX9yM0bhqumgthFB1RoWzftj2
//         const userRef = db.collection('users').doc('3TqhX9yM0bhqumgthFB1RoWzftj2');
//         const doc = await userRef.get();


//         finalSheetData.push(userInfoHeadings);
//         finalSheetData.push(userInfoRow);
//         finalSheetData.push(['']);
//         finalSheetData.push(['']);

//         let messagesHeaderRow = ['User Id', 'Message', 'Sent Time', 'Chatroom Id', 'Post Id'];
//         finalSheetData.push(messagesHeaderRow);

//         // Step 1: Read the original JSON file
//         const users = await utils.loadFile(kFileName);

//         console.log('messages LENGTH: ' + users.length);

//         //   const users = JSON.parse(data);

//         let chatroomIds = [];

//         // Step 2: Process the data
//         // Example processing: Anonymize email addresses
//         const processedUsers = users.map(user => {
//             const userId = user.event_params.find(param => param.key === 'userId') || { value: { string_value: '' } };
//             const message = user.event_params.find(param => param.key === 'message') || { value: { string_value: '' } };
//             const sentTime = user.event_date; // Adjusted below
//             const chatroomId = user.event_params.find(param => param.key === 'dialog_id') || { value: { string_value: '' } };
//             const postId = user.event_params.find(param => param.key === 'post_id') || { value: { string_value: '' } };

//             // check if chatroom exists in chatroomIds array if not then add it
//             if (!chatroomIds.includes(chatroomId.value.string_value)) {
//                 chatroomIds.push(chatroomId.value.string_value);
//             }



//             let dateTime = dateStringToFirestoreTimestamp(sentTime);

//             let messagesArray = [
//                 userId.value.string_value,
//                 (message.value.string_value != '') ? message.value.string_value : 'Post Message',
//                 sentTime ? dateTime : '',
//                 chatroomId.value.string_value,
//                 postId.value.string_value
//             ];

//             finalSheetData.push(messagesArray);

//             return {
//                 "User Id": userId.value.string_value,
//                 "Message":
//                     // check if message is empty then save as Post Reply
//                     (message.value.string_value != '') ? message.value.string_value : 'Post Message',
//                 "Sent Time": sentTime ? dateTime : '', // Check if sentTime exists
//                 "Chatroom Id": chatroomId.value.string_value,
//                 "Post Id": postId.value.string_value,
//             };
//         });

//         // utils.makeFile('userAllData.json', processedUsers);

//         console.table(finalSheetData);

//         // const sheetName = 'Specific User Data';
//         // const sheetId = DEFAULT_SHEET_ID;
//         // const rangeStartingPoint = 'A2';

//         // await writeRawDataIntoGoogleSheet(finalSheetData, sheetName, sheetId, rangeStartingPoint);

//         console.log('User data processed and saved successfully.');
//     } catch (error) {
//         console.error('Error processing user data:', error);
//     }
// }
