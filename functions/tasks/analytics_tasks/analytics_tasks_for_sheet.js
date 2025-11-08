const { getFunctions } = require("firebase-admin/functions");
const ANALYTICS_TASK = 'handleAnalyticsTask';
const POSTS_AND_REPOTED_POSTS_ANALYTICS_TASK = 'handlePostsAndReportedPostsAnalyticsTask';
const USER_REGISTRATIONS_AND_OPENED_APP_ANALYTICS_TASK = 'handleUserRegistrationsAndPotsAndUsersWhoOpenedAppAnalyticsTask';
const TOP_1000_POSTS_ANALYTICS_TASK = 'handleTop1000PostsAnalyticsTask';
const WEEKLY_REGS_AND_CC_MESSAGES_ANALYTICS_TASK = 'handleWeeklyRegsAndMessagesAnalyticsTask';

const analyticsSheetServices = require("../../features/analytics-sheet/analytics-sheet-services/analytics_sheet_services.js")

const { runTop10PostsAndTheirResponses } = require("../../features/analytics-sheet/top_posts_and_their_responses/top_posts_and_responses_on_it_services.js");
const { runAnswersOnPostsDensity } = require("../../features/analytics-sheet/top_posts_and_their_responses/post_answers_density_groups.js");
const admin = require("firebase-admin");
const db = admin.firestore();


/**
 * @returns void
 */
const enqueueAnalyticsTask = async () => {

    const queue = getFunctions().taskQueue(ANALYTICS_TASK);

    console.log(`enqueueAnalyticsTask started`);

    let scheduleDelaySeconds = 30; // 30 seconds

    await queue.enqueue(
        {
            ['analytics']: 'analytics',
        },
        {
            scheduleDelaySeconds,
            dispatchDeadlineSeconds: 60 * 5 // 5 minutes
        },
    );
    console.log(`enqueueAnalyticsTask Executed Succesfully ✅, `);

    return;

};

/**
 * 
 * @param {Object} data - Must Contain 'analytics'
 * 
 * @example
 *  {
        'analytics: 'analytics,
    }
 */
    const dequeueAnalyticsTask = async (data) => {

        console.log(`Dequeue Analytics Task: ${JSON.stringify(data) ?? data}`);
        /// Unwrap keys
        const analytics = data['analytics'];
    
        if (!analytics) {
            logger.error(`🆘 Invalid analytics is required. Received: ${JSON.stringify(data) ?? data}`);
        }
    
        await __handleAnalytics();
    }


    /**
 * @returns void
 */
const enqueueWeeklyRegistrationsAndCCMessagesAnalyticsTask = async () => {
    
    const queue = getFunctions().taskQueue(WEEKLY_REGS_AND_CC_MESSAGES_ANALYTICS_TASK);

    console.log(`enqueueWeeklyRegistrationsAndCCMessagesAnalyticsTask started`);

    let scheduleDelaySeconds = 30; // 30 seconds

    await queue.enqueue(
        {
            ['analytics']: 'analytics',
        },
        {
            scheduleDelaySeconds,
            dispatchDeadlineSeconds: 60 * 5 // 5 minutes
        },
    );
    console.log(`enqueueWeeklyRegistrationsAndCCMessagesAnalyticsTask Executed Succesfully ✅, `);

    return;

};

/**
 * 
 * @param {Object} data - Must Contain 'analytics'
 * 
 * @example
 *  {
        'analytics: 'analytics,
    }
 */
    const dequeueWeeklyRegistrationsAndCCMessagesAnalyticsTask = async (data) => {

        console.log(`Dequeue Analytics Task: ${JSON.stringify(data) ?? data}`);
        /// Unwrap keys
        const analytics = data['analytics'];
    
        if (!analytics) {
            logger.error(`🆘 Invalid analytics is required. Received: ${JSON.stringify(data) ?? data}`);
        }
    
        await __WeeklyRegistrationsAndCCMessagesAnalytics();
    }
    
    
/**
 * @returns void
 */
const enqueueTop1000PostsAnalyticsTask = async () => {

    const queue = getFunctions().taskQueue(TOP_1000_POSTS_ANALYTICS_TASK);

    console.log(`enqueueTop1000PostsAnalyticsTask started`);

    let scheduleDelaySeconds = 30; // 30 seconds

    await queue.enqueue(
        {
            ['analytics']: 'analytics',
        },
        {
            scheduleDelaySeconds,
            dispatchDeadlineSeconds: 60 * 5 // 5 minutes
        },
    );
    console.log(`enqueueTop1000PostsAnalyticsTask Executed Succesfully ✅, `);

    return;

};

