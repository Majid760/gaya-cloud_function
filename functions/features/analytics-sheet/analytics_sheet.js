const admin = require("firebase-admin");
const db = admin.firestore();
const analyticsSheetServices = require("./analytics-sheet-services/analytics_sheet_services.js")
const { runTop10PostsAndTheirResponses } = require("./top_posts_and_their_responses/top_posts_and_responses_on_it_services.js");
const stateApi = require('../connecty-cube/admin-sdk/cc_axios_api.js');
// const googleSheetCredencials = require("../../girlz-dev-3233fb523984.json");
const { enqueueWeeklyRegistrationsAndCCMessagesAnalyticsTask, enqueueTop1000PostsAnalyticsTask, enqueueAnalyticsTask, enqueuePostsAndReportedPostsAnalyticsTask, enqueueUserRegistrationsAndPotsAndUsersWhoOpenedAppAnalyticsTask  } = require('../../tasks/analytics_tasks/analytics_tasks_for_sheet.js')
const { runAnswersOnPostsDensity } = require("./top_posts_and_their_responses/post_answers_density_groups.js");
const { runDailtTiktokStats } = require("./analytics-sheet-services/bottom-lines/tiktok_services.js");


// /**
//  *  Function to get and update daily MessagesCount/ChatroomsCount data into firestore
//  */
const getAndUpdateCCDailyMessagesAndChatroomCountToFirestore = async () => {

    try {
        const todayDate = new Date();
        const dialyDates = await analyticsSheetServices.getAllAvailableDailyDatesInMillisecondsFormat(todayDate, todayDate);
        // Modified version with Promise.all
        const messagessByDays = {};
        await Promise.all(
            dialyDates.map(async (item) => {
                const key = Object.keys(item)[0];
                const value = item[key];
                const dailyMesages = await stateApi.getConnectycubeMessagesData(value.startMilliseconds, value.endMilliseconds);
                messagessByDays[key] = dailyMesages;
            })
        );

        // Printing the sorted keys and their total lengths
        const sortedKeys = Object.keys(messagessByDays).sort();
        const dailyMessages = {};
        for (const key of sortedKeys) {
            const messages = messagessByDays[key];
            dailyMessages[key] = messages; // Store the sorted data
        }

        const result = [];

        Object.keys(dailyMessages).forEach((day) => {
            const messages = dailyMessages[day];
            const totalDialogsCountSet = new Set();
            const totalMessagesCount = messages.length;
            messages.forEach((message) => {
                totalDialogsCountSet.add(message.chat_dialog_id);
            });
            result.push({
                [day]: {
                    totalDialogsCount: totalDialogsCountSet.size,
                    totalMessagesCount: totalMessagesCount,
                    'date': parseInt(day),
                }
            });
        });

        const chunkedUsers = chunkArray(result, 490);
        let dailyMessagesAndChatroomsCollectionRef = admin.firestore().collection('analytics').doc('dailyMessagesAndChatrooms').collection('dailyMessagesAndChatrooms');

        for (const chunk of chunkedUsers) {
            const batch = admin.firestore().batch();

            chunk.forEach((data) => {
                try {
                    const key = Object.keys(data)[0];
                    const docRef = dailyMessagesAndChatroomsCollectionRef.doc(key);

                    // Extracting the data associated with the key
                    const dataToWrite = data[key];

                    // Add data to the document
                    batch.set(docRef, dataToWrite, { merge: true })

                } catch (error) {
                    console.error("Error occurred during daily messages processing:", error);
                }
            });

            await batch.commit();
        }

        console.log('Data written into Firestore successfully.');

    }
    catch (_) {
        console.log('Error occured at getAndUpdateCCDailyMessagesAndChatroomCountToFirestore(): ' + _);
    }
}

