const admin = require("firebase-admin");
const db = admin.firestore();
const { getSentMessagesTotal } = require('../message/messages_services.js');
const { initialCCDate, initialFirestorePostDate, fixedCalendarStartDate, initialGCPMessagesDate, initialOpenAppCohortDate, initialTwentyOneWeekCohortDate } = require('../consts.js');
const { getWeeklyDateAsKeys, getFixedCalendarWeeks, getDayStartAndEndMillis, getTodayDateInMillisFormat, getNextDateInMillisFormat, getWeeklyFixedDatesAsKeys, getAllAvailableWeeks } = require('../helper_methods.js');
var { google } = require('googleapis');
const stateApi = require('./../../connecty-cube/admin-sdk/cc_axios_api.js');
// const sheets = google.sheets('v4');
// const auth  = require('google-auth-library');
const { GoogleAuth } = require('google-auth-library');
const { getChatroomBottomLines } = require('./bottom-lines/chatroom_services.js');
const { getMessagesBottomLines, getUsersThatMessagedAtleastOnceBottomLine } = require('./bottom-lines/messages_services.js');
const { getUsersRegBottomLines } = require('./bottom-lines/user_registration_services.js');
const { getInvitesBottomLine } = require('./bottom-lines/invite_services.js');
const { getPostBottomLines, usersPostedAtLeastOnce, getDailyPostCount,
  getAllPostsFromGCP
} = require('./bottom-lines/post_services.js');
const { getActiveSubscribersBottomLines } = require('./bottom-lines/active_subscribers_services.js');
const { getDailyTotalReceivedNotifications, getDailyTotalOpenedNotifications } = require('./bottom-lines/notifications_services.js');

const { getLockConversationLimitCount } = require('./bottom-lines/lock_conversations_popup_services.js');
const { getTodaysTotalPurchasesCount, getTodaysPurchasesCount } = require('./bottom-lines/rc_purchase_services.js');
const { getTodaysTotalUsersWhoOpenedInstaShareBottomsheetCount, getTodaysTotalUsersWhoActuallySharedTheStoryToInstagram } = require('./bottom-lines/instagram_share_services.js');
const { getProvidersBasedAuthUserAndUnverifiedUsersCountSheetRawData } = require('./bottom-lines/auth_providers_services.js');
const { getWeeklyMessagesDataFromGcp } = require('../big-query/queries/cc_messages_from_gcp.js');
const { getSingleDayCrownsPerformance } = require('../exports/export_crown_performance.js');
const { getDailyTotalScrollsAndAverageScrollsPerUserCounts } = require('./bottom-lines/scrolls_flips_services.js');
const { getFirebaseAuthLoggedInUsersPercentage } = require('./bottom-lines/loggedIn_users_services.js');
const { getRevealStatsCount } = require('./bottom-lines/reveal_stats_services.js');
const { getDailyAppDownloadsCount } = require('./bottom-lines/app_downloads_services.js');
const { getDailyAverageTimeSpentByUser } = require('./bottom-lines/average_spent_time_by_user.js');
const { getActiveUsersCount } = require('./bottom-lines/active_users.js');
const { getDailyAnswersCountOnPosts } = require('../top_posts_and_their_responses/services/post_responses_services.js');


const DEFAULT_SHEET_ID = '11cXM4DM_eL6q_nOhlD-Rtna0OOm1xdxH6Rr8cJgnGPs';
const NEW_SHEET_ID = '14YVUuK9tG_sCuiDqVfID_2HLx9WYVn5X3uRtTmv_jrk';
const { ADMIN_CREDENTIAL } = require('./../../../configs/api_keys.js')
/**
 * Fetch Day beofre today bottomline and write into google sheet.
 * 
 * @returns {Promise<void>} - A promise that resolves when the bottomline is written to the google sheet.
 */
const runBottomLinesForCurrentDay = async () => {

  /// Getting today's bottom lines data only (daily)
  const chatroomData = await getChatroomBottomLines(true, false, false); 
  const messagesData = await getMessagesBottomLines(true, false, false); 
  const usersRegData = await getUsersRegBottomLines(true, false, true);
  const postsData = await getDailyPostCount(true, false, false);
  const usersPostedAtLeastOnceCount = await usersPostedAtLeastOnce();
  const invitesData = await getInvitesBottomLine();
  const usersThatMessagedAtleastOnceCountData = await getUsersThatMessagedAtleastOnceBottomLine();
  const activeNotificationsSubcribersCount = await getActiveSubscribersBottomLines(true, false, false);
  const totalReceivedNotificationsCount = await getDailyTotalReceivedNotifications();
  const totalOpenedNotificationsCount = await getDailyTotalOpenedNotifications();
  const dialyScrollsData = await getDailyTotalScrollsAndAverageScrollsPerUserCounts();
  const todaysLoclMessageLimitCount = await getLockConversationLimitCount();
  // const todaysPurchasesCount = await getTodaysTotalPurchasesCount();
  const purchasesCount = await getTodaysPurchasesCount();
  const revealCounts = await getRevealStatsCount();
  const dailyAppDownloads = await getDailyAppDownloadsCount();
  const dailyAverageTimeSpentByUser = await getDailyAverageTimeSpentByUser();
  const activeUsersCount = await getActiveUsersCount();
  const dailyAnswersOnPostsCount = await getDailyAnswersCountOnPosts(); 
  
  const dailyCrownsSentCount = await getSingleDayCrownsPerformance();
  const usersWhoOpenedInstaShareBottomsheet = await getTodaysTotalUsersWhoOpenedInstaShareBottomsheetCount();
  const usersWhoActuallySharedTheStoryToInstagram = await getTodaysTotalUsersWhoActuallySharedTheStoryToInstagram();


  let dailyReports = {
    'invites': invitesData.totalInvitesSentCount || 0,
    'usersReg': usersRegData.dailyCount || 0,
    'chatrooms': chatroomData.dailyCount || 0,
    'messages': messagesData.dailyCount || 0,
    'totalUsers': usersRegData.totalCount || 0,
    'posts': postsData || 0,
    'usersSendingInvites': invitesData.usersThatSentInviteCount || 0,
    'usersMessagedAtLeastOnce': usersThatMessagedAtleastOnceCountData || 0,
    'usersPostedAtLeastOnce': usersPostedAtLeastOnceCount || 0,
    'activeNotificationsSubscribers': activeNotificationsSubcribersCount || 0,
    'totalPostView': dialyScrollsData.dailyCount || 0,
    'totalReceivedNotificationsCount': totalReceivedNotificationsCount || 0,
    'totalOpenedNotificationsCount': totalOpenedNotificationsCount || 0,
    'dailyCrownsSentCount': dailyCrownsSentCount || 0,
    // 'totalScrolls': dialyScrollsData.dailyCount || 0,
    'scrollsPerUser': dialyScrollsData.averageCount || 0,
    'todaysLoclMessageLimitCount': todaysLoclMessageLimitCount || 0,
    // 'todaysPurchasesCount': todaysPurchasesCount || 0,
    'usersWhoOpenedInstaShareBottomsheet': usersWhoOpenedInstaShareBottomsheet || 0,
    'usersWhoActuallySharedTheStoryToInstagram': usersWhoActuallySharedTheStoryToInstagram || 0,
    // 'dailyLoginUsersPercentage': `${dailyLoginUsersPercentage}%` || '0%',
    'totalPurchases': purchasesCount["totalPurchases"] || 0,
    'notificationPurchase': purchasesCount["notificationPurchase"] || 0,
    'homeScreenPurchase': purchasesCount["homeScreenPurchase"] || 0,
    'conversationPurchase': purchasesCount["conversationPurchase"] || 0,
    'inviteFriendsPurchase': purchasesCount["inviteFriendsPurchase"] || 0,
    'restorePurchase': purchasesCount["restorePurchase"] || 0,
    'totalRevealRequests': revealCounts["totalRevealRequests"] || 0,
    'totalRevealRequestsAccepted': revealCounts["totalRevealRequestsAccepted"] || 0,
    'totalRevealRequestsDeclined': revealCounts["totalRevealRequestsDeclined"] || 0,
    'totalRevealRequestsPending': revealCounts["totalRevealRequestsPending"] || 0,
    'dailyAppDownloads': dailyAppDownloads || 0,
    'dailyAverageTimeSpentByUser': dailyAverageTimeSpentByUser || 0,
    'activeUsersCount': activeUsersCount || 0,
    'dailyAnswersOnPostsCount': dailyAnswersOnPostsCount || 0
  }

  console.log(`~ DAILY REPORTS ~`);
  console.table(dailyReports);
  const gRawData = __convertDailyReportsIntoGoogleSheetRawData(dailyReports);
  const sheetName = 'Base';

  console.log(`~ DAILY gRawData ~`);
  console.table(gRawData);

  /// Write daily reports into google sheet
  await addNewColumnToSheet(
    NEW_SHEET_ID,
    sheetName, gRawData);
}
/**
 * Get user and post reports.
 */
const getBottomLinesData = async () => {
  try {
    return await runBottomLinesForCurrentDay();

    /**
     * Not using this function for now (as we have shifted to new list for `bottom lines` -> `bottoms` 👍🏻)
      const chatroomData = await getChatroomBottomLines();
    const messagesData = await getMessagesBottomLines();
    const usersRegData = await getUsersRegBottomLines();
    const inviteData = await getInviteBottomLines();
    /// @Info: Information should be ['Total Invites', 'Total User Registerations', 'Total Chatrooms', 'Total Messages'];
    let weeklyReports = {
      'invites': inviteData.weeklyCount,
      'usersReg': usersRegData.weeklyCount,
      'chatrooms': chatroomData.weeklyCount,
      'messages': messagesData.weeklyCount,
    }

    const dailyReports = {
      'invites': inviteData.dailyCount,
      'usersReg': usersRegData.dailyCount,
      'chatrooms': chatroomData.dailyCount,
      'messages': messagesData.dailyCount,
    }

    const totalReports = {
      'invites': inviteData.totalCount,
      'usersReg': usersRegData.totalCount,
      'chatrooms': chatroomData.totalCount,
      'messages': messagesData.totalCount,
    }
    const bottomLinesRawData = await getBottomLinesGoogleSheetRawData(dailyReports, weeklyReports, totalReports);


    if (bottomLinesRawData) {
      console.log('bottomLinesRawData.length is: ', bottomLinesRawData)
      await writeRawDataIntoGoogleSheet(bottomLinesRawData, 'Bottom Lines', '11cXM4DM_eL6q_nOhlD-Rtna0OOm1xdxH6Rr8cJgnGPs', 'A1');
    } else {
      console.log('bottomLinesRawData.length is: ', bottomLinesRawData.length);
    }
     */

  }
  catch (_) {
    console.log('error occured in getBottomLinesData(): ', _);
  }

}


/**
 * Get Providers Based Auth User Count i.e: Email, Google, Apple, Phone and Unverified Users Count
 */
const getProvidersBasedAuthUserCountAndUnverifiedUsersData = async (chunkedUsers) => {
  try {
    return await runGetProvidersBasedAuthUserAndUnverifiedUsersCount(chunkedUsers);
  }
  catch (_) {
    console.log('error occured in getProvidersBasedAuthUserCountAndUnverifiedUsersData(): ', _);
  }

}
/**
 * Fetch Providers Based Auth User Count data i.e: Email, Google, Apple, Phone and Unverified Users Count and write into google sheet.
 * 
 * @returns {Promise<void>} - A promise that resolves when the Providers Based Auth User Count is written to the google sheet.
 */
const runGetProvidersBasedAuthUserAndUnverifiedUsersCount = async (chunkedUsers) => {
  try {
    /// Getting today's bottom lines data only (daily)
    const authProviderBasedUsersCountAndUnverifiedUsersCountData = await getProvidersBasedAuthUserAndUnverifiedUsersCountSheetRawData(chunkedUsers);

    const sheetName = 'Auth Provider User Count';

    await writeRawDataIntoGoogleSheet(authProviderBasedUsersCountAndUnverifiedUsersCountData, sheetName, NEW_SHEET_ID, 'A1');
  }
  catch (_) {
    console.log('error occured in runGetProvidersBasedAuthUserAndUnverifiedUsersCount(): ', _);
  }



}


/**
 * Writing bottom lines data (total registrations, invites, chatrooms and messages) for google sheet. 

* @param {invites: string, usersReg: string, chatrooms: string, messages: string} dailyReports - daily reports data
* @param {invites: string, usersReg: string, chatrooms: string, messages: string} weeklyReports - weekly reports data
* @param {invites: string, usersReg: string, chatrooms: string, messages: string} totalReports - total reports data
* @returns {Promise<array>} - bottom lines raw data 

*/
const getBottomLinesGoogleSheetRawData = async (dailyReports, weeklyReports, totalReports) => {

  try {
    let mapKeys = ['Total Invites', 'Total User Registerations', 'Total Chatrooms', 'Total Messages'];

    // Add a header row
    let headerRow = [
      'Bottom Line Data',
      ...mapKeys
    ];

    // Create an array to store bottom line data counts for sheet
    let bottomLineRawDataRow = [];

    // set header row in final sheet raw data
    bottomLineRawDataRow.push(headerRow);


    /// Calculates total bottom line data counts
    let totalRow = [
      'Total',
      totalReports.invites,
      totalReports.usersReg,
      totalReports.chatrooms,
      totalReports.messages
    ];

    /// Calculates Weekly bottom line data counts
    let weeklyRow = [
      'Weekly',
      weeklyReports.invites,
      weeklyReports.usersReg,
      weeklyReports.chatrooms,
      weeklyReports.messages
    ];

    /// Calculates Daily bottom line data counts
    let dailyRow = [
      'Daily',
      dailyReports.invites,
      dailyReports.usersReg,
      dailyReports.chatrooms,
      dailyReports.messages
    ];



    // set single row in final sheet raw data


    bottomLineRawDataRow.push(dailyRow);
    bottomLineRawDataRow.push(weeklyRow);
    bottomLineRawDataRow.push(totalRow);
    return bottomLineRawDataRow;

  } catch (error) {
    console.log("error occured in getBottomLinesGoogleSheetRawData() " + error);
  }
}

/**
 * Getting yesterday already explained at parent of this function.
 * @returns {String} - yesterday's date in dd/mm/yyyy format
 */
function getYesterdayDateAsDDMMYYYY() {
  const today = new Date();
  today.setDate(today.getDate() - 1); //// Revert to 1 day
  const dd = today.getDate();
  const mm = today.getMonth() + 1;
  const yyyy = today.getFullYear();

  return `${dd}/${mm}/${yyyy}`;

}


/**
 * Convert Reports data into google sheet raw data.
 *  
 */
const __convertDailyReportsIntoGoogleSheetRawData = (dailyReports) => {


  // Get the yesterday date as the header dd/mm/yyyy
  const todayDate = getYesterdayDateAsDDMMYYYY();

  // Define the header row
  const titlesRow = [
    'Dates',
    'Actions',
    '',
    'Daily Active Users',
    'New App Downloads',
    'New Users Registered',
    'Invites Sent',
    'New Posts',
    'Total Messages Sent/Receive',
    'Total Posts View',
    'New Notifications Opened',
    'New Crowns Sent',
    // 'New Scrolls',
    // 'Users Converted To Pro',
    'Seen Social Media Gate', // 'Users Who Tapped Snap Share',
    'Tapped Social Media Button', // 'Users Who Actually Shared The Story To Snapchat',
    'Answers Per Day', 
    '',
    'Stats',
    '',
    'Users sending invite',
    'Users that messaged at least once',
    'Users that posted at least once',
    'Total Chatrooms',
    'Total Users Registered',
    'Active Subscribers',
    'Total Notifications Received',
    'Scrolls Per User',
    'Users With Locked Conversation Limit',
    'Average Spent Time By User In Minutes',
    // '1 Day Retention'
    '',
    'Purchases',
    '',
    'Pro users',
    'Notification purchases',
    'Feed purchases',
    'Conversation purchases',
    'Invite friends purchases',
    'Restore purchases',
    '',
    'Reveal Stats',
    '',
    'Total Reveal Requests',
    'Total Reveal Requests Accepted',
    'Total Reveal Requests Declined',
    'Total Reveal Requests Pending',

  ];

  // Create an array to store the column-based data for the sheet
  const columnBasedData = [
    titlesRow,
    [
      todayDate,
      '',
      '',
      dailyReports.activeUsersCount,
      dailyReports.dailyAppDownloads,
      dailyReports.usersReg,
      dailyReports.invites,
      dailyReports.posts,
      dailyReports.messages,
      dailyReports.totalPostView,
      dailyReports.totalOpenedNotificationsCount,
      dailyReports.dailyCrownsSentCount,
      // dailyReports.totalScrolls,
      // dailyReports.todaysPurchasesCount,
      dailyReports.usersWhoOpenedInstaShareBottomsheet,
      dailyReports.usersWhoActuallySharedTheStoryToInstagram,
      dailyReports.dailyAnswersOnPostsCount,
      '',
      '',
      '',
      dailyReports.usersSendingInvites,
      dailyReports.usersMessagedAtLeastOnce,
      dailyReports.usersPostedAtLeastOnce,
      dailyReports.chatrooms,
      dailyReports.totalUsers,
      dailyReports.activeNotificationsSubscribers,
      dailyReports.totalReceivedNotificationsCount,
      dailyReports.scrollsPerUser,
      dailyReports.todaysLoclMessageLimitCount,
      dailyReports.dailyAverageTimeSpentByUser,
      // dailyReports.dailyLoginUsersPercentage
      '',
      '',
      '',
      dailyReports.totalPurchases,
      dailyReports.notificationPurchase,
      dailyReports.homeScreenPurchase,
      dailyReports.conversationPurchase,
      dailyReports.inviteFriendsPurchase,
      dailyReports.restorePurchase,
      '',
      '',
      '',
      dailyReports.totalRevealRequests,
      dailyReports.totalRevealRequestsAccepted,
      dailyReports.totalRevealRequestsDeclined,
      dailyReports.totalRevealRequestsPending

    ]
  ];
  return transposeTable(columnBasedData);
};

