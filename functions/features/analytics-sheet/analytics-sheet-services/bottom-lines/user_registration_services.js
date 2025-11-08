const admin = require("firebase-admin");
const db = admin.firestore();
const util = require('../../../../utils/helpers.js')

/**
 * Fetches All the bottom lines for user registration
 * A Function to get the total number of users registered in the system
 * 
 * @param {boolean} isDaily - Whether to get the daily count
 * @param {boolean} isWeekly - Whether to get the weekly count
 * @param {boolean} isTotal - Whether to get the total count
 * @returns {Promise<{dailyCount:string, weeklyCount:string, totalCount:String}} - A map containing the daily, weekly, and total counts.
 */
const getUsersRegBottomLines = async (isDaily = true, isWeekly = true, isTotal = true) => {

    const data = {};
    if (isDaily && isWeekly && isTotal) {
        const promises = [];
        promises.push(__getDailyUserReg());
        promises.push(__getWeeklyUserReg());
        promises.push(__getTotalUserReg());

        const results = await Promise.all(promises);
        const [dailyCount, weeklyCount, totalCount] = results;

        data.dailyCount = dailyCount;
        data.weeklyCount = weeklyCount;
        data.totalCount = totalCount;
    } else {

        if (isDaily) {
            const dailyCount = await __getDailyUserReg();
            data.dailyCount = dailyCount;
        }

        if (isWeekly) {
            const weeklyCount = await __getWeeklyUserReg();
            data.weeklyCount = weeklyCount;
        }

        if (isTotal) {
            const totalCount = await __getTotalUserReg();
            data.totalCount = totalCount;
        }

    }



    console.log("User Registration Bottom Lines");
    console.table(data); 

    return data;
}



/// INVITES ///
const __getTotalUserReg = async () => {
    return await __firebaseAuthUserRegCount();
}
const __getDailyUserReg = async () => {
    const startAndEndDate = util.getCurrentDayStartAndEndTime();
    return await __firestoreQueryUserRegCount(startAndEndDate.start, startAndEndDate.end);
}

const __getWeeklyUserReg = async () => {
    const startAndEndDate = util.getCurrentWeekStartAndEndTime();
    return await __firestoreQueryUserRegCount(startAndEndDate.start, startAndEndDate.end);
}

/**
 * Fetches the total number of invites sent between the given start and end dates.
 * 
 * @param {Date?} start 
 * @param {Date?} end 
 * @returns  {Promise<Number>} total number of invites
 */
const __firestoreQueryUserRegCount = async (start, end) => {
    let query = db.collection('users');
    if (start && end) {
        query = query.where('createdAt', '>=', start).where('createdAt', '<=', end);
    }

    const totalCount = await query.count().get();

    return totalCount.data().count;


}
/**
 * Fetches the total number of users registered in auth.
 * @returns  {Promise<Number>} total number of users count
 */
const __firebaseAuthUserRegCount = async () => {

    let allUsers = [];
    try {
      let pageToken;
      do {
        const listUsersResult = await admin.auth().listUsers(1000, pageToken);
        allUsers = allUsers.concat(listUsersResult.users);
        pageToken = listUsersResult.pageToken;
      } while (pageToken);
      console.error('total users::', allUsers.length);

    } catch (error) {
      console.error('_getProvidersBasedAuthUserCount:', error);
    }

    return allUsers.length || 0;
    
}
module.exports = {
    getUsersRegBottomLines,
}