// /**
//  * Daily Analytics Updates
//  */
const saveDailyAnalyticUpdates = async () => {

    // start and end time of below function
    const start = new Date();
    console.log(`--------------> TEST start time: ${start}`);
    
    /// Enqueue task to send bot message reply
    await enqueueTop1000PostsAnalyticsTask();

    // Bootom Lines total users registerations, invites, messages, and chatrooms count
    await getBottomLineData();  // NEW SHEET
    console.log(`********** 1 Done **********`);

    // // // get daily tiktok KFactor conversion data  
    // // await runDailtTiktokStats(); 
 
    const end = new Date();
    console.log(`--------------> TEST end time: ${end}`);

}

// /**
//  * Weekly Analytics Updates
//  */
const saveWeeklyAnalyticUpdates = async () => {

    // start and end time of below function
    const start = new Date();
    console.log(`--------------> TEST start time: ${start}`);

    // const { getAllFirestoreUsers } = require('../../features/analytics-sheet/consts.js');

    // const users = await getAllFirestoreUsers();
    // if (users.empty || users.docs.length < 0) return;
    // // split users into chunks of 490
    // const chunkedUsers = chunkArray(users.docs, 490);

    // // Weekly New user registrations and Weekly Connectycube messages count Plys(+) Messages per user
    // await getWeeklyUserRegistrationsAndTheirMessagesDataPlusMessagesPerUserData(chunkedUsers); // by waqar Users and their messages, weekly messages length category based users count 
    // console.log(`********** 0.0 Done **********`);
    
    // Paused by almog AS IT CRASHING (TIMEOUT ISSUE)
    // /// Enqueue task to send bot message reply
    // await enqueueWeeklyRegistrationsAndCCMessagesAnalyticsTask();
    // // /// Enqueue task to send bot message reply
    // await enqueueAnalyticsTask();
 
    // Enque task to get posts and reported posts data
    await enqueuePostsAndReportedPostsAnalyticsTask();

    // Enque task to get user registrations and posts and users who opened app data
    await enqueueUserRegistrationsAndPotsAndUsersWhoOpenedAppAnalyticsTask();

    const end = new Date();
    console.log(`--------------> TEST end time: ${end}`);

}


/**
 *  get Providers Based Auth User Count Data count and Unverified Users count
 */
const getProvidersBasedAuthUserCountAndUnverifiedUsersData = async (chunkedUsers) => {

    try {
        return await analyticsSheetServices.getProvidersBasedAuthUserCountAndUnverifiedUsersData(chunkedUsers);
    }
    catch (_) {
        console.log('Error occured at getProvidersBasedAuthUserCountAndUnverifiedUsersData(): ' + _);
    }
}


/**
 *  Bootom Lines total users registerations, invites, messages, and chatrooms count
 */
const getBottomLineData = async () => {

    try {
        return await analyticsSheetServices.getBottomLinesData();
    }
    catch (_) {
        console.log('Error occured at getBottomLinesData(): ' + _);
    }
}

/**
 *  Users and reports data
 */
const getUserAndPostReportsData = async (chunkedUsers) => {

    try {
        return await analyticsSheetServices.getUsersAndPostsReportsData(chunkedUsers);
    }
    catch (_) {
        console.log('Error occured at getUserAndPostReportsData(): ' + _);
    }
}

// /**
//  * Get users count who anwered to posts after loggedin week wise.
//  */
const getWeeklyLoggedInUsersAndWhoAnsweredToPostsData = async () => {

    try {
        return await analyticsSheetServices.getWeeklyLoggedInUsersAndWhoAnsweredToPostsData();
    }
    catch (_) {
        console.log('Error occured at getWeeklyLoggedInUsersAndWhoAnsweredToPostsData(): ' + _);
    }
}


// /**
//  * Get users count who posted after loggedin week wise.
//  */
const getWeeklyLoggedInUsersAndTheirPostsData = async () => {

    try {
        return await analyticsSheetServices.getWeeklyLoggedInUsersAndTheirPostsData();
    }
    catch (_) {
        console.log('Error occured at getWeeklyLoggedInUsersAndTheirPostsData(): ' + _);
    }
}