/**
 * Convert Reports data into google sheet raw data.
 *  
 */
const __convertMessagesPerUserIntoGoogleSheetRawData = (messagesPerUser) => {

  // Define the header row
  const titlesRow = [
    'Groups // Messages per user (users count)',
    '0 Messages',
    '1 Message',
    '2 Messages',
    '3-7 Messages',
    '8-20 Messages',
    '21-50 Messages',
    '51-100 Messages',
    '101-200 Messages',
    '201+ Messages'
  ];

  // Create an array to store the column-based data for the sheet
  const columnBasedData = [
    titlesRow,
    [
      'Week1',
      messagesPerUser['0 Messages'],
      messagesPerUser['1 Message'],
      messagesPerUser['2 Messages'],
      messagesPerUser['3-7 Messages'],
      messagesPerUser['8-20 Messages'],
      messagesPerUser['21-50 Messages'],
      messagesPerUser['51-100 Messages'],
      messagesPerUser['101-200 Messages'],
      messagesPerUser['201+ Messages']
    ]
  ];

  return transpose(columnBasedData);



};

// Function to transpose a matrix (convert rows to columns and vice versa)
function transpose(matrix) {
  return matrix[0].map((_, colIndex) => matrix.map((row) => row[colIndex]));
}


const transposeTable = (a) => a[0].map((_, c) => a.map((r) => r[c] === undefined ? '' : r[c] + ''))



/**
 *  @returns {number} - total app invites count
 */
const getTotalAppInvitesCount = async () => {

  try {

    const invitesCollectionRef = db.collection('messages');
    const snapshot = await invitesCollectionRef.count().get();

    const invitesCount = snapshot.data().count;
    if (!invitesCount) return;

    return invitesCount;

  }
  catch (error) {
    console.log("error occured in getTotalAppInvitesCount():" + error);
  }
}


/**
 *  @returns {number} - total app user registrations count
 */
const getTotalAppUserRegisterationsCount = async () => {

  try {

    const usersCollectionRef = db.collection('users');
    const snapshot = await usersCollectionRef.count().get();

    const usersCount = snapshot.data().count;
    if (!usersCount) return;

    return usersCount;

  }
  catch (error) {
    console.log("error occured in getTotalAppUserRegisterationsCount():" + error);
  }
}

/**
 *  @returns {number} - total app CC Chatrooms count
 */
const getTotalCCChatroomsCount = async () => {

  try {

    const totalChatroomsCount = await stateApi.getCCTotalChatroomsCount();

    if (!totalChatroomsCount) return;

    return totalChatroomsCount;

  }
  catch (error) {
    console.log("error occured in getTotalCCChatroomsCount():" + error);
  }
}


/**
 *  @returns {number} - total app CC Messages count
 */
const getTotalCCMessagesCount = async () => {

  try {
    const startDate = initialCCDate.getTime() / 1000;
    const endDate = new Date().getTime() / 1000;

    const totalMessagesCount = await getSentMessagesTotal(startDate, endDate);

    if (!totalMessagesCount) return;

    return totalMessagesCount;

  }
  catch (error) {
    console.log("error occured in getTotalCCMessagesCount():" + error);
  }
}

/**
 * Get user and post reports.
 * @param {array} chunkedUsers - chunkedUsers
 */
const getUsersAndPostsReportsData = async (chunkedUsers) => {
  try {


    // getting all users and posts types of reports in the app
    let usersAndReports = {};
    usersAndReports = await getUsersAndPostsReportsDocs(chunkedUsers);

    if (!usersAndReports) return;

    // Calling getUsersAndPostsGoogleSheetRawData() to get Users and Post type reports data in sheet rows format
    let usersAndPostsReportsRawData = [];
    usersAndPostsReportsRawData = await getUsersAndPostsReportsGoogleSheetRawData(usersAndReports);

    const sheetName = 'Reports';
    const sheetId = NEW_SHEET_ID;
    const rangeStartingPoint = 'A1';
    if (usersAndPostsReportsRawData) {
      await writeRawDataIntoGoogleSheet(usersAndPostsReportsRawData, sheetName, sheetId, rangeStartingPoint);
    }
    else {
      console.log('usersAndPostsReportsRawData.length is: ', usersAndPostsReportsRawData.length);
    }
  }
  catch (_) {
    console.log('error occured in getUsersAndPostsReportsData(): ', _);
  }

}


/**
 *  @param {array} chunkedUsers - chunkedUsers
 * @returns {Promise<map>} - Users and reports Map<string,array>
 */
const getUsersAndPostsReportsDocs = async (chunkedUsers) => {

  try {
    const postsReportsCollectionRef = db.collection('postsReport');

    // Retrieve all users and posts reports
    const allPosts = [];
    const postsSnapshot = await postsReportsCollectionRef.orderBy("reportMessage").get();

    if (postsSnapshot.empty || postsSnapshot.docs.length < 0) return;
    // split users into chunks of 490
    const chunkedPosts = chunkArray(postsSnapshot.docs, 490);

    chunkedPosts.forEach(async (chunk) => {

      chunk.forEach((post) => {
        try {

          const postData = post.data();
          allPosts.push({
            postId: post.id,
            ...postData,
          });

        } catch (_) {
          console.log("Error occured at usersAndPostsReports(): " + _);
        }
      });

    });

    // save all users into allUsers array
    const allUsers = [];

    chunkedUsers.forEach((chunk) => {

      chunk.forEach((user) => {
        try {

          const userData = user.data();
          allUsers.push({
            id: user.id,
            ...userData,
          });

        } catch (_) {
          console.log("Error occured at usersAndPostsReports(): " + _);
        }
      });

    });


    let userTypeReports = [];
    let postTypeReports = [];
    let invalidUserReports = [];


    // for loop on allPosts int i = 0
    for (let i = 0; i < allPosts.length; i++) {
      let post = allPosts[i];

      // get post author email or phone no (if email is null or not there) from allUsers

      let postAuthor = allUsers.find((user) => user.uid === post.reporterId);

      if (!postAuthor) {
        // console.log("post report message: ", post.reportMessage + " reporterId: " + post.reporterId + " postAuthor: " + postAuthor);
        invalidUserReports.push(post);
        continue;
      }

      // get post type
      let postType = post.type;

      if (postType && postType == "user") {
        // save postAuthor email else phoneNumber if email is null or not there
        post.contact = postAuthor.email ? postAuthor.email : (typeof postAuthor.phoneNumber === 'object') ? postAuthor.phoneNumber.number : postAuthor.phoneNumber;
        userTypeReports.push(post);
      }
      else if (postType && postType == "post") {
        post.contact = postAuthor.email ? postAuthor.email : (typeof postAuthor.phoneNumber === 'object') ? postAuthor.phoneNumber.number : postAuthor.phoneNumber;
        postTypeReports.push(post)
      }

    }

    let usersAndPostsReports = {
      'users': userTypeReports,
      'posts': postTypeReports,
      'invalidUsers': invalidUserReports
    };
    return usersAndPostsReports;
  } catch (error) {
    console.log(error)
  }
}

/**
 * Writing users and posts type reports for google sheet.
 * @param {map} usersAndReports - users and posts reports map
 * @returns {Promise<array>} - users and posts reports raw data for sheet
 */
const getUsersAndPostsReportsGoogleSheetRawData = async (usersAndReports) => {

  try {

    const userReports = usersAndReports['users'];
    const postReports = usersAndReports['posts'];
    const invalidUserReports = usersAndReports['invalidUsers'];

    let reportHeaders = ['Reports', 'User Type Reports (reporter_contact, reason, reporter_uid, report_on_user_cubeId)', 'Post Type Reports (reporter_contact, reason, reporter_uid, report_on_post_id)', 'Deleted/Invalid User Reports'];
    let reportData = [reportHeaders];

    let maxLength = Math.max(
      userReports.length,
      postReports.length,
      invalidUserReports.length
    );

    for (let i = 0; i < maxLength; i++) {

      let userData = i < userReports.length ? `${userReports[i].contact} - ${userReports[i].reportMessage} - ${userReports[i].reporterId} - ${userReports[i].id}` : '';
      let postData = i < postReports.length ? `${postReports[i].contact} - ${postReports[i].reportMessage} - ${postReports[i].reporterId} - ${postReports[i].id}` : '';
      let invalidUserData = i < invalidUserReports.length ? `${invalidUserReports[i].reportMessage}` : '';

      let rowData = ['', userData, postData, invalidUserData];
      reportData.push(rowData);
    }

    return reportData;

  } catch (error) {
    console.log("error occured in getBottomLinesGoogleSheetRawData() " + error);
  }
}
/// NOT IN USE
/**
 * Get users count who answered to posts after loggedin week wise.
 */
const getWeeklyLoggedInUsersAndWhoAnsweredToPostsData = async () => {
  try {

    // Getting all Available Weeks
    let weekDates = await getAllAvailableWeeksFromFirestore();

    if (weekDates) {
      // console.log('if weekDates.length is: ', weekDates.length);
    }
    else {
      // console.log('else weekDates.length is: ', weekDates.length);
      return;
    }

    // getting weekly new post creations
    let weeklyAnswersToPost = {};
    weeklyAnswersToPost = await getWeeklyAnswersToPostUser(weekDates);
    if (weeklyAnswersToPost) {
      // console.log('if weeklyAnswersToPost total weeks ===> : ', Object.keys(weeklyAnswersToPost).length);
    }
    else {
      // console.log('else weeklyAnswersToPost  total weeks ===> : ', Object.keys(weeklyAnswersToPost).length);
      return;
    }

    // Calling getWeeklyLoggedInUsers() to get weeklyLoggedInUsersCount data 
    let weeklyLoggedInUsersCount = [];
    weeklyLoggedInUsersCount = await getWeeklyLoggedInUsers(weekDates);

    if (weeklyLoggedInUsersCount) {
      // console.log('if weeklyLoggedInUsersCount.length is: ', weeklyLoggedInUsersCount.length);
    }
    else {
      // console.log('else weeklyLoggedInUsersCount.length is: ', weeklyLoggedInUsersCount.length);
      return;
    }


    // Calling getWeeklyLoggedInUsersAndTheirPostGoogleSheetRawData() to get loggedInUsersAndPostCount data in sheet rows format
    let loggedInUsersAndPostCount = [];
    loggedInUsersAndPostCount = await getWeeklyLoggedInUsersAndWhoAnsweredToPostGoogleSheetRawData(weeklyLoggedInUsersCount, weeklyAnswersToPost);

    if (loggedInUsersAndPostCount) {
      await writeRawDataIntoGoogleSheet(loggedInUsersAndPostCount, 'Total Users', '11cXM4DM_eL6q_nOhlD-Rtna0OOm1xdxH6Rr8cJgnGPs', 'A30');
    }
    else {
      console.log('loggedInUsersAndPostCount.length is: ', loggedInUsersAndPostCount.length);
    }
  }
  catch (_) {
    console.log('error occured in getWeeklyLoggedInUsersAndWhoAnsweredToPostsData(): ', _);
  }

}

/// NOT IN USE
/**
 * Get users count who sent/received a message or participated in a chatroom after loggedin week wise.
 *  @param {array} chunkedUsers - chunkedUsers
 */
const getWeeklyLoggedInUsersAndTheirParticipationInChatroomsData = async (chunkedUsers) => {
  try {

    // get week dates array in milliseconds format
    let weekDatesInMillisecondsFormat = await getAllAvailableWeeksFromConnectycubeInMillisecondsEpochFormat(true);

    // get week dates array in datetime format
    let weekDatesInDateFormat = await getAllAvailableWeeksFromConnectycubeInMillisecondsEpochFormat(false);

    // Calling getWeeklyLoggedInUsers() to get weeklyLoggedInUsersCount data 
    let weeklyLoggedInUsersCount = {};
    weeklyLoggedInUsersCount = await getWeeklyLoggedInUsersFromFBAuthAndFBFirestore(weekDatesInDateFormat, chunkedUsers);

    if (weeklyLoggedInUsersCount) {
      // console.log('if weeklyLoggedInUsersCount.length is: ', weeklyLoggedInUsersCount.length);
    }
    else {
      // console.log('else weeklyLoggedInUsersCount.length is: ', weeklyLoggedInUsersCount.length);
      return;
    }

    // getting weekly connectycube chatrooms
    let weeklyConnectycubeChatrooms = {};
    weeklyConnectycubeChatrooms = await getWeeklyConnectycubeChatrooms(weekDatesInMillisecondsFormat);
    if (weeklyConnectycubeChatrooms) {
      // console.log('if weeklyConnectycubeChatrooms total weeks ===> :  ', JSON.stringify(weeklyConnectycubeChatrooms));
    }
    else {
      // console.log('else weeklyConnectycubeChatrooms ===> : ', JSON.stringify(weeklyConnectycubeChatrooms));
      return;
    }

    // Calling getWeeklyLoggedInUsersAndParticipationInChatroomGoogleSheetRawData() to get loggedInUsersAndPostCount data in sheet rows format
    let loggedInUsersAndParticipationInChatroomCount = [];
    loggedInUsersAndParticipationInChatroomCount = await getWeeklyLoggedInUsersAndParticipationInChatroomGoogleSheetRawData(weeklyLoggedInUsersCount, weeklyConnectycubeChatrooms);

    if (loggedInUsersAndParticipationInChatroomCount) {
      await writeRawDataIntoGoogleSheet(loggedInUsersAndParticipationInChatroomCount, 'Total Users', '11cXM4DM_eL6q_nOhlD-Rtna0OOm1xdxH6Rr8cJgnGPs', 'A40');
    }
    else {
      console.log('loggedInUsersAndParticipationInChatroomCount.length is: ', loggedInUsersAndParticipationInChatroomCount.length);
    }
  }
  catch (_) {
    console.log('error occured in getWeeklyLoggedInUsersAndTheirPostsData(): ', _);
  }

}

/**
 *  @param {weekDates} weekDates - available week dates
 *  @returns {Promise<array>} - Weekly chatrooms
 */
const getWeeklyConnectycubeChatrooms = async (weekDates) => {
  try {
    // Modified version with Promise.all
    const chatroomsByWeek = {};
    await Promise.all(weekDates.map(async (week, index) => {
      const weekStart = week.weekStart;
      const weekEnd = week.weekEnd;
      const weekChatrooms = await stateApi.getWeeklyConnectycubeDialogsData(weekStart, weekEnd);
      chatroomsByWeek[`Week${index + 1}`] = weekChatrooms;
    }));

    // Get the keys and sort them
    const sortedKeys = Object.keys(chatroomsByWeek).sort();
    // Create a new object with the sorted keys
    const sortedWeeklyLoggedInUsersCount = sortedKeys.reduce((acc, key) => {
      acc[key] = chatroomsByWeek[key];
      return acc;
    }, {});

    return sortedWeeklyLoggedInUsersCount;
  }
  catch (error) {
    console.log("error occured in getWeeklyConnectycubeChatrooms():" + error);
  }
}


/// NOT IN USE
/**
 * Get users count who posted after loggedin week wise.
 */