/**
 * 
 * @param {Object} data - Must Contain 'analytics'
 * 
 * @example
 *  {
        'analytics: 'analytics,
    }
 */
    const dequeueTop1000PostsAnalyticsTask = async (data) => {

        console.log(`Dequeue Analytics Task: ${JSON.stringify(data) ?? data}`);
        /// Unwrap keys
        const analytics = data['analytics'];
    
        if (!analytics) {
            logger.error(`🆘 Invalid analytics is required. Received: ${JSON.stringify(data) ?? data}`);
        }
    
        await __handleTop1000PostsAnalytics();
    }
/**
 * @returns void
 */
const enqueuePostsAndReportedPostsAnalyticsTask = async () => {

    const queue = getFunctions().taskQueue(POSTS_AND_REPOTED_POSTS_ANALYTICS_TASK);

    console.log(`enqueuePostsAndReportedPostsAnalyticsTask started`);

    let scheduleDelaySeconds = 30; // 30 seconds

    await queue.enqueue(
        {
            ['analytics']: 'analytics',
        },
        {
            scheduleDelaySeconds,
            dispatchDeadlineSeconds: 60 * 5 // 5 minutes
        },
    );
    console.log(`enqueuePostsAndReportedPostsAnalyticsTask Executed Succesfully ✅, `);

    return;

};

/**
 * 
 * @param {Object} data - Must Contain 'analytics'
 * 
 * @example
 *  {
        'analytics: 'analytics,
    }
 */

const dequeuePostsAndReportedPostsAnalyticsTask = async (data) => {

    console.log(`Dequeue PostsAndReportedPosts Analytics Task: ${JSON.stringify(data) ?? data}`);
    /// Unwrap keys
    const analytics = data['analytics'];

    if (!analytics) {
        logger.error(`🆘 Invalid analytics is required. Received: ${JSON.stringify(data) ?? data}`);
    }

    await __handlePostsAndReportedPostsAnalytics();
}

/**
 * @returns void
 */
const enqueueUserRegistrationsAndPotsAndUsersWhoOpenedAppAnalyticsTask = async () => {

    const queue = getFunctions().taskQueue(USER_REGISTRATIONS_AND_OPENED_APP_ANALYTICS_TASK);

    console.log(`enqueueUserRegistrationsAndPotsAndUsersWhoOpenedAppAnalyticsTask started`);

    let scheduleDelaySeconds = 30; // 30 seconds

    await queue.enqueue(
        {
            ['analytics']: 'analytics',
        },
        {
            scheduleDelaySeconds,
            dispatchDeadlineSeconds: 60 * 5 // 5 minutes
        },
    );
    console.log(`enqueueUserRegistrationsAndPotsAndUsersWhoOpenedAppAnalyticsTask Executed Succesfully ✅, `);

    return;

};

/**
 * 
 * @param {Object} data - Must Contain 'analytics'
 * 
 * @example
 *  {
        'analytics: 'analytics,
    }
 */

const dequeueUserRegistrationsAndPotsAndUsersWhoOpenedAppAnalyticsTask = async (data) => {

    console.log(`Dequeue UserRegistrationsAndPotsAndUsersWhoOpenedApp Analytics Task: ${JSON.stringify(data) ?? data}`);
    /// Unwrap keys
    const analytics = data['analytics'];

    if (!analytics) {
        logger.error(`🆘 Invalid analytics is required. Received: ${JSON.stringify(data) ?? data}`);
    }

    await __handleUserRegistrationsAndPotsAndUsersWhoOpenedAppAnalytics();
}

///                     
///
/// PRIVATE FUNCTIONS
///
///