// /**
//  * Get no of posts count of users.
//  */
const getUserPostsData = async (chunkedUsers) => {

    try {
        return await analyticsSheetServices.getUserPostsData(chunkedUsers);
    }
    catch (_) {
        console.log('Error occured at getUserPostsData(): ' + _);
    }
}

// /**
//  * Get no of users registrations and posts creations count.
//  */
const getUsersThatOpenedAppCohort = async (chunkedUsers) => {

    try {
        return await analyticsSheetServices.runUsersThatOpenedAppCohort(chunkedUsers);
    }
    catch (_) {
        console.log('Error occured at getWeeklyUserRegistrationsAndWeeklyPostsData(): ' + _);
    }
}

// get weekly new registered users - weekly connectycube messages 
const getWeeklyUserRegistrationsAndTheirMessagesDataPlusMessagesPerUserData = async (chunkedUsers) => {

    try {
        return await analyticsSheetServices.getWeeklyUserRegistrationsAndTheirMessagesDataPlusMessagesPerUserData(chunkedUsers);
    }
    catch (_) {
        console.log('Error occured at getWeeklyUserRegistrationsAndTheirMessagesDataPlusMessagesPerUserData(): ' + _);
    }
}

// get weeklylogged-in users - How many of them participated in chatroom 
const getWeeklyLoggedInUsersAndTheirParticipationInChatroomsData = async (chunkedUsers) => {

    try {
        return await analyticsSheetServices.getWeeklyLoggedInUsersAndTheirParticipationInChatroomsData(chunkedUsers);
    }
    catch (_) {
        console.log('Error occured at getWeeklyLoggedInUsersAndTheirParticipationInChatroomsData(): ' + _);
    }
}


// Weekly New messages desity and their chatrooms count
const getWeeklyNewMessagesAndTheirChatroomsCountData = async () => {

    try {
        return await analyticsSheetServices.getWeeklyNewMessagesAndTheirChatroomsCountData();
    }
    catch (_) {
        console.log('Error occured at getWeeklyNewMessagesAndTheirChatroomsCountData(): ' + _);
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


// /**
//  * Get no of users registrations and posts creations count.
//  */
const getWeeklyUserRegistrationsAndTheirWeeklyPostsData = async (chunkedUsers) => {

    try {
        return await analyticsSheetServices.getWeeklyUserRegistrationsAndTheirWeeklyPostsData(chunkedUsers);
    }
    catch (_) {
        console.log('Error occured at getWeeklyUserRegistrationsAndTheirWeeklyPostsData(): ' + _);
    }
}


// /**
//  * Get no of users registrations and posts creations count.
//  */
const runUsersThatOpenedAppCohort = async (chunkedUsers) => {

    try {
        return await analyticsSheetServices.runUsersThatOpenedAppCohort(chunkedUsers);
    }
    catch (_) {
        console.log('Error occured at getWeeklyUserRegistrationsAndWeeklyPostsData(): ' + _);
    }
}

// /**
//  * Get top 10 dailt posts, people responses on that post count and total no of messages on that post.
//  */
const getTop1000PostsAndTheirResponses = async () => {

    try {
        return await runTop10PostsAndTheirResponses();
    }
    catch (_) {
        console.log('Error occured at getTop10PostsAndTheirResponses(): ' + _);
    }
}

// /**
//  * Get top 10 dailt posts, people responses on that post count and total no of messages on that post.
//  */
const getAnswersOnPostsDensity = async () => {

    try {
        return await runAnswersOnPostsDensity();
    }
    catch (_) {
        console.log('Error occured at getAnswersOnPostsDensity(): ' + _);
    }
}

module.exports = {
    saveDailyAnalyticUpdates,
    saveWeeklyAnalyticUpdates,
    getUserPostsData,
    getAndUpdateCCDailyMessagesAndChatroomCountToFirestore
}