const getWeeklyLoggedInUsersAndTheirPostsData = async () => {
  try {

    // Getting all Available Weeks
    let weekDates = await getAllAvailableWeeksFromFirestore();

    if (weekDates) {
      // console.log('if weekDates.length is: ', weekDates.length);
    }
    else {
      // console.log('else weekDates.length is: ', weekDates.length);
      return;
    }
    // getting weekly new post creations
    let weeklyNewPostsCreationsCount = {};
    weeklyNewPostsCreationsCount = await getWeeklyNewPostsCreationsCount(weekDates);
    if (weeklyNewPostsCreationsCount) {
      // console.log('if weeklyNewPostsCreationsCount total weeks ===> : ', Object.keys(weeklyNewPostsCreationsCount).length);
    }
    else {
      // console.log('else weeklyNewPostsCreationsCount  total weeks ===> : ', Object.keys(weeklyNewPostsCreationsCount).length);
      return;
    }


    // Calling getWeeklyLoggedInUsers() to get weeklyLoggedInUsersCount data 
    let weeklyLoggedInUsersCount = [];
    weeklyLoggedInUsersCount = await getWeeklyLoggedInUsers(weekDates);

    if (weeklyLoggedInUsersCount) {
      // console.log('if weeklyLoggedInUsersCount.length is: ', weeklyLoggedInUsersCount.length);
    }
    else {
      // console.log('else weeklyLoggedInUsersCount.length is: ', weeklyLoggedInUsersCount.length);
      return;
    }


    // Calling getWeeklyLoggedInUsersAndTheirPostGoogleSheetRawData() to get loggedInUsersAndPostCount data in sheet rows format
    let loggedInUsersAndPostCount = [];
    loggedInUsersAndPostCount = await getWeeklyLoggedInUsersAndTheirPostGoogleSheetRawData(weeklyLoggedInUsersCount, weeklyNewPostsCreationsCount);

    if (loggedInUsersAndPostCount) {
      await writeRawDataIntoGoogleSheet(loggedInUsersAndPostCount, 'Total Users', '11cXM4DM_eL6q_nOhlD-Rtna0OOm1xdxH6Rr8cJgnGPs', 'A20');
    }
    else {
      console.log('loggedInUsersAndPostCount.length is: ', loggedInUsersAndPostCount.length);
    }
  }
  catch (_) {
    console.log('error occured in getWeeklyLoggedInUsersAndTheirPostsData(): ', _);
  }

}

/// NOT IN USE
/**
 * Get Weekly New messages desity and their chatrooms count
 */
const getWeeklyNewMessagesAndTheirChatroomsCountData = async () => {
  try {

    // get week dates array in milliseconds format
    let weekDatesInMillisecondsFormat = await getAllAvailableWeeksFromConnectycubeInMillisecondsEpochFormat(true);

    // Calling weeklyMessagesAndChatroomsData() to get weeklyMessagesAndChatroomsData data 
    let weeklyMessagesAndChatroomsData = {};
    weeklyMessagesAndChatroomsData = await getWeeklyNewMessagesAndChatroomsDesityCount(weekDatesInMillisecondsFormat);

    if (weeklyMessagesAndChatroomsData) {
      // console.log('if weeklyMessagesAndChatroomsData.length is: ', weeklyMessagesAndChatroomsData.length);
    }
    else {
      // console.log('else weeklyMessagesAndChatroomsData.length is: ', weeklyMessagesAndChatroomsData.length);
      return;
    }

    // Calling getWeeklyNewMessagesAndChatroomsDesityCountGoogleSheetRawData() to get weeklyMessagesAndChatroomsCount data in sheet rows format
    let weeklyMessagesAndChatroomsCount = [];
    weeklyMessagesAndChatroomsCount = await getWeeklyNewMessagesAndChatroomsDesityCountGoogleSheetRawData(weeklyMessagesAndChatroomsData);

    if (weeklyMessagesAndChatroomsCount) {
      await writeRawDataIntoGoogleSheet(weeklyMessagesAndChatroomsCount, 'Total Users', '11cXM4DM_eL6q_nOhlD-Rtna0OOm1xdxH6Rr8cJgnGPs', 'A50');
    }
    else {
      console.log('weeklyMessagesAndChatroomsCount.length is: ', weeklyMessagesAndChatroomsCount);
    }
  }
  catch (_) {
    console.log('error occured in getWeeklyNewMessagesAndTheirChatroomsCountData(): ', _);
  }

}

/**
 *  @param {weekDates} weekDates
 *  @returns {Promise<map>} - Weekly new messages and their chatroom count
 */
const getWeeklyNewMessagesAndChatroomsDesityCount = async (weekDates) => {

  try {
    let dailyMessagesAndChatroomsCollectionRef = db.collection('analytics').doc('dailyMessagesAndChatrooms').collection('dailyMessagesAndChatrooms');

    // Retrieve all dailyMessagesAndChatrooms from firestore
    const allMessagesAndChatrooms = [];
    const messagesAndChatroomsSnapshot = await dailyMessagesAndChatroomsCollectionRef.get();

    if (messagesAndChatroomsSnapshot.empty || messagesAndChatroomsSnapshot.docs.length < 0) return;
    // split MessagesAndChatrooms into chunks of 490
    const chunkedMessagesAndChatrooms = chunkArray(messagesAndChatroomsSnapshot.docs, 490);
    chunkedMessagesAndChatrooms.forEach(async (chunk) => {

      chunk.forEach((doc) => {
        try {

          const docData = doc.data();
          allMessagesAndChatrooms.push({
            id: doc.id,
            ...docData,
          });

        } catch (_) {
          console.log("Error occured at getWeeklyNewMessagesAndChatroomsDesityCount(): " + _);
        }
      });

    });

    // Divide the MessagesAndChatrooms into weeks
    let messagesAndChatroomsByWeek = {};
    weekDates.forEach((week, index) => {

      let weekStart = new Date(week.weekStart * 1000);
      let weekEnd = new Date(week.weekEnd * 1000);

      let startingDate = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate());
      let endingDate = new Date(weekEnd.getFullYear(), weekEnd.getMonth(), weekEnd.getDate());

      let weekMessagesAndChatrooms = allMessagesAndChatrooms.filter((singleItem) => {
        const itemDate = singleItem.date;
        return itemDate >= startingDate.getTime() && itemDate <= endingDate.getTime();
      });


      let totalMessagesCount = 0;
      let totalDialogsCount = 0;
      weekMessagesAndChatrooms.forEach((item) => {
        totalMessagesCount += item.totalMessagesCount;
        totalDialogsCount += item.totalDialogsCount;
      });

      messagesAndChatroomsByWeek[`Week${index + 1}`] = `${totalMessagesCount} - ${totalDialogsCount}`;

    });

    return messagesAndChatroomsByWeek;

  }
  catch (error) {
    console.log("error occured in getWeeklyNewMessagesAndChatroomsDesityCount():" + error);
  }
}

/**
 * get per user count for messages count options.
 * @param {array} chunkedUsers - chunkedUsers
 * @param {array} latestWeek - latestWeek
 * @param {array} weeklyConnectycubeMessagesCount - weeklyConnectycubeMessagesCount
 * @param {string} latestWeekColumnDay - latestWeekColumnDay
 */
const messagesPerUserData = async (chunkedUsers, latestWeek, weeklyConnectycubeMessagesCount, latestWeekColumnDay) => {
  try {

    console.log('======> Before final loops:');
    // Calling getPerUserWeeklyPostsDataFromAvailableWeekDates() to get weeklyUsersCount data 
    // final list for each week 8 types of user counts
    let weeklyUsersCount = [];
    weeklyUsersCount = await getPerUserWeeklyMessagesDataFromAvailableWeekDates(chunkedUsers, weeklyConnectycubeMessagesCount);
    // console.log('weeklyUsersCount: ', JSON.stringify(weeklyUsersCount));

    if (!weeklyUsersCount) return;
    // Calling getPerUserPostsGoogleSheetRawDataFromWeeklyUsersCount() to get perUserPostsCount data in sheet rows format
    let perUserMessagesOptionCount = [];
    perUserMessagesOptionCount = await getPerUserMessagesGoogleSheetRawDataFromWeeklyUsersCount(weeklyUsersCount);

    if (perUserMessagesOptionCount) {
      const sheetName = 'Density Groups'; // 'Group - Messages per user';
      const sheetId = NEW_SHEET_ID;

      const todaysRawData = {};
      // apply for loop on perUserMessagesOptionCount
      for (let i = 0; i < perUserMessagesOptionCount.length; i++) {
        let rowData = perUserMessagesOptionCount[i];
        let key = rowData[0];
        let value = rowData[1];

        // add key value pair in todaysRawData
        todaysRawData[key] = value;
      }

      /// Write daily reports into google sheet
      await modifyAndUpdateMessagesPerUserNewColumnToSheet(sheetId, sheetName, todaysRawData, latestWeek, latestWeekColumnDay);

    }
    else {
      console.log('perUserMessagesOptionCount.length is==>: ', perUserMessagesOptionCount.length);
    }
  }
  catch (_) {
    console.log('error occured in messagesPerUserData(): ', _);
  }

}


// /**
//  * get per user weekly posts.
//  * @param {array} chunkedUsers - chunkedUsers
//  */
const getUserPostsData = async (chunkedUsers) => {
  try {
    // find 21 weeks a go date from current date
    let eightWeeksAgoDate = new Date();
    eightWeeksAgoDate.setDate(eightWeeksAgoDate.getDate() - 56); // 8 weeks ago date

    // Getting all Available Weeks
    // let weekDates = await getAllAvailableWeeksFromFirestore();
    let weekDates = getAllAvailableWeeksFromTodaysDate(eightWeeksAgoDate);

    if (weekDates) {
      // console.log('if weekDates.length is: ', weekDates.length);
    }
    else {
      console.log('else weekDates.length is: ', weekDates.length);
      return;
    }

    // check if the weekColumnDays has > 8 entries then i want the first 8 entries only
    if (weekDates.length > 8) {
      weekDates.splice(8, weekDates.length - 8);
    }

    /// Generate week dates as human readable format and as keys
    // let weekColumnDays = getWeeklyDatesAsKeys(initialOpenAppCohortDate);

    let weekColumnDays = getWeeklyDatesAsKeys(eightWeeksAgoDate);
    // check if the weekColumnDays has > 8 entries then i want the first 8 entries only
    if (weekColumnDays.length > 8) {
      weekColumnDays.splice(8, weekColumnDays.length - 8);
    }

    // Calling getPerUserWeeklyPostsDataFromAvailableWeekDates() to get weeklyUsersCount data 
    // final list for each week 8 types of user counts
    let weeklyUsersCount = [];
    weeklyUsersCount = await getPerUserWeeklyPostsDataFromAvailableWeekDates(chunkedUsers, weekDates, weekColumnDays);

    if (weeklyUsersCount) {
      // console.log('if weeklyUsersCount.length is: ', weeklyUsersCount.length);
    }
    else {
      console.log('else weeklyUsersCount.length is: ', weeklyUsersCount.length);
      return;
    }

    // Calling getPerUserPostsGoogleSheetRawDataFromWeeklyUsersCount() to get perUserPostsCount data in sheet rows format
    let perUserPostsCount = [];
    perUserPostsCount = await getPerUserPostsGoogleSheetRawDataFromWeeklyUsersCount(weeklyUsersCount);

    if (perUserPostsCount) {
      const sheetName = 'Density Groups';
      const sheetId = NEW_SHEET_ID;
      const rangeStartingPoint = 'A2:J8';

      await writeRawDataIntoGoogleSheet(perUserPostsCount, sheetName, sheetId, rangeStartingPoint);
    }
    else {
      console.log('perUserPostsCount.length is: ', perUserPostsCount.length);
    }
  }
  catch (_) {
    console.log('error occured in getUserPostsData(): ', _);
  }

}

/**
 * get weekly users registrations and their weekly posts creations.
 * @param {array} chunkedUsers - chunkedUsers
 */
const getWeeklyUserRegistrationsAndTheirWeeklyPostsData = async (chunkedUsers) => {
  try {

    /// Generate week dates as human readable format and as keys
    let weekColumnDays = getWeeklyDatesAsKeys(initialTwentyOneWeekCohortDate);
    weekColumnDays = weekColumnDays.reverse();

    // check if the weekColumnDays has > 21 entries leave only last 21 entries and delete others
    if (weekColumnDays.length > 21) {
      weekColumnDays.splice(0, weekColumnDays.length - 21);
    }

    // Getting all Available Weeks
    let weekDates = await getAllAvailableWeeks(initialTwentyOneWeekCohortDate);

    if (!weekDates) return;

    // check if the weekDates has > 21 entries leave the first 21 entries and delete others
    if (weekDates.length > 21) {
      weekDates.splice(21, weekDates.length - 21);
    }

    let weekDatesFromStartToEnd = [...weekDates].reverse();
    // check if the weekDatesFromStartToEnd has > 21 entries leave only last 21 entries and delete others
    if (weekDatesFromStartToEnd.length > 21) {
      weekDatesFromStartToEnd.splice(0, weekDatesFromStartToEnd.length - 21);
    }
    // getting weekly user registrations
    let weeklyUsersRegistrationsCount = {};
    weeklyUsersRegistrationsCount = await getWeeklyUsersRegistrationsCount(chunkedUsers, weekDatesFromStartToEnd);
    if (!weeklyUsersRegistrationsCount) return;

    // getting weekly new post creations 
    let weeklyNewPostsCreationsCount = {};
    weeklyNewPostsCreationsCount = await getWeeklyNewPostsCreationsCount(weekDates);
    if (!weeklyNewPostsCreationsCount) return;

    // check out the no of weeks in weeklyNewPostsCreationsCount, which has posts 
    // like we have let usersByWeek = {}; and the data inside it is like below
    // usersByWeek[`Week${index + 1}`] = weeklyUsers;
    // so find out the no of weeks in usersByWeek which has weeklyUsers > 0
    let weeksWithPosts = 0;
    for (let i = 0; i < Object.keys(weeklyNewPostsCreationsCount).length; i++) {
      let week = Object.keys(weeklyNewPostsCreationsCount)[i];
      let weeklyPosts = weeklyNewPostsCreationsCount[week];
      if (weeklyPosts && weeklyPosts.length > 0) {
        weeksWithPosts++;
      }
    }

    // now cut down the weeklyUsersRegistrationsCount, weeklyUsersRegistrationsCount and weekColumnDays to weeksWithPosts and keep the first weeksWithPosts weeks data
    if (weeksWithPosts > 0) {
      // cut down weeklyUsersRegistrationsCount to weeksWithPosts and keep the last weeksWithPosts weeks data
      let weeklyUsersRegistrationsCountKeys = Object.keys(weeklyUsersRegistrationsCount);
      if (weeklyUsersRegistrationsCountKeys.length > weeksWithPosts) {
        weeklyUsersRegistrationsCountKeys.splice(0, weeklyUsersRegistrationsCountKeys.length - weeksWithPosts);
      }
      let weeklyUsersRegistrationsCountValues = Object.values(weeklyUsersRegistrationsCount);
      if (weeklyUsersRegistrationsCountValues.length > weeksWithPosts) {
        weeklyUsersRegistrationsCountValues.splice(0, weeklyUsersRegistrationsCountValues.length - weeksWithPosts);
      }
      weeklyUsersRegistrationsCount = {};
      for (let i = 0; i < weeklyUsersRegistrationsCountKeys.length; i++) {
        weeklyUsersRegistrationsCount[`Week${i + 1}`] = weeklyUsersRegistrationsCountValues[i];
        // console.log(`Week${i+1}:`, weeklyUsersRegistrationsCount[`Week${i+1}`].length);
      }


      // cut down weeklyNewPostsCreationsCount to weeksWithPosts and keep the first weeksWithPosts weeks data and remove last entries
      let weeklyNewPostsCreationsCountKeys = Object.keys(weeklyNewPostsCreationsCount);



      if (weeklyNewPostsCreationsCountKeys.length > weeksWithPosts) {
        weeklyNewPostsCreationsCountKeys = weeklyNewPostsCreationsCountKeys.slice(0, weeksWithPosts);
      }

      let weeklyNewPostsCreationsCountValues = Object.values(weeklyNewPostsCreationsCount);
      if (weeklyNewPostsCreationsCountValues.length > weeksWithPosts) {
        weeklyNewPostsCreationsCountValues = weeklyNewPostsCreationsCountValues.slice(0, weeksWithPosts);
      }
      weeklyNewPostsCreationsCount = {};
      for (let i = 0; i < weeklyNewPostsCreationsCountKeys.length; i++) {
        weeklyNewPostsCreationsCount[weeklyNewPostsCreationsCountKeys[i]] = weeklyNewPostsCreationsCountValues[i];

      }

      // for loop to print all keys
      for (let i = 0; i < Object.keys(weeklyNewPostsCreationsCount).length; i++) {
        let week = Object.keys(weeklyNewPostsCreationsCount)[i];
        let weeklyPosts = weeklyNewPostsCreationsCount[week];

      }

      // cut down weekColumnDays to weeksWithPosts and keep the last weeksWithPosts weeks data
      if (weekColumnDays.length > weeksWithPosts) {
        weekColumnDays.splice(0, weekColumnDays.length - weeksWithPosts);
      }
    }

    // get final sheet raw data for weekly users and posts
    let weeklyUsersAndPostsGoogleSheetRawData = [];
    weeklyUsersAndPostsGoogleSheetRawData = await getWeeklyUsersAndPostsGoogleSheetRawDataFromWeeklyUsersRegistrationsCountAndWeeklyNewPostsCount(weeklyUsersRegistrationsCount, weeklyNewPostsCreationsCount, weekColumnDays);
    if (!weeklyUsersAndPostsGoogleSheetRawData) return;

    console.table(weeklyUsersAndPostsGoogleSheetRawData);

    const sheetName = 'Cohorted Data';
    const sheetId = NEW_SHEET_ID;
    const rangeStartingPoint = (weeksWithPosts) ? `A2:Z${2 + 4 + weeksWithPosts}` : 'A2:Z27';
    // Calling writeRawDataIntoGoogleSheet() to write weekly registrations and post creations data in sheet rows format
    await writeRawDataIntoGoogleSheet(weeklyUsersAndPostsGoogleSheetRawData, sheetName, sheetId, rangeStartingPoint);

  }
  catch (_) {
    console.log('error occured in getWeeklyUserRegistrationsAndTheirWeeklyPostsData(): ', _);
  }

}




