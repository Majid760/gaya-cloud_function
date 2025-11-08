const {getSingleDayTotalUsersWhoOpenedInstaShareBottomsheetCount, getSingleDayTotalUsersWhoActuallyPostedCount} = require('./../../big-query/queries/instagram_share_counts_from_gcp');

/**
 * Show the todays total users count who opened insta share bottomsheet.
 * Fetches from bigQuery
 * 
 * @returns {Promise<String>} - The todays total users count who opened insta share bottomsheet.
 */
const getTodaysTotalUsersWhoOpenedInstaShareBottomsheetCount = async () => {
    let date = new Date();
    /// Doing it bcs bQ is 1 day behind
    date.setDate(date.getDate() - 1); /// Revert to 1 day
    console.log("---> Date is: " + date );

    let dataCount = await getSingleDayTotalUsersWhoOpenedInstaShareBottomsheetCount(date);

    if(!dataCount) {
        return 0;
    }

    return dataCount || 0;
}
/**
 * Show the todays total users count who actually posted as story.
 * Fetches from bigQuery
 * 
 * @returns {Promise<String>} - The todays total users count who actually posted as story.
 */
const getTodaysTotalUsersWhoActuallySharedTheStoryToInstagram = async () => {
    let date = new Date();
    /// Doing it bcs bQ is 1 day behind
    date.setDate(date.getDate() - 1); /// Revert to 1 day
    console.log("---> Date is: " + date );

    let dataCount = await getSingleDayTotalUsersWhoActuallyPostedCount(date);

    if(!dataCount) {
        return 0;
    }

    return dataCount || 0;
}

module.exports = {
    getTodaysTotalUsersWhoOpenedInstaShareBottomsheetCount,
    getTodaysTotalUsersWhoActuallySharedTheStoryToInstagram
}

