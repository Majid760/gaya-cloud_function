const {getSingleDayTotalPurchasesCount, getDailyPurchasesCount} = require('./../../big-query/queries/rc_purchases_from_gcp.js');

/**
 * Show todays total purchases count. 
 * Fetches from bigQuery
 * 
 * @returns {Promise<String>} - The todays total purchases count. 
 */
const getTodaysTotalPurchasesCount = async () => {
    let date = new Date();
    /// Doing it bcs bQ is 1 day behind
    date.setDate(date.getDate() - 1); /// Revert to 1 day    9 , 10 , 12 , 
    console.log("---> Date is: " + date );

    let dataCount = await getSingleDayTotalPurchasesCount(date);

    if(!dataCount) {
        return 0;
    }

    return dataCount || 0;
}

const getTodaysPurchasesCount = async () => {
    let date = new Date();
    /// Doing it bcs bQ is 1 day behind
    date.setDate(date.getDate() - 1); /// Revert to 1 day    9 , 10 , 12 , 
    console.log("---> Date is: " + date );

    let dataCount = await getDailyPurchasesCount(date);
    return dataCount ;
}

module.exports = {
    getTodaysTotalPurchasesCount,
    getTodaysPurchasesCount
}