// get weekly new registered users - weekly connectycube messages 
const getWeeklyUserRegistrationsAndTheirMessagesDataPlusMessagesPerUserData = async (chunkedUsers) => {
  try {

    let date = new Date();
    // // TODO: UnComment THIS LINE BEFORE RELEASE minus the days to set date to 10 februay2024 while today is 12 february 2024
    // date.setDate(date.getDate() - 2);

    // print date
    console.log('1 ===> date is: ', date);
    
    // get calendar fixed week dates array in milliseconds format
    const fixedCalendarWeeks = getFixedCalendarWeeks(fixedCalendarStartDate, date, true, true);
    const latestWeek = fixedCalendarWeeks[0];

    console.log('latestWeek: ', latestWeek);

    /// Generate week dates as human readable format and as keys
    let latestWeekColumnDay = getWeeklyDateAsKeys(latestWeek);

    // getting weekly connectycube messages by
    let weeklyConnectycubeMessagesCount = {};
    weeklyConnectycubeMessagesCount = await getWeeklyConnectycubeMessagesData(
      [
        latestWeek
      ]
    );
    if (weeklyConnectycubeMessagesCount['Week1'].length === 0) return;

    // await getWeeklyUserRegistrationsAndWeeklyConnectycubeMessagesData(chunkedUsers);

    await messagesPerUserData(chunkedUsers, latestWeek, weeklyConnectycubeMessagesCount, latestWeekColumnDay);

    return;
  }
  catch (_) {
    console.log('Error occured at getWeeklyUserRegistrationsAndTheirMessagesDataPlusMessagesPerUserData(): ' + _);
  }

}



/// IN USE NOW
// get weekly new registered users - weekly connectycube messages 
const getWeeklyUserRegistrationsAndWeeklyConnectycubeMessagesData = async (chunkedUsers) => {
  try {
    /// Generate week dates as human readable format and as keys
    // let weekColumnDays = getWeeklyFixedDatesAsKeys(fixedCalendarStartDate, new Date(), false);


    let weekColumnDays = getWeeklyFixedDatesAsKeys(initialTwentyOneWeekCohortDate, new Date(), false);

    // check if the weekColumnDays has > 21 entries leave only last 21 entries and delete others
    if (weekColumnDays.length > 21) {
      weekColumnDays.splice(0, weekColumnDays.length - 21);
    }

    // get week dates array in datetime format
    let weekDatesInDateFormat = getFixedCalendarWeeks(initialTwentyOneWeekCohortDate, new Date(), false, false);

    // check if the weekDatesInDateFormat has > 21 entries leave only last 21 entries and delete others
    if (weekDatesInDateFormat.length > 21) {
      weekDatesInDateFormat.splice(0, weekDatesInDateFormat.length - 21);
    }

    const fixedCalendarWeeks = getFixedCalendarWeeks(initialTwentyOneWeekCohortDate, new Date(), true, true);

    // check if the fixedCalendarWeeks has > 21 entries then leave only initial 21 values and delete others from th end side
    if (fixedCalendarWeeks.length > 21) {
      fixedCalendarWeeks.splice(21, fixedCalendarWeeks.length - 21);
    }

    // getting weekly user registrations
    let weeklyUsersRegistrationsCount = {};
    weeklyUsersRegistrationsCount = await getWeeklyUsersRegistrationsCount(chunkedUsers, weekDatesInDateFormat);
    if (weeklyUsersRegistrationsCount) {
      //  console.log("if weeklyUsersRegistrationsCount: " + JSON.stringify(weeklyUsersRegistrationsCount));
    }
    else {
      //  console.log("else weeklyUsersRegistrationsCount: " + JSON.stringify(weeklyUsersRegistrationsCount));
      return;
    }

    // getting weekly connectycube messages by 
    let weeklyConnectycubeMessagesCount = {};
    weeklyConnectycubeMessagesCount = await getWeeklyConnectycubeMessagesData(fixedCalendarWeeks);
    if (weeklyConnectycubeMessagesCount['Week1'].length === 0) return;

    // // check out the no of weeks in weeklyConnectycubeMessagesCount, which has posts 
    // // like we have let usersByWeek = {}; and the data inside it is like below
    // // usersByWeek[`Week${index + 1}`] = weeklyUsers;
    // // so find out the no of weeks in usersByWeek which has weeklyUsers > 0
    let weeksWithPosts = 0;
    for (let i = 0; i < Object.keys(weeklyConnectycubeMessagesCount).length; i++) {
      let week = Object.keys(weeklyConnectycubeMessagesCount)[i];
      let weeklyPosts = weeklyConnectycubeMessagesCount[week];

      if (weeklyPosts && weeklyPosts.length > 0) {
        weeksWithPosts++;
      }
    }

    // now cut down the weeklyUsersRegistrationsCount, weeklyUsersRegistrationsCount and weekColumnDays to weeksWithPosts and keep the first weeksWithPosts weeks data
    if (weeksWithPosts > 0) {
      // cut down weeklyUsersRegistrationsCount to weeksWithPosts and keep the last weeksWithPosts weeks data
      let weeklyUsersRegistrationsCountKeys = Object.keys(weeklyUsersRegistrationsCount);
      if (weeklyUsersRegistrationsCountKeys.length > weeksWithPosts) {
        weeklyUsersRegistrationsCountKeys.splice(0, weeklyUsersRegistrationsCountKeys.length - weeksWithPosts);
      }
      let weeklyUsersRegistrationsCountValues = Object.values(weeklyUsersRegistrationsCount);
      if (weeklyUsersRegistrationsCountValues.length > weeksWithPosts) {
        weeklyUsersRegistrationsCountValues.splice(0, weeklyUsersRegistrationsCountValues.length - weeksWithPosts);
      }
      weeklyUsersRegistrationsCount = {};
      for (let i = 0; i < weeklyUsersRegistrationsCountKeys.length; i++) {
        weeklyUsersRegistrationsCount[`Week${i + 1}`] = weeklyUsersRegistrationsCountValues[i];
        // console.log(`Week${i+1}:`, weeklyUsersRegistrationsCount[`Week${i+1}`].length);
      }

      // cut down weeklyNewPostsCreationsCount to weeksWithPosts and keep the first weeksWithPosts weeks data and remove last entries
      let weeklyConnectycubeMessagesKeys = Object.keys(weeklyConnectycubeMessagesCount);

      if (weeklyConnectycubeMessagesKeys.length > weeksWithPosts) {
        weeklyConnectycubeMessagesKeys = weeklyConnectycubeMessagesKeys.slice(0, weeksWithPosts);
      }

      let weeklyConnectycubeMessagesCountValues = Object.values(weeklyConnectycubeMessagesCount);
      if (weeklyConnectycubeMessagesCountValues.length > weeksWithPosts) {
        weeklyConnectycubeMessagesCountValues = weeklyConnectycubeMessagesCountValues.slice(0, weeksWithPosts);
      }
      weeklyConnectycubeMessagesCount = {};
      for (let i = 0; i < weeklyConnectycubeMessagesKeys.length; i++) {
        weeklyConnectycubeMessagesCount[weeklyConnectycubeMessagesKeys[i]] = weeklyConnectycubeMessagesCountValues[i];

      }

      // cut down weekColumnDays to weeksWithPosts and keep the last weeksWithPosts weeks data
      if (weekColumnDays.length > weeksWithPosts) {
        weekColumnDays.splice(0, weekColumnDays.length - weeksWithPosts);
      }
    }
    

    // convert weekly users count and weekly messages count to raw data and write it to google sheet
    // get final sheet raw data for weekly users and posts
    let weeklyUsersAndConnectycubeMessagesGoogleSheetRawData = [];
    weeklyUsersAndConnectycubeMessagesGoogleSheetRawData = await getWeeklyUsersAndCCMessagesGoogleSheetRawData(weeklyUsersRegistrationsCount, weeklyConnectycubeMessagesCount, weekColumnDays);
    if (weeklyUsersAndConnectycubeMessagesGoogleSheetRawData) {
      // console.log('data is: ', JSON.stringify(weeklyUsersAndConnectycubeMessagesGoogleSheetRawData));
    }
    else {
      console.log('else weeklyUsersAndConnectycubeMessagesGoogleSheetRawData.length is: ', weeklyUsersAndConnectycubeMessagesGoogleSheetRawData);
      return;
    }
 
    const sheetName = 'Cohorted Data'; // 'cohort - Weekly Users and Their Messages';
    const sheetId = NEW_SHEET_ID;
    const rangeStartingPoint = (weeksWithPosts) ? `A45:Z${45 + 4 + weeksWithPosts}` : 'A45:Z70'; // 'A45:Z70';
    // Calling writeRawDataIntoGoogleSheet() to write weekly registrations and their weekly messages data in sheet rows format
    await writeRawDataIntoGoogleSheet(weeklyUsersAndConnectycubeMessagesGoogleSheetRawData, sheetName, sheetId, rangeStartingPoint);
  }
  catch (_) {
    console.log('Error occured at getWeeklyUserRegistrationsAndWeeklyConnectycubeMessagesData(): ' + _);
  }

}

/**
 * Making weekly users and their weekly messages data for google sheet.
 * @param {array} weeklyUsersRegistrationsCount
 * @param {array} weeklyConnectycubeMessagesCount
 * @param {Array} weekColumnDays
 * @returns {Promise<array>} - Weekly users and posts raw data
 */
const getWeeklyUsersAndCCMessagesGoogleSheetRawData = async (weeklyUsersRegistrationsCount, weeklyConnectycubeMessagesCount, weekColumnDays) => {

  try {
    let mapKeys = [''];

    // Iterate through the array and print each item's key

    for (let key in weeklyConnectycubeMessagesCount) {
      // Use hasOwnProperty to make sure key is not inherited from the prototype chain
      if (weeklyConnectycubeMessagesCount.hasOwnProperty(key)) {
        mapKeys.push(key);
      }
    }

    // apply for loop on weekColumnDays,length and append  weekColumnDays data into weekKeys  array
    for (let i = 0; i < weekColumnDays.length; i++) {
      // append weekColumnDays data into mapKeys array same index
      mapKeys[i + 1] = `${mapKeys[i + 1]} (${weekColumnDays[i]})`;
    }

    // Add a header row
    let descriptionRow = [
      '',
      'Users registered',
      'Weeks since day 1 in BTL',
      ''
    ];

    // Add a header row
    let headerRow = [
      'Messages per week',
      ...mapKeys
    ];

        // Create an array to store per week Users and Posts Count for sheet
        let weeklyUsersAndMessageCount = [];

        // set header row in final sheet raw data
        weeklyUsersAndMessageCount.push(descriptionRow);
        weeklyUsersAndMessageCount.push(headerRow);
    
        // iterate through the array and save each item in parent row
        const keys = Object.keys(weeklyConnectycubeMessagesCount);
        const userKeys = Object.keys(weeklyUsersRegistrationsCount);
    
        for (let i = 0; i < keys.length; i++) {
          const parentKey = keys[i];
    
          let childDataRow = [];
    
          // child loop to save data in child row
          for (let j = 0; j < keys.length - i; j++) {
    
            const postChildKey = keys[j];
            const userChildKey = userKeys[i];
    
            let messages = weeklyConnectycubeMessagesCount[postChildKey];
            let users = weeklyUsersRegistrationsCount[userChildKey];
            let totalMessages = 0;
    
            users.forEach(user => {
              messages.forEach(message => {
                if (message.cubeId === String(user.cubeId)) {
                  totalMessages++;
                }
              });
            });

            // compare users and messages and get totalMessages count using reduce on users and filter on messages 
            // let totalMessages = users.reduce((count, user) => count + messages.filter(message => message.cubeId === String(user.cubeId)).length, 0);
    
            childDataRow.push(`${totalMessages}`);
    
          }
          let usersCount = weeklyUsersRegistrationsCount[parentKey].length;
          // add week no in the start of row
          let parentDataRow = [
            weekColumnDays[i],
            usersCount,
            ...childDataRow.reverse()
          ];
    
          // set single row in final sheet raw data
          weeklyUsersAndMessageCount.push(parentDataRow);
    
        }
    
        return weeklyUsersAndMessageCount;

  } catch (error) {
    console.log("error occured in getWeeklyUsersAndCCMessagesGoogleSheetRawData() " + error);
  }
}



/**
 *  @param {weekDates} weekDates
 *  @returns {Promise<array>} - Weekly Logged-In users
 */
const getWeeklyLoggedInUsers = async (weekDates) => {

  try {
    // save all logged-in users into allUsers array
    let allUsers = [];

    try {
      let pageToken;
      do {
        const listUsersResult = await admin.auth().listUsers(1000, pageToken);
        allUsers = allUsers.concat(listUsersResult.users);
        pageToken = listUsersResult.pageToken;
      } while (pageToken);


    } catch (error) {
      console.error('Error syncing users to Firestore:', error);
    }

    try {
      const dummyUser = allUsers[0];
      console.log('dummyUser: ', dummyUser);
      console.log('metaData: ', dummyUser.metadata);
      console.log('metaData: ', dummyUser.providerData);


    }
    catch (_) { }

    // Divide the users into weeks
    const usersByWeek = {};
    weekDates.forEach((week, index) => {
      const weekStart = new Date(week.weekStart);
      const weekEnd = new Date(week.weekEnd);

      const weeklyUsers = allUsers.filter((user) => {

        const userTimestamp = new Date(user.metadata.lastSignInTime);
        // const userTimestamp = new Date(user.createdAt._seconds * 1000 + user.createdAt._nanoseconds / 1000000);

        // Create a new Date object with only the date, month, and year
        const userDateOnly = new Date(userTimestamp.getFullYear(), userTimestamp.getMonth(), userTimestamp.getDate());

        return userDateOnly >= weekStart && userDateOnly <= weekEnd;
      });

      usersByWeek[`Week${index + 1}`] = weeklyUsers;

    });

    return usersByWeek;

  }
  catch (error) {
    console.log("error occured in getWeeklyLoggedInUsers():" + error);
  }
}

/**
 *  @param {weekDates} weekDates
 *  @param {array} chunkedUsers - firestore nested array of users (chunkedwise)
 *  @returns {Promise<array>} - Weekly Logged-In users
 */
