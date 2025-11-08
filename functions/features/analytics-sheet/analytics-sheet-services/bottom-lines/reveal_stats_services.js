const {getDailyRevealStatsCount} = require('./../../big-query/queries/reveal_stats_from_gcp');


const getRevealStatsCount = async () => {
    let date = new Date();
    /// Doing it bcs bQ is 1 day behind
    date.setDate(date.getDate() - 1); /// Revert to 1 day    9 , 10 , 12 , 
    console.log("---> Date is: " + date );

    let dataCount = await getDailyRevealStatsCount(date);
    return dataCount ;
}

module.exports = {
    getRevealStatsCount
}

