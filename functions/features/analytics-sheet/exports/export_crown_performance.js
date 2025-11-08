const {getSingleDayCrownsCount} = require('../big-query/queries/crowns_performance.js');



const exportCrownsPerformance = async () => {
    
    const totalCrownsCount = await getSingleDayCrownsPerformance();

    console.log(`Today's crowns count: ${totalCrownsCount}`);
  }


/**
 * Show the number of crowns created today. 
 * Fetches from bigQuery
 * 
 * @returns {Promise<Number>} - The number of crowns created today.
 */
const getSingleDayCrownsPerformance = async () => {
    const date = new Date();
    /// Doing it bcs bQ is 1 day behind 
    date.setDate(date.getDate() - 1); /// Revert to 1 day

    console.log(`Today's date: ${date}`);

    const count = await getSingleDayCrownsCount(date);

    return count || 0;
}


module.exports = { exportCrownsPerformance, getSingleDayCrownsPerformance };