const getWeeklyLoggedInUsersFromFBAuthAndFBFirestore = async (weekDates, chunkedUsers) => {

  try {
    // save all firestore users into firestoreUsers array
    let firestoreUsers = [];
    chunkedUsers.forEach(async (chunk) => {

      chunk.forEach((user) => {
        try {

          const userData = user.data();
          firestoreUsers.push({
            id: user.id,
            ...userData,
          });

        } catch (_) {
          console.log("Error occured at getWeeklyLoggedInUsersFromFBAuthAndFBFirestore(): " + _);
        }
      });

    });

    // save all logged-in users into allUsers array
    let allUsers = [];

    try {

      let pageToken;
      do {
        let listUsersResult = await admin.auth().listUsers(1000, pageToken);

        let users = listUsersResult.users;

        // iterate a for loop on users each user and add cubeId field to each user object from firestoreUsers users array
        for (let i = 0; i < users.length; i++) {

          const userIndex = firestoreUsers.findIndex((firestoreUser) => firestoreUser.id == users[i].uid);
          if (userIndex > -1) {
            users[i].cubeId = firestoreUsers[userIndex].cubeId;
          }
        }


        allUsers = allUsers.concat(users);
        pageToken = listUsersResult.pageToken;
      } while (pageToken);


    } catch (error) {
      console.error('Error syncing users to Firestore:', error);
    }

    // Divide the authentication users into weeks
    const authUsersByWeek = {};
    weekDates.forEach((week, index) => {
      const weekStart = new Date(week.weekStart);
      const weekEnd = new Date(week.weekEnd);

      const weeklyUsers = allUsers.filter((user) => {

        const userTimestamp = new Date(user.metadata.lastSignInTime);
        // const userTimestamp = new Date(user.createdAt._seconds * 1000 + user.createdAt._nanoseconds / 1000000);

        // Create a new Date object with only the date, month, and year
        const userDateOnly = new Date(userTimestamp.getFullYear(), userTimestamp.getMonth(), userTimestamp.getDate());

        return userDateOnly >= weekStart && userDateOnly <= weekEnd;
      });

      authUsersByWeek[`Week${index + 1}`] = weeklyUsers;

    });

    return authUsersByWeek;

  }
  catch (error) {
    console.log("error occured in getWeeklyLoggedInUsersFromFBAuthAndFBFirestore():" + error);
  }
}


// /**
//  *  @param {array} chunkedUsers
//  *  @param {weekDates} weekDates
//  *  @returns {Promise<array>} - Weekly user registrations
//  */
const getWeeklyUsersRegistrationsCount = async (chunkedUsers, weekDates) => {

  try {

    // save all users into allUsers array
    const allUsers = [];

    chunkedUsers.forEach(async (chunk) => {

      chunk.forEach((user) => {
        try {

          const userData = user.data();
          allUsers.push({
            id: user.id,
            ...userData,
          });

        } catch (_) {
          console.log("Error occured at getWeeklyUsersRegistrationsCount(): " + _);
        }
      });

    });
    // Divide the posts into weeks
    const usersByWeek = {};

    weekDates.forEach((week, index) => {
      const weekStart = new Date(week.weekStart);
      const weekEndDate = new Date(week.weekEnd);
      let weekEnd = new Date(weekEndDate.getFullYear(), weekEndDate.getMonth(), weekEndDate.getDate(), 23, 59, 59, 999);

      const weeklyUsers = allUsers.filter((user) => {
        // return the user only if the user.createdAt field exists in user
        if (!user.createdAt) {
          return false;
        }
        const userTimestamp = new Date(user.createdAt._seconds * 1000 + user.createdAt._nanoseconds / 1000000);
        // Create a new Date object with only the date, month, and year
        const userDateOnly = new Date(userTimestamp.getFullYear(), userTimestamp.getMonth(), userTimestamp.getDate());

        return userDateOnly >= weekStart && userDateOnly <= weekEnd;
      });
      usersByWeek[`Week${index + 1}`] = weeklyUsers;
    });
    return usersByWeek;
  }
  catch (error) {
    console.log("error occured in getWeeklyUsersRegistrationsCount():" + error);
  }
}

// /**
//  *  @param {weekDates} weekDates
//  *  @returns {Promise<array>} - Weekly user docs who answered to post
//  */
const getWeeklyAnswersToPostUser = async (weekDates) => {

  try {

    const usersWhoAnsweredToPostsCollectionRef = db.collection('analytics').doc('usersWhoAnsweredToPosts').collection('usersWhoAnsweredToPosts');

    // Retrieve all posts
    const allUsers = [];
    const usersWhoAnsweredToPostsSnapshot = await usersWhoAnsweredToPostsCollectionRef.get();
    // usersWhoAnsweredToPostsSnapshot

    if (usersWhoAnsweredToPostsSnapshot.empty || usersWhoAnsweredToPostsSnapshot.docs.length < 0) return;
    // split users into chunks of 490
    const chunkedUsers = chunkArray(usersWhoAnsweredToPostsSnapshot.docs, 490);

    chunkedUsers.forEach(async (chunk) => {

      chunk.forEach((user) => {
        try {

          const userData = user.data();
          allUsers.push({
            id: user.id,
            ...userData,
          });

        } catch (_) {
          console.log("Error occured at getWeeklyAnswersToPostUser(): " + _);
        }
      });

    });

    // Divide the users into weeks
    const answersToPostsByWeek = {};
    weekDates.forEach((week, index) => {
      const weekStart = new Date(week.weekStart);
      const weekEnd = new Date(week.weekEnd);

      const weekUsers = allUsers.filter((user) => {

        const userTimestamp = new Date(user.updatedAt._seconds * 1000 + user.updatedAt._nanoseconds / 1000000);
        // Create a new Date object with only the date, month, and year
        const userDateOnly = new Date(userTimestamp.getFullYear(), userTimestamp.getMonth(), userTimestamp.getDate());

        return userDateOnly >= weekStart && userDateOnly <= weekEnd;
      });
      answersToPostsByWeek[`Week${index + 1}`] = weekUsers;

    });

    return answersToPostsByWeek;

  }
  catch (error) {
    console.log("error occured in getWeeklyAnswersToPostUser():" + error);
  }
}

// /**
//  *  @param {weekDates} weekDates
//  *  @returns {Promise<array>} - Weekly new posts creations
//  */
const getWeeklyNewPostsCreationsCount = async (weekDates) => {

  try {

    // gett posts for last 7 weeks from GCP (today date , 7 weeks ago date)
    // new date object for today - 1 day
    const today = new Date();
    today.setDate(today.getDate() - 1); 
    // new date object for 7 weeks ago
    const twentyOneWeeksAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 147, 23, 59, 59, 999);
    // get all posts from GCP
    const allPosts = await getAllPostsFromGCP(today, twentyOneWeeksAgo);

    // remove the weeks from end if gretaer than 21
    if (weekDates.length > 21) {
      weekDates.splice(0, weekDates.length - 21);
    }

    // Divide the posts into weeks
    const postsByWeek = {};
    weekDates.forEach((week, index) => {
      const weekStart = new Date(week.weekStart);
      const weekEndDate = new Date(week.weekEnd);

      let weekEnd = new Date(weekEndDate.getFullYear(), weekEndDate.getMonth(), weekEndDate.getDate(), 23, 59, 59, 999);

      const weekPosts = allPosts.filter((post) => {

        if (!post.createdAt) {
          console.log(`❌❌❌Culprit; ${post}`);
          console.log(`❌❌❌Culprit; ${JSON.stringify(post)}`);
          return false;
        }
        // const postTimestamp = new Date(post.createdAt._seconds * 1000 + post.createdAt._nanoseconds / 1000000);
        // // Create a new Date object with only the date, month, and year
        // // const postDateOnly =  post.createdAt.toDate();
        // const postDateOnly =  new Date(postTimestamp.getFullYear(), postTimestamp.getMonth(), postTimestamp.getDate());

        const postDateOnly = new Date(post.createdAt);

        return postDateOnly >= weekStart && postDateOnly <= weekEnd;
      });
      postsByWeek[`Week${index + 1}`] = weekPosts;

    });

    return postsByWeek;

  }
  catch (error) {
    console.log("error occured in getWeeklyNewPostsCreationsCount():" + error);
  }
}

/**
 * Writing weekly loggedIn users and who answered to posts count of them for google sheet.
 * @param {array} weeklyLoggedInUsersCount
 * @param {array} weeklyAnswersToPost
 * @returns {Promise<array>} - Weekly loggedIn users and who answered to posts count raw data
 */
const getWeeklyLoggedInUsersAndWhoAnsweredToPostGoogleSheetRawData = async (weeklyLoggedInUsersCount, weeklyAnswersToPost) => {

  try {
    let mapKeys = [];

    // Iterate through the array and print each item's key

    for (let key in weeklyAnswersToPost) {
      // Use hasOwnProperty to make sure key is not inherited from the prototype chain
      if (weeklyAnswersToPost.hasOwnProperty(key)) {
        mapKeys.push(key);
      }
    }

    // Add a header row
    let headerRow = [
      'Total logged-in users that answered',
      ...mapKeys
    ];

    // Create an array to store per week Users and how many users Posted count for sheet
    let weeklyUsersAndWhoAnsweredCount = [];

    // set header row in final sheet raw data
    weeklyUsersAndWhoAnsweredCount.push(headerRow);


    let finalDataRow = [
      '',
    ];

    // iterate through the array and save each item in parent row
    for (let key in weeklyAnswersToPost) {

      let usersWhoAnsweredToPosts = weeklyAnswersToPost[key];
      let users = weeklyLoggedInUsersCount[key];
      let usersWhoAnswered = 0;

      for (const user of users) {
        const userUid = user.uid;
        for (const item of usersWhoAnsweredToPosts) {
          const itemUid = item.id;
          if (itemUid === userUid) {
            usersWhoAnswered++;
            break;
          }
        }
      }

      // find out percentage of users who posted
      let percentageOfUsersWhoAnswered = (usersWhoAnswered / users.length) * 100;
      // allow only 1 digit after . 
      percentageOfUsersWhoAnswered = percentageOfUsersWhoAnswered.toFixed(1);

      finalDataRow.push(`${users.length} - ${usersWhoAnswered} (${percentageOfUsersWhoAnswered}%)`);

    }
    // set single row in final sheet raw data
    weeklyUsersAndWhoAnsweredCount.push(finalDataRow);

    return weeklyUsersAndWhoAnsweredCount;

  } catch (error) {
    console.log("error occured in getWeeklyLoggedInUsersAndWhoAnsweredToPostGoogleSheetRawData() " + error);
  }
}

/**
 * Writing weekly messages and chatrooms count of them for google sheet.
 * @param {array} weeklyMessagesAndChatroomsData
 * @returns {Promise<array>} - Weekly messages and chatrooms count raw data
 */
const getWeeklyNewMessagesAndChatroomsDesityCountGoogleSheetRawData = async (weeklyMessagesAndChatroomsData) => {

  try {
    let mapKeys = [];

    // Iterate through the array and print each item's key
    for (let key in weeklyMessagesAndChatroomsData) {
      // Use hasOwnProperty to make sure key is not inherited from the prototype chain
      if (weeklyMessagesAndChatroomsData.hasOwnProperty(key)) {
        mapKeys.push(key);
      }
    }

    // Add a header row
    let headerRow = [
      'Messages and Chatroom density per week',
      ...mapKeys
    ];

    // Create an array to store per week Messages and their dialogs count for sheet
    let weeklyMessagesAndChatroomsCount = [];

    // set header row in final sheet raw data
    weeklyMessagesAndChatroomsCount.push(headerRow);


    let finalDataRow = [
      '',
    ];

    // iterate through the array and save each item in parent row
    for (let key in weeklyMessagesAndChatroomsData) {

      finalDataRow.push(weeklyMessagesAndChatroomsData[key]);

    }
    // set single row in final sheet raw data
    weeklyMessagesAndChatroomsCount.push(finalDataRow);

    return weeklyMessagesAndChatroomsCount;

  } catch (error) {
    console.log("error occured in getWeeklyNewMessagesAndChatroomsDesityCountGoogleSheetRawData() " + error);
  }
}


/**
 * Writing weekly loggedIn users and weekly posters count of them for google sheet.
 * @param {array} weeklyLoggedInUsersCount
 * @param {array} weeklyConnectycubeChatrooms
 * @returns {Promise<array>} - Weekly loggedIn users and weekly posters count raw data
 */
const getWeeklyLoggedInUsersAndParticipationInChatroomGoogleSheetRawData = async (weeklyLoggedInUsersCount, weeklyConnectycubeChatrooms) => {

  try {
    let mapKeys = [];

    // Iterate through the array and print each item's key
    for (let key in weeklyConnectycubeChatrooms) {
      // Use hasOwnProperty to make sure key is not inherited from the prototype chain
      if (weeklyConnectycubeChatrooms.hasOwnProperty(key)) {
        mapKeys.push(key);
      }
    }

    // Add a header row
    let headerRow = [
      'Total logged-in users that sent/received message per week',
      ...mapKeys
    ];

    // Create an array to store per week Users and how many users Posted count for sheet
    let weeklyUsersAndChatroomParticipationCount = [];

    // set header row in final sheet raw data
    weeklyUsersAndChatroomParticipationCount.push(headerRow);


    let finalDataRow = [
      '',
    ];

    // iterate through the array and save each item in parent row
    for (let key in weeklyConnectycubeChatrooms) {

      let chatrooms = weeklyConnectycubeChatrooms[key];
      let users = weeklyLoggedInUsersCount[key];
      let usersWhoParticipated = 0;

      for (const user of users) {

        for (const chatroom of chatrooms) {
          const chatroomOccupants = chatroom.occupants_ids;
          if (chatroomOccupants.includes(user.cubeId)) {
            usersWhoParticipated++;
            break;
          }
        }
      }

      // find out percentage of users who participated in a chatroom
      let percentageOfUsersWhoParticipated = (usersWhoParticipated / users.length) * 100;
      // allow only 1 digit after . 
      percentageOfUsersWhoParticipated = percentageOfUsersWhoParticipated.toFixed(1);

      finalDataRow.push(`${users.length} - ${usersWhoParticipated} (${percentageOfUsersWhoParticipated}%)`);

    }
    // set single row in final sheet raw data
    weeklyUsersAndChatroomParticipationCount.push(finalDataRow);

    return weeklyUsersAndChatroomParticipationCount;

  } catch (error) {
    console.log("error occured in getWeeklyLoggedInUsersAndParticipationInChatroomGoogleSheetRawData() " + error);
  }
}

/**
 * Writing weekly loggedIn users and weekly posters count of them for google sheet.
 * @param {array} weeklyLoggedInUsersCount
 * @param {array} weeklyNewPostsCreationsCount
 * @returns {Promise<array>} - Weekly loggedIn users and weekly posters count raw data
 */
const getWeeklyLoggedInUsersAndTheirPostGoogleSheetRawData = async (weeklyLoggedInUsersCount, weeklyNewPostsCreationsCount) => {

  try {
    let mapKeys = [];

    // Iterate through the array and print each item's key

    for (let key in weeklyNewPostsCreationsCount) {
      // Use hasOwnProperty to make sure key is not inherited from the prototype chain
      if (weeklyNewPostsCreationsCount.hasOwnProperty(key)) {
        mapKeys.push(key);
      }
    }

    // Add a header row
    let headerRow = [
      'Total logged-in users that posted',
      ...mapKeys
    ];

    // Create an array to store per week Users and how many users Posted count for sheet
    let weeklyUsersAndPostsCount = [];

    // set header row in final sheet raw data
    weeklyUsersAndPostsCount.push(headerRow);


    let finalDataRow = [
      '',
    ];

    // iterate through the array and save each item in parent row
    for (let key in weeklyNewPostsCreationsCount) {

      let posts = weeklyNewPostsCreationsCount[key];
      let users = weeklyLoggedInUsersCount[key];
      let usersWhoPosted = 0;

      for (const user of users) {
        const userUID = user.uid;
        for (const post of posts) {
          const postAuthorUID = post.author.uid;
          if (postAuthorUID === userUID) {
            usersWhoPosted++;
            break;
          }
        }
      }

      // find out percentage of users who posted
      let percentageOfUsersWhoPosted = (usersWhoPosted / users.length) * 100;
      // allow only 1 digit after . 
      percentageOfUsersWhoPosted = percentageOfUsersWhoPosted.toFixed(1);



      finalDataRow.push(`${users.length} - ${usersWhoPosted} (${percentageOfUsersWhoPosted}%)`);

    }
    // set single row in final sheet raw data
    weeklyUsersAndPostsCount.push(finalDataRow);

    return weeklyUsersAndPostsCount;

  } catch (error) {
    console.log("error occured in getWeeklyLoggedInUsersAndTheirPostGoogleSheetRawData() " + error);
  }
}


/**
 * Writing weekly users and weekly posts data to google sheet.
 * @param {array} weeklyUsersRegistrationsCount
 * @param {array} weeklyNewPostsCreationsCount
 * @param {Array} weekColumnDays
 * @returns {Promise<array>} - Weekly users and posts raw data
 */
