const admin = require("firebase-admin");
const db = admin.firestore();
const util = require('../../../../utils/helpers.js');
const {getSingleDayPostsCount, 
    fetchAllPostsFromGcp
} = require('./../../big-query/queries/posts_created.js');

const {dailyPostCount} = require('./../../big-query/queries/daily_posts_from_gcp.js');

/**
 * Fetches All the bottom lines
 * 
 * @param {boolean} isDaily - Whether to get the daily count
 * @param {boolean} isWeekly - Whether to get the weekly count
 * @param {boolean} isTotal - Whether to get the total count
 * @returns {Promise<{dailyCount:string, weeklyCount:string, totalCount:String}} - A map containing the daily, weekly, and total counts.
 */
const getPostBottomLines = async (isDaily = true, isWeekly = true, isTotal = true) => {

    const data = {};
    if (isDaily && isWeekly && isTotal) {
        const promises = [];

        promises.push(__getDailyPost())
        promises.push(__getWeeklyPost())
        promises.push(_getTotalPost())

        const results = await Promise.all(promises);
        const [dailyCount, weeklyCount, totalCount] = results;

        data.dailyCount = dailyCount;
        data.weeklyCount = weeklyCount;
        data.totalCount = totalCount;


    } else {
        if (isDaily) {
            const dailyCount = await __getDailyPost();
            data.dailyCount = dailyCount;
        }

        if (isWeekly) {
            const weeklyCount = await __getWeeklyPost();
            data.weeklyCount = weeklyCount;
        }

        if (isTotal) {
            const totalCount = await _getTotalPost();
            data.totalCount = totalCount;
        }
    }
    console.log("Post Bottom Lines");
    console.table(data); 

    return data;
}

/**
 * Show the number of posts created today per user as distinct. 
 * Fetches from bigQuery
 * 
 * @returns {Promise<Number>} - The number of posts created today per user.
 */
const usersPostedAtLeastOnce = async () => {
    const date = new Date();
    /// Doing it bcs bQ is 1 day behind
    date.setDate(date.getDate() - 1); //// Revert to 1 day

    const count = await getSingleDayPostsCount(date);

    return count;
}



/// INVITES ///
const _getTotalPost = async () => {
    return await __firestoreQueryInvitesCount();
}
const __getDailyPost = async () => {
    const startAndEndDate = util.getCurrentDayStartAndEndTime();
    return await __firestoreQueryInvitesCount(startAndEndDate.start, startAndEndDate.end);
}

const __getWeeklyPost = async () => {
    const startAndEndDate = util.getCurrentWeekStartAndEndTime();
    return await __firestoreQueryInvitesCount(startAndEndDate.start, startAndEndDate.end);
}


// Get the todays post count. 
const getDailyPostCount = async () => {
    let date = new Date();
    /// Doing it bcs bQ is 1 day behind
    date.setDate(date.getDate() - 1); /// Revert to 1 day    9 , 10 , 12 , 
    console.log("---> Date is: " + date );

    let dataCount = await dailyPostCount(date);
    return dataCount;
}


// Get posts from between 2 dats. 
const getAllPostsFromGCP = async (start, end) => {
    
    let postsData = await fetchAllPostsFromGcp(start, end);
    return postsData;
}


/**
 * Fetches the total number of invites sent between the given start and end dates.
 * 
 * @param {Date?} start 
 * @param {Date?} end 
 * @returns  {Promise<Number>} total number of invites
 */
const __firestoreQueryInvitesCount = async (start, end) => {
    let query = db.collection('posts');
    if (start && end) {
        query = query.where('createdAt', '>=', start).where('createdAt', '<=', end);
    }

    const totalCount = await query.count().get();

    return totalCount.data().count;


} 
module.exports = {
    getPostBottomLines,
    usersPostedAtLeastOnce,
    getDailyPostCount,
    getAllPostsFromGCP
}