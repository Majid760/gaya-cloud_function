const {dailyAverageTimeSpentByUserCount} = require('./../../big-query/queries/get_daily_average_spent_time_by_users.js');

// Get the todays app downloads. 
const getDailyAverageTimeSpentByUser = async () => {
    let date = new Date();
    /// Doing it bcs bQ is 1 day behind
    date.setDate(date.getDate() - 1); /// Revert to 1 day     
    console.log("---> Date is: " + date );

    let dataCount = await dailyAverageTimeSpentByUserCount(date);
    return dataCount ;
}

module.exports = {
    getDailyAverageTimeSpentByUser
}