const getWeeklyUsersAndPostsGoogleSheetRawDataFromWeeklyUsersRegistrationsCountAndWeeklyNewPostsCount = async (weeklyUsersRegistrationsCount, weeklyNewPostsCreationsCount, weekColumnDays) => {

  try {
    let mapKeys = [''];

    // Iterate through the array and print each item's key

    for (let key in weeklyNewPostsCreationsCount) {
      // Use hasOwnProperty to make sure key is not inherited from the prototype chain
      if (weeklyNewPostsCreationsCount.hasOwnProperty(key)) {
        mapKeys.push(key);
      }
    }

    // apply for loop on weekColumnDays,length and append  weekColumnDays data into mapKeys  array
    for (let i = 0; i < weekColumnDays.length; i++) {
      // append weekColumnDays data into mapKeys array same index
      mapKeys[i + 1] = `${mapKeys[i + 1]} (${weekColumnDays[i]})`;
    }

    // Add a header row
    let headerRow = [
      'Posts per week',
      ...mapKeys
    ];

    // Create an array to store per week Users and Posts Count for sheet
    let weeklyUsersAndPostsCount = [];

    // set header row in final sheet raw data
    weeklyUsersAndPostsCount.push(headerRow);

    // Create an array to store per week Users and Posts Count for sheet
    let dummyWeeklyUsersAndPostsCount = [];
    // set header row in final sheet raw data
    dummyWeeklyUsersAndPostsCount.push(headerRow);

    // iterate through the array and save each item in parent row
    const keys = Object.keys(weeklyNewPostsCreationsCount);
    const userKeys = Object.keys(weeklyUsersRegistrationsCount);


    for (let i = 0; i < keys.length; i++) {
      const parentKey = keys[i];

      let childDataRow = [];

      let dummyChildDataRow = [];

      // child loop to save data in child row
      for (let j = 0; j < keys.length - i; j++) {
        const postChildKey = keys[j];

        const userChildKey = userKeys[i];

        let posts = weeklyNewPostsCreationsCount[postChildKey];
        let users = weeklyUsersRegistrationsCount[userChildKey];
        let totalPosts = 0;

        users.forEach(user => {
          // // find if a user posted atleast once without using foreach loop
          let userIndex = posts.findIndex((post) => post.userId === user.id);
          if (userIndex > -1) {
            totalPosts++;
          }
        });

        let userPercentage = (totalPosts / users.length) * 100;

        childDataRow.push(`${totalPosts}`);

        dummyChildDataRow.push(userPercentage);
      }
      let usersCount = weeklyUsersRegistrationsCount[parentKey].length;
      // add week no in the start of row
      let parentDataRow = [
        weekColumnDays[i],
        usersCount,
        ...childDataRow.reverse()  /// REVERSING // BADAR
      ];

      // set single row in final sheet raw data
      weeklyUsersAndPostsCount.push(parentDataRow);

      // add week no in the start of row
      let dummyParentDataRow = [
        weekColumnDays[i],
        usersCount,
        ...dummyChildDataRow.reverse() /// REVERSING // BADAR
      ];

      // set single dummy row in final sheet raw data
      dummyWeeklyUsersAndPostsCount.push(dummyParentDataRow);
    }

    let columnPercentages = getColumnWisePercentage(dummyWeeklyUsersAndPostsCount);

    columnPercentages = [
      ...columnPercentages.slice(0, 0),
      '',
      ...columnPercentages.slice(1)
    ];
    const finalWeeklyUsersAndCounts = [
      ...weeklyUsersAndPostsCount.slice(0, 1),
      columnPercentages,
      ...weeklyUsersAndPostsCount.slice(1)
    ];

    return finalWeeklyUsersAndCounts;

  } catch (error) {
    console.log("error occured in getWeeklyUsersAndPostsGoogleSheetRawDataFromWeeklyUsersRegistrationsCountAndWeeklyNewPostsCount() " + error);
  }
}
/**
 * get all available weeks from start of of the app.
 * @param {date} initialDateTime - initialDateTime
 * @returns {array} - weekDates
 */
const getAllAvailableWeeksFromTodaysDate = (initialDateTime) => {
  try {

    // Calculate the current date
    const today = new Date();
    //
    let initialDatePoint =
      (initialDateTime) ?
        initialDateTime
        :
        new Date(today.getFullYear(), today.getMonth(), today.getDate() - 49, 23, 59, 59, 999);

    // Calculate week starting and ending dates
    const weekDates = [];
    let currentWeekStartDate = new Date(today);
    let currentWeekEndDate = new Date(currentWeekStartDate);

    currentWeekStartDate.setDate(currentWeekStartDate.getDate() - 6);

    while (currentWeekStartDate >= initialDatePoint || currentWeekEndDate >= initialDatePoint) {
      weekDates.push({
        weekStart: currentWeekStartDate.toISOString().split('T')[0],
        weekEnd: currentWeekEndDate.toISOString().split('T')[0],
      });

      // Move to the previous week
      currentWeekEndDate = new Date(currentWeekStartDate);
      currentWeekEndDate.setDate(currentWeekEndDate.getDate() - 1);
      currentWeekStartDate.setDate(currentWeekStartDate.getDate() - 7);
    }

    return weekDates;

  } catch (error) {
    console.log(error)
  }
}


/**
 * get all available weeks from start of of the app.
 * @returns {Promise<array>} - weekDates
 */
const getAllAvailableWeeksFromFirestore = async () => {
  try {

    // Get the first post and use its timestamp as the initialDatePoint
    const querySnapshot = await db.collection('posts').orderBy('createdAt').limit(1).get();
    if (querySnapshot.empty) {
      throw new Error('No posts found in the collection.');
    }
    const firstPost = querySnapshot.docs[0];

    const secs = firstPost.data().createdAt._seconds;
    const nanos = firstPost.data().createdAt._nanoseconds;
    let initialDatePoint = new Date(secs * 1000 + nanos / 1000000);

    // Calculate the current date
    const today = new Date();

    // Calculate week starting and ending dates
    const weekDates = [];
    let currentWeekStartDate = new Date(today);
    let currentWeekEndDate = new Date(currentWeekStartDate);

    currentWeekStartDate.setDate(currentWeekStartDate.getDate() - 6);

    while (currentWeekStartDate >= initialDatePoint || currentWeekEndDate >= initialDatePoint) {
      weekDates.push({
        weekStart: currentWeekStartDate.toISOString().split('T')[0],
        weekEnd: currentWeekEndDate.toISOString().split('T')[0],
      });

      // Move to the previous week
      currentWeekEndDate = new Date(currentWeekStartDate);
      currentWeekEndDate.setDate(currentWeekEndDate.getDate() - 1);
      currentWeekStartDate.setDate(currentWeekStartDate.getDate() - 7);
    }
    return weekDates;

  } catch (error) {
    console.log(error)
  }
}

/**
 * get all available weeks from start of the connectycube in millisecondsepoch format.
 * @param {bool} isMillisecondsEpochFormat - isMillisecondsEpochFormat
 * @returns {Promise<array>} - weekDates
 */
const getAllAvailableWeeksFromConnectycubeInMillisecondsEpochFormat = async (isMillisecondsEpochFormat) => {
  try {

    // Set the initial starting date to September 6, 2023
    // let initialDatePoint = new Date('2023-09-06');
    const initialDatePoint = initialCCDate;

    // Calculate the current date
    const today = new Date();

    // Calculate week starting and ending dates
    const weekDates = [];
    let currentWeekStartDate = new Date(today);
    let currentWeekEndDate = new Date(currentWeekStartDate);

    currentWeekStartDate.setDate(currentWeekStartDate.getDate() - 6);

    while (currentWeekStartDate >= initialDatePoint || currentWeekEndDate >= initialDatePoint) {

      if (isMillisecondsEpochFormat) {
        weekDates.push({
          weekStart: Math.floor(currentWeekStartDate.getTime() / 1000),
          weekEnd: Math.floor(currentWeekEndDate.getTime() / 1000),
        });
      }
      else {
        weekDates.push({
          weekStart: currentWeekStartDate.toISOString().split('T')[0],
          weekEnd: currentWeekEndDate.toISOString().split('T')[0],
        });
      }

      // Move to the previous week
      currentWeekEndDate = new Date(currentWeekStartDate);
      currentWeekEndDate.setDate(currentWeekEndDate.getDate() - 1);
      currentWeekStartDate.setDate(currentWeekStartDate.getDate() - 7);
    }
    return weekDates;

  } catch (error) {
    console.log(error)
  }
}

/**
 * Generates a list of dates for the last 7 days from today. (initialCCDate)
 * @param {date} initialDateTime - initialDateTime
 * @returns {Array<string>} - weekDates 
 */
const getWeeklyDatesAsKeys = (initialDateTime) => {
  try {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Set the initial starting date to September 6, 2023
    // let initialDatePoint = new Date('2023-09-06');
    const initialDatePoint = initialDateTime;

    // Calculate the current date
    const today = new Date(); 

    // Calculate week starting and ending dates
    const weekDates = [];
    let currentWeekStartDate = new Date(today);
    let currentWeekEndDate = new Date(currentWeekStartDate);

    currentWeekStartDate.setDate(currentWeekStartDate.getDate() - 6);

    while (currentWeekStartDate >= initialDatePoint || currentWeekEndDate >= initialDatePoint) {
      /// Formate two dates 
      const range = `${months[currentWeekStartDate.getMonth()]} ${currentWeekStartDate.getDate()} - ${months[currentWeekEndDate.getMonth()]} ${currentWeekEndDate.getDate()}`
      weekDates.push(range);

      // Move to the previous week
      currentWeekEndDate = new Date(currentWeekStartDate);
      currentWeekEndDate.setDate(currentWeekEndDate.getDate() - 1);
      currentWeekStartDate.setDate(currentWeekStartDate.getDate() - 7);
    }
    return weekDates;

  } catch (error) {
    console.log(error)
  }
}
/**
 * get all available daily dates in millisecondsepoch format.
 * @param {date} initialDateTime - initialDateTime
 * @param {date} endingDate - endingDate
 * @returns {Promise<array>} - dailyDates array
 */
const getAllAvailableDailyDatesInMillisecondsFormat = async (initialDateTime, endingDate) => {

  try {
    const today = endingDate;
    const initialDate = new Date(initialDateTime);
    const finalResult = [];
    let currentDate = new Date(today);

    while (currentDate >= initialDate) {
      const startOfDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 0, 0, 0, 0);
      const endOfDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 23, 59, 59, 999);

      finalResult.push({
        [startOfDate.getTime()]: {
          startMilliseconds: Math.ceil(startOfDate.getTime() / 1000),
          endMilliseconds: Math.ceil(endOfDate.getTime() / 1000),
        },
      });

      currentDate.setDate(currentDate.getDate() - 1); // Decrease the current date by 1 day
    }

    return finalResult;
  } catch (error) {
    console.log(error);
  }
}

// /**
//  *  @param {array} chunkedUsers
//  *  @param {weekDates} weekDates
//  *  @param {weekColumnDays} weekColumnDays
//  * @returns {Promise<array>} - Weekly Posts per user
//  */
const getPerUserWeeklyPostsDataFromAvailableWeekDates = async (chunkedUsers, weekDates, weekColumnDays) => {

  try {
    // gett posts for last 7 weeks from GCP (today date , 7 weeks ago date)
    // new date object for today - 1 day
    const today = new Date();
    today.setDate(today.getDate() - 1);
    // new date object for 7 weeks ago
    const sevenWeeksAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 49, 23, 59, 59, 999);
    // get all posts from GCP
    const allPosts = await getAllPostsFromGCP(today, sevenWeeksAgo);
    // Divide the posts into weeks
    const postsByWeek = {};
    // remove the weeks from end if gretaer than 8
    if (weekDates.length > 8) {
      weekDates.splice(0, weekDates.length - 8);
    }

    weekDates.forEach((week, index) => {
      const weekStart = new Date(week.weekStart);
      const weekEnd = new Date(week.weekEnd);

      const weekPosts = allPosts.filter((post) => {

        if (!post.createdAt) {
          console.log(`:x::x::x:Culprit; ${post}`);
          return false;
        }
        const postTimestamp = new Date(post.createdAt);
        return postTimestamp >= weekStart && postTimestamp <= weekEnd;
      });

      postsByWeek[`Week${index + 1} (${weekColumnDays[index]})`] = weekPosts;

    });

    // final list for each week 8 types of user counts
    const weeklyUsersCount = [];

    // apply for each loop on postsByWeek
    for (const week in postsByWeek) {

      // type of lists
      let zeroPostsPerWeek = 0;
      let onePostsPerWeek = 0;
      let twoPostsPerWeek = 0;
      let three2SevenPostsPerWeek = 0;
      let eight2TwentyPostsPerWeek = 0;
      let twentyOne2FiftyPostsPerWeek = 0;

      // for loop on users to check his posts count in current week

      chunkedUsers.forEach(async (chunk) => {

        chunk.forEach((user) => {
          try {

            // find user posts in current week
            const posts = postsByWeek[week].filter((post) => post.userId === user.id);

            if (posts.length == 0) {
              zeroPostsPerWeek++;
            }
            else if (posts.length == 1) {
              onePostsPerWeek++;
            }
            else if (posts.length == 2) {
              twoPostsPerWeek++;
            } else if (posts.length >= 3 && posts.length <= 7) {
              three2SevenPostsPerWeek++;
            } else if (posts.length >= 8 && posts.length <= 20) {
              eight2TwentyPostsPerWeek++;
            } else if (posts.length >= 21) {
              twentyOne2FiftyPostsPerWeek++;
            }

          } catch (_) {
            console.log("Error occured at chunkedUsers(): " + _);
          }
        });

      });
      let weekName = week;

      let weekMap = {};
      weekMap[weekName] = {

        'zeroPostsPerWeek': zeroPostsPerWeek,
        'onePostsPerWeek': onePostsPerWeek,
        'twoPostsPerWeek': twoPostsPerWeek,
        'three2SevenPostsPerWeek': three2SevenPostsPerWeek,
        'eight2TwentyPostsPerWeek': eight2TwentyPostsPerWeek,
        'twentyOne2FiftyPostsPerWeek': twentyOne2FiftyPostsPerWeek
      };
      // save this week users count in final lists
      weeklyUsersCount.push(
        weekMap
      );
    }

    return weeklyUsersCount;
  } catch (error) {
    console.log(error)
  }
}


/**
 *  @param {array} chunkedUsers
 *  @param {weekDates} weekDates
 * @returns {Promise<array>} - Weekly Messages Count Options per user
 */
const getPerUserWeeklyMessagesDataFromAvailableWeekDates = async (chunkedUsers, weeklyConnectycubeMessagesCount) => {

  try {


    // final list for each week 8 types of user counts
    const weeklyUsersCount = [];

    // apply for each loop on weeklyConnectycubeMessagesCount
    for (const week in weeklyConnectycubeMessagesCount) {
      console.log('====> Week is: '+ week);
      // type of lists
      let zeroPostsPerWeek = 0;
      let onePostsPerWeek = 0;
      let twoPostsPerWeek = 0;
      let three2SevenPostsPerWeek = 0;
      let eight2TwentyPostsPerWeek = 0;
      let twentyOne2FiftyPostsPerWeek = 0;
      let FiftyOne2HundredPostsPerWeek = 0;
      let OneHunderedOne2TwoHundredPostsPerWeek = 0;
      let twoHundredPlusPostsPerWeek = 0;

      // for loop on users to check his posts count in current week
      chunkedUsers.forEach(async (chunk) => {

        chunk.forEach((user) => {
          try {
            const userData = user.data();

            // find user posts in current week
            let posts = weeklyConnectycubeMessagesCount[week].filter((singleItem) => {

              const senderId = singleItem.cubeId;
              const cubeId = userData.cubeId;
              return senderId === String(cubeId);
            });

            if (posts.length == 0) {
              zeroPostsPerWeek++;
            }
            else if (posts.length == 1) {
              onePostsPerWeek++;
            }
            else if (posts.length == 2) {
              twoPostsPerWeek++;
            } else if (posts.length >= 3 && posts.length <= 7) {
              three2SevenPostsPerWeek++;
            } else if (posts.length >= 8 && posts.length <= 20) {
              eight2TwentyPostsPerWeek++;
            } else if (posts.length >= 21 && posts.length <= 50) {
              twentyOne2FiftyPostsPerWeek++;
            } else if (posts.length >= 51 && posts.length <= 100) {
              FiftyOne2HundredPostsPerWeek++;
            } else if (posts.length >= 101 && posts.length <= 200) {
              OneHunderedOne2TwoHundredPostsPerWeek++;
            } else if (posts.length >= 201) {
              twoHundredPlusPostsPerWeek++;
            }

          } catch (_) {
            console.log("Error occured at chunkedUsers(): " + _);
          }
        });

      });
      let weekName = week;

      let weekMap = {};
      weekMap[weekName] = {

        'zeroPostsPerWeek': zeroPostsPerWeek,
        'onePostsPerWeek': onePostsPerWeek,
        'twoPostsPerWeek': twoPostsPerWeek,
        'three2SevenPostsPerWeek': three2SevenPostsPerWeek,
        'eight2TwentyPostsPerWeek': eight2TwentyPostsPerWeek,
        'twentyOne2FiftyPostsPerWeek': twentyOne2FiftyPostsPerWeek,
        'FiftyOne2HundredPostsPerWeek': FiftyOne2HundredPostsPerWeek,
        'OneHunderedOne2TwoHundredPostsPerWeek': OneHunderedOne2TwoHundredPostsPerWeek,
        'twoHundredPlusPostsPerWeek': twoHundredPlusPostsPerWeek,
      };
      // save this week users count in final lists
      weeklyUsersCount.push(
        weekMap
      );
    }

    return weeklyUsersCount;
  } catch (error) {
    console.log(error)
  }
}


