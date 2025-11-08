const {dailyAppDownloadsCount} = require('./../../big-query/queries/get_daily_app_downloads_from_gcp');

// Get the todays app downloads. 
const getDailyAppDownloadsCount = async () => {
    let date = new Date();
    /// Doing it bcs bQ is 1 day behind
    date.setDate(date.getDate() - 1); /// Revert to 1 day    9 , 10 , 12 , 
    console.log("---> Date is: " + date );

    let dataCount = await dailyAppDownloadsCount(date);
    return dataCount ;
}

module.exports = {
    getDailyAppDownloadsCount
}

