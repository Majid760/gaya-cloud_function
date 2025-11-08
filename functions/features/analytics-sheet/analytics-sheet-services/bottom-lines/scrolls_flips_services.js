const {getDailyTotalScrollsAndAverageScrollsPerUser} = require('./../../big-query/queries/scrolls_flips_from_gcp');

/**
 * Show total no of Scrolls per day and average scrolls per user.
 * Fetches from bigQuery
 * 
 * @returns {Promise<String>} - The total no of Scrolls per day and average scrolls per user.
 */
const getDailyTotalScrollsAndAverageScrollsPerUserCounts = async () => {
    const date = new Date();
    /// Doing it bcs bQ is 1 day behind
    date.setDate(date.getDate() - 1); /// Revert to 1 day
    console.log("---> Date is: " + date );

    const scrollsData = await getDailyTotalScrollsAndAverageScrollsPerUser(date);

    if(!scrollsData) {
        return {
            'dailyCount': 0,
            'averageCount': 0
        };
    }

    return scrollsData;
}



module.exports = {
    getDailyTotalScrollsAndAverageScrollsPerUserCounts
}