/**
 * Writing data to google sheet.
 * @param {array} weeklyUsersCount
 * @returns {Promise<array>} - weekly users count
 */
const getPerUserPostsGoogleSheetRawDataFromWeeklyUsersCount = async (weeklyUsersCount) => {

  try {
    const mapKeys = [];

    // Iterate through the array and print each item's key
    for (let i = 0; i < weeklyUsersCount.length; i++) {
      const item = weeklyUsersCount[i];
      const key = Object.keys(item)[0]; // Get the first (and only) key in the item
      mapKeys.push(key);
    }

    // Create an array to store perUserPostsCount of data
    let perUserPostsCount = [];

    // Add a header row
    const headerRow = [
      'Groups // Posts per user (users count)',
      ...mapKeys
    ];

    perUserPostsCount.push(headerRow);

    // Add a 0-2 users count row
    let zeroPostsRow = [
      '0 Posts',
    ];
    // Add a 0-2 users count row
    let onePostsRow = [
      '1 Post',
    ];
    // Add a 0-2 users count row
    let twoPostsRow = [
      '2 Posts',
    ];
    // Add a 3-7 users count row
    let three2SevenPostsRow = [
      '3-7 Posts',
    ];
    // Add a 8-20 users count row
    let eight2TwentyPostsRow = [
      '8-20 Posts',
    ];
    // Add a 21-50 users count row
    let twentyOne2FiftyPostsRow = [
      '20+ Posts',
    ];

    // Iterate through the array and print each item's key
    for (let i = 0; i < weeklyUsersCount.length; i++) {
      const item = weeklyUsersCount[i];
      const key = Object.keys(item)[0];
      const values = item[key];

      zeroPostsRow.push(values['zeroPostsPerWeek']);
      onePostsRow.push(values['onePostsPerWeek']);
      twoPostsRow.push(values['twoPostsPerWeek']);
      three2SevenPostsRow.push(values['three2SevenPostsPerWeek']);
      eight2TwentyPostsRow.push(values['eight2TwentyPostsPerWeek']);
      twentyOne2FiftyPostsRow.push(values['twentyOne2FiftyPostsPerWeek']);
    }

    if (zeroPostsRow.length < 0) return;
    if (zeroPostsRow.length > 0) perUserPostsCount.push(zeroPostsRow);
    if (onePostsRow.length > 0) perUserPostsCount.push(onePostsRow);
    if (twoPostsRow.length > 0) perUserPostsCount.push(twoPostsRow);
    if (three2SevenPostsRow.length > 0) perUserPostsCount.push(three2SevenPostsRow);
    if (eight2TwentyPostsRow.length > 0) perUserPostsCount.push(eight2TwentyPostsRow);
    if (twentyOne2FiftyPostsRow.length > 0) perUserPostsCount.push(twentyOne2FiftyPostsRow);

    return perUserPostsCount;

  } catch (error) {
    console.log("erroroccured in getPerUserPostsGoogleSheetRawDataFromWeeklyUsersCount(): " + error)
  }
}


/**
 * Writing data to google sheet.
 * @param {array} weeklyUsersCount
 * @returns {Promise<array>} - weekly users count
 */
const getPerUserMessagesGoogleSheetRawDataFromWeeklyUsersCount = async (weeklyUsersCount) => {

  try {
    const mapKeys = [];

    // Iterate through the array and print each item's key
    for (let i = 0; i < weeklyUsersCount.length; i++) {
      const item = weeklyUsersCount[i];
      const key = Object.keys(item)[0];
      mapKeys.push(key);
    }

    // Create an array to store perUserPostsCount of data
    let perUserPostsCount = [];

    // Add a header row
    const headerRow = [
      'Groups // Messages per user (users count)',
      ...mapKeys
    ];

    perUserPostsCount.push(headerRow);

    // Add a 0-2 users count row
    let zeroPostsRow = [
      '0 Messages',
    ];
    // Add a 0-2 users count row
    let onePostsRow = [
      '1 Message',
    ];
    // Add a 0-2 users count row
    let twoPostsRow = [
      '2 Messages',
    ];
    // Add a 3-7 users count row
    let three2SevenPostsRow = [
      '3-7 Messages',
    ];
    // Add a 8-20 users count row
    let eight2TwentyPostsRow = [
      '8-20 Messages',
    ];
    // Add a 21-50 users count row
    let twentyOne2FiftyPostsRow = [
      '21-50 Messages',
    ];
    // Add a 51-100 users count row
    let FiftyOne2HundredPostsRow = [
      '51-100 Messages',
    ];
    // Add a 101-200 users count row
    let OneHunderedOne2TwoHundredPostsRow = [
      '101-200 Messages',
    ];
    // Add a 201-400 users count row
    let twoHundredPlusPostsRow = [
      '201+ Messages',
    ];

    // Iterate through the array and print each item's key
    for (let i = 0; i < weeklyUsersCount.length; i++) {
      const item = weeklyUsersCount[i];
      const key = Object.keys(item)[0];
      const values = item[key];

      zeroPostsRow.push(values['zeroPostsPerWeek']);
      onePostsRow.push(values['onePostsPerWeek']);
      twoPostsRow.push(values['twoPostsPerWeek']);
      three2SevenPostsRow.push(values['three2SevenPostsPerWeek']);
      eight2TwentyPostsRow.push(values['eight2TwentyPostsPerWeek']);
      twentyOne2FiftyPostsRow.push(values['twentyOne2FiftyPostsPerWeek']);
      FiftyOne2HundredPostsRow.push(values['FiftyOne2HundredPostsPerWeek']);
      OneHunderedOne2TwoHundredPostsRow.push(values['OneHunderedOne2TwoHundredPostsPerWeek']);
      twoHundredPlusPostsRow.push(values['twoHundredPlusPostsPerWeek']);
    }

    if (zeroPostsRow.length < 0) return;
    if (zeroPostsRow.length > 0) perUserPostsCount.push(zeroPostsRow);
    if (onePostsRow.length > 0) perUserPostsCount.push(onePostsRow);
    if (twoPostsRow.length > 0) perUserPostsCount.push(twoPostsRow);
    if (three2SevenPostsRow.length > 0) perUserPostsCount.push(three2SevenPostsRow);
    if (eight2TwentyPostsRow.length > 0) perUserPostsCount.push(eight2TwentyPostsRow);
    if (twentyOne2FiftyPostsRow.length > 0) perUserPostsCount.push(twentyOne2FiftyPostsRow);
    if (FiftyOne2HundredPostsRow.length > 0) perUserPostsCount.push(FiftyOne2HundredPostsRow);
    if (OneHunderedOne2TwoHundredPostsRow.length > 0) perUserPostsCount.push(OneHunderedOne2TwoHundredPostsRow);
    if (twoHundredPlusPostsRow.length > 0) perUserPostsCount.push(twoHundredPlusPostsRow);

    return perUserPostsCount;

  } catch (error) {
    console.log("erroroccured in getPerUserMessagesGoogleSheetRawDataFromWeeklyUsersCount(): " + error)
  }
}

/**
 *  @param {weekDates} weekDates
 *  @returns {Promise<array>} - Weekly connectycube messages
 */
const getWeeklyConnectycubeMessagesData = async (weekDates) => {

  try {

    // Modified version with Promise.all
    const messagesByWeek = {};
    await Promise.all(weekDates.map(async (week, index) => {
      const weekStart = week.weekStart;
      const weekEnd = week.weekEnd;

      // const weekChatrooms = await stateApi.getConnectycubeMessagesData(weekStart, weekEnd);
      const weekChatrooms = await getWeeklyMessagesDataFromGcp(weekStart * 1000, weekEnd * 1000);

      messagesByWeek[`Week${index + 1}`] = weekChatrooms;
    }));

    // Get the keys and sort them
    // const sortedKeys = Object.keys(messagesByWeek).sort();
    // // Create a new object with the sorted keys
    // const sortedWeeklyMessagesCount = sortedKeys.reduce((acc, key) => {
    //   acc[key] = messagesByWeek[key];
    //   return acc;
    // }, {});

    const sortedKeys = Object.keys(messagesByWeek).sort((a, b) => {
      const weekNumberA = parseInt(a.match(/\d+/)[0]);
      const weekNumberB = parseInt(b.match(/\d+/)[0]);
      return weekNumberA - weekNumberB;
    });

    const sortedWeeklyMessagesCount = {};
    sortedKeys.forEach(key => {
      sortedWeeklyMessagesCount[key] = messagesByWeek[key];
    });

    return sortedWeeklyMessagesCount;
  } catch (error) {
    console.log("error occurred in getWeeklyConnectycubeMessagesData(): " + error);
  }
}

/**
 * Writing data to google sheet.
 * @param {array} perUserPostsCount - perUserPostsCount data to add into sheet
 * @param {string} sheetname - name of the sheet
 * @param {string} spreadsheetId - id of the sheet
 * @param {string} rangeStartingPoint - range to update in sheet
 * 
 */
const writeRawDataIntoGoogleSheet = async (perUserPostsCount, sheetname, spreadsheetId, rangeStartingPoint) => {

  const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
  try {

    const auth = new GoogleAuth({
      // TODO(BADAR):Remove this key if pushing
      // keyFile: '/Volumes/dumb/girl-z-cloudfunctions/functions/girlz-dev-3233fb523984.json',
      scopes: SCOPES,
      credentials: ADMIN_CREDENTIAL,
    });

    const authClient = await auth.getClient();

    const sheets = google.sheets({ version: 'v4', auth: authClient });
    const values = perUserPostsCount
    resource = { values };

    try {
      sheets.spreadsheets.values.update({
        spreadsheetId: spreadsheetId,
        range: `${sheetname}!${rangeStartingPoint}`,
        valueInputOption: 'RAW',
        resource,
      }).then((response) => {
        console.log('✅ Updated cells: ' + response.data.updatedCells);
      });
    } catch (error) {
      console.log(error)
    }
  } catch (error) {
    console.log(error)
  }
}

/**
 * Add a new column to a Google Sheet and shift existing columns to the right.
 *
 * @param {string} sheetId - ID of the Google Sheet.
 * @param {string} sheetName - Name of the sheet where the new column should be added.
 * @param {number} columnIndex - Index of the new column (e.g., 1 for the first column). `Defaults to "1" = Col:B`.
 * @param {string[]} columnData - An array of data to be added to the new column.
 */
async function addNewColumnToSheet(sheetId, sheetName, columnData, columnIndex = 1) {
  const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
  const { google } = require('googleapis');

  try {
    const auth = new GoogleAuth({
      // TODO(BADAR):Remove this key if pushing
      // keyFile: '/Volumes/dumb/girl-z-cloudfunctions/functions/girlz-dev-3233fb523984.json',
      scopes: SCOPES,
      credentials: ADMIN_CREDENTIAL,
    });
    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient });

    // Retrieve the current data in the specified sheet.
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: sheetName,
    });

    const currentData = response.data.values || [];

    // Insert the new column at the specified index.
    currentData.forEach((row, rowIndex) => {
      row.splice(columnIndex, 0, columnData[rowIndex][1] || ''); // Insert a cell or empty string.

      // check if each row have more than 8 length then remove extra data from end side
      if (row.length > 8) {
        row.splice(8, row.length, '');
      }
    });
    console.log('--->After currentData: ', currentData);
    /// If have data, update the sheet with the modified data.
    if (currentData.length > 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: sheetName,
        valueInputOption: 'RAW',
        resource: { values: currentData },
      }).then((response) => {
        console.log('✅ Updated cells: ' + response.data.updatedCells);
      });
    } else {
      /// If no data, add a new column with the specified data. (Create as new)
      await writeRawDataIntoGoogleSheet(columnData, sheetName, sheetId, 'A1');
    }

  } catch (error) {
    console.error(JSON.stringify(error, null, 2));
  }
}

// split array into 240 chunks
const chunkArray = (array, size) => {
  const chunked_arr = [];
  let index = 0;
  while (index < array.length) {
    chunked_arr.push(array.slice(index, size + index));
    index += size;
  }
  return chunked_arr;
};


/**
 * get weekly users registrations and their weekly posts creations.
 * @param {array} chunkedUsers - chunkedUsers
 */
const runUsersThatOpenedAppCohort = async (chunkedUsers) => {
  try {

    /// Generate week dates as human readable format and as keys
    let weekColumnDays = getWeeklyDatesAsKeys(initialTwentyOneWeekCohortDate);

    weekColumnDays = weekColumnDays.reverse();

    // check if the weekColumnDays has > 4 entries leave only last 4 entries and delete others
    if (weekColumnDays.length > 4) {
      weekColumnDays.splice(0, weekColumnDays.length - 4);
    }

    // Getting all Available Weeks
    let weekDates = await getAllAvailableWeeks(initialTwentyOneWeekCohortDate);

    // check if the weekDates has > 4 entries leave the first 4 entries and delete others
    if (weekDates.length > 4) {
      weekDates.splice(4, weekDates.length - 4);
    }

    let weekDatesFromStartToEnd = [...weekDates].reverse();

    // check if the weekDatesFromStartToEnd has > 4 entries leave only last 4 entries and delete others
    if (weekDatesFromStartToEnd.length > 4) {
      weekDatesFromStartToEnd.splice(0, weekDatesFromStartToEnd.length - 4);
    }

    // getting weekly user registrations
    let weeklyUsersRegistrationsCount = {};
    weeklyUsersRegistrationsCount = await getWeeklyUsersRegistrationsCount(chunkedUsers, weekDatesFromStartToEnd);

    // getting weekly new post creations
    let weeklyNewPostsCreationsCount = {};
    weeklyNewPostsCreationsCount = await getWeeklyLastVisitToApp(weekDates);

    // // check out the no of weeks in weeklyNewPostsCreationsCount, which has posts 
    // // like we have let usersByWeek = {}; and the data inside it is like below
    // // usersByWeek[`Week${index + 1}`] = weeklyUsers;
    // // so find out the no of weeks in usersByWeek which has weeklyUsers > 0
    let weeksWithPosts = 0;
    for (let i = 0; i < Object.keys(weeklyNewPostsCreationsCount).length; i++) {
      let week = Object.keys(weeklyNewPostsCreationsCount)[i];
      let weeklyPosts = weeklyNewPostsCreationsCount[week];
      if (weeklyPosts && weeklyPosts.length > 0) {
        weeksWithPosts++;
      }
    }

    console.log('weeksWithPosts is: ', weeksWithPosts);

    // // now cut down the weeklyUsersRegistrationsCount, weeklyUsersRegistrationsCount and weekColumnDays to weeksWithPosts and keep the first weeksWithPosts weeks data
    if (weeksWithPosts > 0) {
      // cut down weeklyUsersRegistrationsCount to weeksWithPosts and keep the last weeksWithPosts weeks data
      let weeklyUsersRegistrationsCountKeys = Object.keys(weeklyUsersRegistrationsCount);
      if (weeklyUsersRegistrationsCountKeys.length > weeksWithPosts) {
        weeklyUsersRegistrationsCountKeys.splice(0, weeklyUsersRegistrationsCountKeys.length - weeksWithPosts);
      }
      let weeklyUsersRegistrationsCountValues = Object.values(weeklyUsersRegistrationsCount);
      if (weeklyUsersRegistrationsCountValues.length > weeksWithPosts) {
        weeklyUsersRegistrationsCountValues.splice(0, weeklyUsersRegistrationsCountValues.length - weeksWithPosts);
      }
      weeklyUsersRegistrationsCount = {};
      for (let i = 0; i < weeklyUsersRegistrationsCountKeys.length; i++) {
        weeklyUsersRegistrationsCount[`Week${i + 1}`] = weeklyUsersRegistrationsCountValues[i];
      }

      // cut down weeklyNewPostsCreationsCount to weeksWithPosts and keep the first weeksWithPosts weeks data and remove last entries
      let weeklyNewPostsCreationsCountsKeys = Object.keys(weeklyNewPostsCreationsCount);

      if (weeklyNewPostsCreationsCountsKeys.length > weeksWithPosts) {
        weeklyNewPostsCreationsCountsKeys = weeklyNewPostsCreationsCountsKeys.slice(0, weeksWithPosts);
      }

      let weeklyNewPostsCreationsCountsValues = Object.values(weeklyNewPostsCreationsCount);
      if (weeklyNewPostsCreationsCountsValues.length > weeksWithPosts) {
        weeklyNewPostsCreationsCountsValues = weeklyNewPostsCreationsCountsValues.slice(0, weeksWithPosts);
      }
      weeklyNewPostsCreationsCount = {};
      for (let i = 0; i < weeklyNewPostsCreationsCountsKeys.length; i++) {
        weeklyNewPostsCreationsCount[weeklyNewPostsCreationsCountsKeys[i]] = weeklyNewPostsCreationsCountsValues[i];
      }

      // cut down weekColumnDays to weeksWithPosts and keep the last weeksWithPosts weeks data
      if (weekColumnDays.length > weeksWithPosts) {
        weekColumnDays.splice(0, weekColumnDays.length - weeksWithPosts);
      }
    }

    // get final sheet raw data for weekly users and posts
    let weeklyUsersAndPostsGoogleSheetRawData = [];
    weeklyUsersAndPostsGoogleSheetRawData = await getWeeklyUsersAndAppOpenedGoogleSheetRawDataFromWeeklyUsersRegistrationsCountAndWeeklyNewAppOpenedCount(weeklyUsersRegistrationsCount, weeklyNewPostsCreationsCount, weekColumnDays);
    if (weeklyUsersAndPostsGoogleSheetRawData) {
      console.log('if weeklyUsersAndPostsGoogleSheetRawData.length is: ', weeklyUsersAndPostsGoogleSheetRawData.length);
    }
    else {
      console.log('else weeklyUsersAndPostsGoogleSheetRawData.length is: ', weeklyUsersAndPostsGoogleSheetRawData);
      return;
    }

    console.table(weeklyUsersAndPostsGoogleSheetRawData);

    const sheetName = 'Cohorted Data';

    const sheetId = NEW_SHEET_ID;

    const rangeStartingPoint = (weeksWithPosts) ? `A2:Z${2 + 4 + weeksWithPosts}` : 'A2:Z20'; // 'A2:Z20';
    // Calling writeRawDataIntoGoogleSheet() to write weekly registrations and post creations data in sheet rows format
    await writeRawDataIntoGoogleSheet(weeklyUsersAndPostsGoogleSheetRawData, sheetName, sheetId, rangeStartingPoint);

  }
  catch (_) {
    console.log('error occured in runUsersThatOpenedAppCohort(): ', _);
  }

}