const __handleUserRegistrationsAndPotsAndUsersWhoOpenedAppAnalytics = async () => {

    const { getAllFirestoreUsers } = require('../../features/analytics-sheet/consts.js');

    const users =await getAllFirestoreUsers();
    if (users.empty || users.docs.length < 0) return;

    console.log(`--------------> users length is in __handleUserRegistrationsAndPotsAndUsersWhoOpenedAppAnalytics is : ${users.docs.length}`);

    // split users into chunks of 490
    const chunkedUsers = chunkArray(users.docs, 490);
    
    // // Stopped by almog Users that opened app
    // await runUsersThatOpenedAppCohort(chunkedUsers); // NEW SHEET
    // console.log(`********** 10 Done **********`);

    // Users and posts per week (new users registration and their new posts creation per week)
    await getWeeklyUserRegistrationsAndTheirWeeklyPostsData(chunkedUsers); // NEW SHEET
    console.log(`********** 8 Done **********`);

    console.log(`__handleUserRegistrationsAndPotsAndUsersWhoOpenedAppAnalytics Executed Succesfully ✅`);

    return;
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

const __handlePostsAndReportedPostsAnalytics = async () => {

    const { getAllFirestoreUsers } = require('../../features/analytics-sheet/consts.js');

    const users =await getAllFirestoreUsers();
    if (users.empty || users.docs.length < 0) return;

    console.log(`--------------> users length is in __handlePostsAndReportedPostsAnalytics is : ${users.docs.length}`);

    // split users into chunks of 490
    const chunkedUsers = chunkArray(users.docs, 490);

    // Users and reports data
    await getUserAndPostReportsData(chunkedUsers); // NEW SHEET
    console.log(`********** 02 Done **********`);

    // User Count for No Of Posts Creations by a user
    await getUserPostsData(chunkedUsers); // NEW SHEET
    console.log(`********** 4 Done **********`);

    console.log(`__handlePostsAndReportedPostsAnalytics Executed Succesfully ✅`);

    return;
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

const __handleAnalytics = async () => {

    const { getAllFirestoreUsers } = require('../../features/analytics-sheet/consts.js');

    const users = await getAllFirestoreUsers();
    if (users.empty || users.docs.length < 0) return;
    // split users into chunks of 490
    const chunkedUsers = chunkArray(users.docs, 490);

    // Weekly New user registrations and Weekly Connectycube messages count Plys(+) Messages per user
    await getWeeklyUserRegistrationsAndTheirMessagesDataPlusMessagesPerUserData(chunkedUsers); // by waqar Users and their messages, weekly messages length category based users count 
    console.log(`********** 0.0 Done **********`);

    console.log(`__handleSendNotificationTask Executed Succesfully ✅`);

    return;
}


const __WeeklyRegistrationsAndCCMessagesAnalytics = async () => {

    const { getAllFirestoreUsers } = require('../../features/analytics-sheet/consts.js');

    const users = await getAllFirestoreUsers();
    if (users.empty || users.docs.length < 0) return;
    // split users into chunks of 490
    const chunkedUsers = chunkArray(users.docs, 490);

    await analyticsSheetServices.getWeeklyUserRegistrationsAndWeeklyConnectycubeMessagesData(chunkedUsers); 
    console.log(`********** 0.1 Done **********`);

    console.log(`__WeeklyRegistrationsAndCCMessagesAnalytics Executed Succesfully ✅`);

    return;
}

const __handleTop1000PostsAnalytics = async () => {

    // Answers on Posts Density
    await getAnswersOnPostsDensity(); // NEW SHEET
    console.log(`********** 11.1 Done **********`);

    // TOP 10 POSTS AND THEIR RESPONSES Need to retest it
    await getTop1000PostsAndTheirResponses(); // NEW SHEET
    console.log(`********** 11.2 Done **********`);

    console.log(`__handleTop1000PostsAnalytics Executed Succesfully ✅`);

    return;
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


// get weekly new registered users - weekly connectycube messages 
const getWeeklyUserRegistrationsAndTheirMessagesDataPlusMessagesPerUserData = async (chunkedUsers) => {

    try {
        return await analyticsSheetServices.getWeeklyUserRegistrationsAndTheirMessagesDataPlusMessagesPerUserData(chunkedUsers);
    }
    catch (_) {
        console.log('Error occured at getWeeklyUserRegistrationsAndTheirMessagesDataPlusMessagesPerUserData(): ' + _);
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
        console.log('Error occured at getTop1000PostsAndTheirResponses(): ' + _);
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
    enqueueAnalyticsTask,
    dequeueAnalyticsTask,
    ANALYTICS_TASK,

    enqueuePostsAndReportedPostsAnalyticsTask,
    dequeuePostsAndReportedPostsAnalyticsTask,
    POSTS_AND_REPOTED_POSTS_ANALYTICS_TASK,
 
    enqueueUserRegistrationsAndPotsAndUsersWhoOpenedAppAnalyticsTask,
    dequeueUserRegistrationsAndPotsAndUsersWhoOpenedAppAnalyticsTask,
    USER_REGISTRATIONS_AND_OPENED_APP_ANALYTICS_TASK,

    enqueueTop1000PostsAnalyticsTask,
    dequeueTop1000PostsAnalyticsTask,
    TOP_1000_POSTS_ANALYTICS_TASK,

    enqueueWeeklyRegistrationsAndCCMessagesAnalyticsTask,
    dequeueWeeklyRegistrationsAndCCMessagesAnalyticsTask,
    WEEKLY_REGS_AND_CC_MESSAGES_ANALYTICS_TASK
}