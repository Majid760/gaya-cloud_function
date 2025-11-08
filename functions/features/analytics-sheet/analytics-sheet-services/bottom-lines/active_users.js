// const {getActiveUsersCountFromGcp} = require('./../../big-query/queries/active_users_from_gcp.js');
// const postServices = require('../../common/post_services.js');
const analyticsService = require('../../../../common/analytics_services.js');


/**
 * Show total no of Scrolls per day and average scrolls per user.
 * Fetches from bigQuery
 * 
 * @returns {Promise<String>} - The total no of Scrolls per day and average scrolls per user.
 */
const getActiveUsersCount = async () => {

    let activeUsersCount = (await analyticsService.getDailyActiveUsersHTTP()).data;
    if (!activeUsersCount) return;

    return activeUsersCount;

    // const date = new Date();
    // /// Doing it bcs bQ is 1 day behind
    // date.setDate(date.getDate() - 1); /// Revert to 1 day
    // console.log("---> Date is: " + date );

    // const results = await getActiveUsersCountFromGcp(date);

    // if(!results) {
    //     return 0;
    // }

    // return results;
}



module.exports = {
    getActiveUsersCount
}