// /**getWeeklyNewPostsCreationsCount
//  *  @param {weekDates} weekDates
//  *  @returns {Promise<array>} - Weekly new posts creations
//  */
const getWeeklyLastVisitToApp = async (weekDates) => {

  try {

    const postsCollectionRef = db.collection('fcmTokens');

    // Retrieve all posts
    const allPosts = [];
    const postsSnapshot = await postsCollectionRef.get();

    if (postsSnapshot.empty || postsSnapshot.docs.length < 0) return;
    // split users into chunks of 490
    const chunkedPosts = chunkArray(postsSnapshot.docs, 490);

    // convert this chunkedPosts.forEach to for loop
    for (let i = 0; i < chunkedPosts.length; i++) {
      const chunk = chunkedPosts[i];

      for (let j = 0; j < chunk.length; j++) {
  
        try{

        const post = chunk[j];
        const lastVisit = post.data().updatedAt;
        let allVisitsToApp = post.data().allVisitsToApp || [];

        if (lastVisit) {
          allPosts.push({
            id: post.id,
            'lastVisitAt': lastVisit,
            'allVisitsToApp': allVisitsToApp
          });
        }

      } catch (_) {
        console.log("Error occured at for loop of getWeeklyNewPostsCreationsCount(): " + _);
      }
      }
    }

    // Divide the posts into weeks
    const postsByWeek = {};
    weekDates.forEach((week, index) => {
      const weekStart = new Date(week.weekStart);
      const weekEnd = new Date(week.weekEnd);

      const weekPosts = allPosts.filter((post) => {

        let postExists = false;
        
        // check if allVisitsToApp is empty 
        if(post.allVisitsToApp.length == 0) {

          const postTimestamp = new Date(post.lastVisitAt._seconds * 1000 + post.lastVisitAt._nanoseconds / 1000000);
          // Create a new Date object with only the date, month, and year
          const postDateOnly = new Date(postTimestamp.getFullYear(), postTimestamp.getMonth(), postTimestamp.getDate());

          postExists =  postDateOnly >= weekStart && postDateOnly <= weekEnd;

        }
        else{
          // iterate of allVisitsToApp and check if any visit is in current week
          for(let i = 0; i < post.allVisitsToApp.length; i++) {

            const postTimestamp = new Date(post.allVisitsToApp[i]._seconds * 1000 + post.allVisitsToApp[i]._nanoseconds / 1000000);
            // Create a new Date object with only the date, month, and year
            const postDateOnly = new Date(postTimestamp.getFullYear(), postTimestamp.getMonth(), postTimestamp.getDate());

            if(postDateOnly >= weekStart && postDateOnly <= weekEnd){
            
              postExists = true;
              break;
            }
          }
        }

        return postExists;
      });
      postsByWeek[`Week${index + 1}`] = weekPosts;
    });

    return postsByWeek;

  }
  catch (error) {
    console.log("error occured in getWeeklyNewPostsCreationsCount():" + error);
  }
}

/**
 * Writing weekly users and weekly posts data to google sheet.
 * @param {array} weeklyUsersRegistrationsCount
 * @param {array} weeklyNewPostsCreationsCount
 * @param {Array} weekColumnDays
 * @returns {Promise<array>} - Weekly users and posts raw data
 */
const getWeeklyUsersAndAppOpenedGoogleSheetRawDataFromWeeklyUsersRegistrationsCountAndWeeklyNewAppOpenedCount = async (weeklyUsersRegistrationsCount, weeklyNewPostsCreationsCount, weekColumnDays) => {

  try {

    let weekKeys = ['', ''];

    for (let key in weeklyNewPostsCreationsCount) {
      // Use hasOwnProperty to make sure key is not inherited from the prototype chain
      if (weeklyNewPostsCreationsCount.hasOwnProperty(key)) {
        weekKeys.push(key);
      }
    }

    // apply for loop on weekColumnDays,length and append  weekColumnDays data into weekKeys  array
    for (let i = 0; i < weekColumnDays.length; i++) {
      // append weekColumnDays data into weekKeys array same index
      weekKeys[i + 2] = `${weekKeys[i + 2]} (${weekColumnDays[i]})`;
    }

    // Create an array to store per week Users and Posts Count for sheet
    let weeklyUsersAndPostsCount = [];
    // set header row in final sheet raw data
    weeklyUsersAndPostsCount.push(weekKeys);

    // Create an array to store per week Users and Posts Count for sheet
    let dummyWeeklyUsersAndPostsCount = [];
    // set header row in final sheet raw data
    dummyWeeklyUsersAndPostsCount.push(weekKeys);

    // iterate through the array and save each item in parent row
    const keys = Object.keys(weeklyNewPostsCreationsCount);
    const userKeys = Object.keys(weeklyUsersRegistrationsCount);


    for (let i = 0; i < keys.length; i++) {
      const parentKey = keys[i];

      let childDataRow = [];

      let dummyChildDataRow = [];


      // child loop to save data in child row
      for (let j = 0; j < keys.length - i; j++) {
        const postChildKey = keys[j];

        const userChildKey = userKeys[i];

        let posts = weeklyNewPostsCreationsCount[postChildKey];
        let users = weeklyUsersRegistrationsCount[userChildKey];
        let totalPosts = 0;

        users.forEach(user => {
          posts.forEach(post => {
            if (post.id === user.uid) {
              totalPosts++;
            }
          });
        });

        let userPercentage = (totalPosts / users.length) * 100;

        childDataRow.push(`${totalPosts}`);
        dummyChildDataRow.push(userPercentage);
      }
      let usersCount = weeklyUsersRegistrationsCount[parentKey].length;
      // add week no in the start of row
      let parentDataRow = [
        weekColumnDays[i],
        usersCount,
        ...childDataRow.reverse() /// REVERSING // BADAR
      ];

      // set single dummy row in final sheet raw data
      weeklyUsersAndPostsCount.push(parentDataRow);

      // add week no in the start of row
      let dummyParentDataRow = [
        weekColumnDays[i],
        usersCount,
        ...dummyChildDataRow.reverse() /// REVERSING // BADAR
      ];

      // set single dummy row in final sheet raw data
      dummyWeeklyUsersAndPostsCount.push(dummyParentDataRow);

    }

    let columnPercentages = getColumnWisePercentage(dummyWeeklyUsersAndPostsCount);

    columnPercentages = [
      ...columnPercentages.slice(0, 0),
      'Open the app per week',
      ...columnPercentages.slice(1)
    ];
    const finalWeeklyUsersAndCounts = [
      ...weeklyUsersAndPostsCount.slice(0, 1),
      columnPercentages,
      ...weeklyUsersAndPostsCount.slice(1)
    ];

    return finalWeeklyUsersAndCounts;
  } catch (error) {
    console.log("error occured in getWeeklyUsersAndPostsGoogleSheetRawDataFromWeeklyUsersRegistrationsCountAndWeeklyNewPostsCount() " + error);
  }
}

/* get Column Wise Percentage of users who opened the app
 *  @param {data} dummyWeeklyUsersAndPostsCount
 *  @returns {array} - Percentages of users who opened the app column wise
 */
const getColumnWisePercentage = (data) => {

  try {
    const columnSums = Array.from({ length: data[0].length }, () => 0);
    const columnCounts = Array.from({ length: data[0].length }, () => 0);

    for (let i = 1; i < data.length; i++) {
      for (let j = 2; j < data[i].length; j++) {
        const value = isNaN(data[i][j]) ? 0 : data[i][j];
        columnSums[j] += value;
        columnCounts[j]++;
      }
    }

    const columnAverages = columnSums.map((sum, index) => {
      if (index < 2) {
        return data[0][index]; // Keep the non-numeric values unchanged
      } else {
        return columnCounts[index] === 0 ? `0%` : `${(sum / columnCounts[index]).toFixed(1)}%`;
      }
    });

    return columnAverages;
  }
  catch (error) {
    console.log("error occured in getColumnWisePercentage():" + error);
  }
}


/**
 * Add a new column to a Google Sheet and shift existing columns to the right.
 *
 * @param {string} sheetId - ID of the Google Sheet.
 * @param {string} sheetName - Name of the sheet where the new column should be added.
 * @param {string} rangeStartingPoint - starting line no or row no.
 * @param {number} columnIndex - Index of the new column (e.g., 1 for the first column). `Defaults to "1" = Col:B`.
 * @param {string[]} columnData - An array of data to be added to the new column.
 * @param {array} latestWeek - latestWeek
 * @param {string} latestWeekColumnDay - latestWeekColumnDay
 */
async function modifyAndUpdateMessagesPerUserNewColumnToSheet(sheetId, sheetName, columnData, latestWeek, latestWeekColumnDay, columnIndex = 1) {
  const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
  const { google } = require('googleapis');

  try {
    const auth = new GoogleAuth({
      // TODO(BADAR):Remove this key if pushing
      // keyFile: '/Volumes/dumb/girl-z-cloudfunctions/functions/girlz-dev-3233fb523984.json',
      scopes: SCOPES,
      credentials: ADMIN_CREDENTIAL,
    });
    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient });

    // Retrieve the current data in the specified sheet.
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `${sheetName}!A14:K23`,
    });

    const currentData = response.data.values || [];

    const todayDayStart = getTodayDateInMillisFormat();
    const weekSecondDay = getNextDateInMillisFormat(new Date(latestWeek['weekStart'] * 1000));

    console.log('===> todayDayStart is: '+ todayDayStart + " and weekSecondDay is: " + weekSecondDay);


    if (todayDayStart >= latestWeek['weekStart'] && todayDayStart < weekSecondDay) {

      const gRawData = __convertMessagesPerUserIntoGoogleSheetRawData(columnData);

      const headersRow = [currentData[0][0]];

      for (let rowIndex = 1; rowIndex < currentData[0].length; rowIndex++) {

        let previousWeekDate = currentData[0][rowIndex].substring(currentData[0][rowIndex].lastIndexOf("(") + 1, currentData[0][rowIndex].lastIndexOf(")"));

        headersRow.push(`Week${rowIndex + 1} (${previousWeekDate})`);

      }
      currentData[0] = headersRow;

      // Insert the new column at the specified index.
      currentData.forEach((row, rowIndex) => {

        if (rowIndex == 0) {
          row.splice(columnIndex, 0, `${gRawData[rowIndex][1]} (${latestWeekColumnDay})` || '0'); // Insert a cell or empty string.
        }
        else {
          row.splice(columnIndex, 0, gRawData[rowIndex][1] || '0'); // Insert a cell or empty string.
        }

        // check if each row have more than 1 length then remove extra data from end side
        if (row.length > 11) {
          row.splice(11, row.length, '');
        }
      });

      /// If have data, update the sheet with the modified data.
      if (currentData.length > 0) {
        await sheets.spreadsheets.values.update({
          spreadsheetId: sheetId,
          range: `${sheetName}!A14:K23`,
          valueInputOption: 'RAW',
          resource: { values: currentData },
        }).then((response) => {
          console.log('✅ Updated cells: ' + response.data.updatedCells);
        });
      } else {
        /// If no data, add a new column with the specified data. (Create as new)
        await writeRawDataIntoGoogleSheet(gRawData, sheetName, sheetId,
          'A14:K23' // 'A1'
        );
      }
    }
    else if (todayDayStart > latestWeek['weekStart'] && todayDayStart >= weekSecondDay && todayDayStart <= latestWeek['weekEnd']) {

      const gRawData = __convertMessagesPerUserIntoGoogleSheetRawData(columnData);

      const headersRow = [currentData[0][0]];

      for (let rowIndex = 1; rowIndex < currentData[0].length; rowIndex++) {

        let previousWeekDate = currentData[0][rowIndex].substring(currentData[0][rowIndex].lastIndexOf("(") + 1, currentData[0][rowIndex].lastIndexOf(")"));

        headersRow.push(`Week${rowIndex} (${previousWeekDate})`);
      }
      currentData[0] = headersRow;

      // update the old columns at the specified index.
      currentData.forEach((row, rowIndex) => {

        if (rowIndex == 0) {
          row.splice(columnIndex, 1, `${gRawData[rowIndex][1]} (${latestWeekColumnDay})` || '0'); // Insert a cell or empty string.
        }
        else {
          row.splice(columnIndex, 1, gRawData[rowIndex][1] || '0'); // Insert a cell or empty string.
        }

        // check if each row have more than 11 length then remove extra data from end side
        if (row.length > 11) {
          row.splice(11, row.length, '');
        }
      });

      /// If have data, update the sheet with the modified data.
      if (currentData.length > 0) {
        await sheets.spreadsheets.values.update({
          spreadsheetId: sheetId,
          range: `${sheetName}!A14:K23`,
          valueInputOption: 'RAW',
          resource: { values: currentData },
        }).then((response) => {
          console.log('✅ Updated cells: ' + response.data.updatedCells);
        });
      } else {
        /// If no data, add a new column with the specified data. (Create as new)
        await writeRawDataIntoGoogleSheet(gRawData, sheetName, sheetId, 'A14:K23' // 'A1'
        );
      }

    }
    else {
      console.log('===> inside else');
    }
  } catch (error) {
    console.error(JSON.stringify(error, null, 2));
  }
}

module.exports = {
  getProvidersBasedAuthUserCountAndUnverifiedUsersData,
  getBottomLinesData,
  getUsersAndPostsReportsData,
  getWeeklyLoggedInUsersAndWhoAnsweredToPostsData,
  getWeeklyLoggedInUsersAndTheirPostsData,
  getUserPostsData,
  getWeeklyUserRegistrationsAndTheirWeeklyPostsData,
  writeRawDataIntoGoogleSheet,
  getAllAvailableWeeksFromConnectycubeInMillisecondsEpochFormat,
  getWeeklyUsersRegistrationsCount,
  getWeeklyConnectycubeMessagesData,
  getWeeklyUserRegistrationsAndWeeklyConnectycubeMessagesData,
  getWeeklyLoggedInUsersAndTheirParticipationInChatroomsData,
  getAllAvailableDailyDatesInMillisecondsFormat,
  getWeeklyNewMessagesAndTheirChatroomsCountData,
  getWeeklyDatesAsKeys,
  runUsersThatOpenedAppCohort,
  getWeeklyUserRegistrationsAndTheirMessagesDataPlusMessagesPerUserData

}
