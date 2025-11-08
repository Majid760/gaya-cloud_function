const { getSentMessagesTotal } = require('./../../message/messages_services.js');
const util = require('./../../../../utils/helpers.js');
const { initialCCDate } = require('./../../consts.js');
const { runBQUserMessagedAtleastOnce } = require('./../../big-query/queries/messaged_atleast_once.js');

/**
 * Fetches All the bottom lines for messages
 * 
 * @param {boolean} isDaily - Whether to get the daily count
 * @param {boolean} isWeekly - Whether to get the weekly count
 * @param {boolean} isTotal - Whether to get the total count
 * @returns {Promise<{dailyCount:string, weeklyCount:string, totalCount:String}} - A map containing the daily, weekly, and total counts.
 */
const getMessagesBottomLines = async (isDaily = true, isWeekly = true, isTotal = true) => {
    const data = {};
    if (isDaily && isWeekly && isTotal) {
        const promises = [];
        if (isDaily) promises.push(__getDailyMessages())
        if (isWeekly) promises.push(__getWeeklyMessages())
        if (isTotal) promises.push(__getTotalMessages())

        const results = await Promise.all(promises);
        const [dailyCount, weeklyCount, totalCount] = results;



        if (isDaily) data.dailyCount = dailyCount;
        if (isWeekly) data.weeklyCount = weeklyCount;
        if (isTotal) data.totalCount = totalCount;
    } else {
        if (isDaily) {
            const dailyCount = await __getDailyMessages();
            data.dailyCount = dailyCount;
        }

        if (isWeekly) {
            const weeklyCount = await __getWeeklyMessages();
            data.weeklyCount = weeklyCount;
        }

        if (isTotal) {
            const totalCount = await __getTotalMessages();
            data.totalCount = totalCount;
        }
    }


    console.log("Message Bottom Lines");
    console.table(data);

    return data;
}


/**
 * Fetch count of users that atleast sent 1 message
 * @returns {Promise<Number>} dailyCount - total number of users that atleast sent 1 message
 */
const getUsersThatMessagedAtleastOnceBottomLine = async () => {

    const date = new Date();
    /// Doing it bcs bQ is 1 day behind 
    date.setDate(date.getDate() - 1); /// Revert to 1 day

    console.log(`Today's date: ${date}`);

    let dailyCount = 0;
    try {
        const response = await runBQUserMessagedAtleastOnce(date);
        dailyCount = response[0].user_count; 
    } catch (_) { }

    return dailyCount;
}


const __getTotalMessages = async () => {
    const todayStamp = util.getCurrentDateTime(true);
    return await getSentMessagesTotal(initialCCDate.getDate() / 1000, todayStamp);
}

const __getDailyMessages = async () => {
    const startAndEndDate = util.getCurrentDayStartAndEndTime(true);
    return await getSentMessagesTotal(startAndEndDate.start, startAndEndDate.end);
}

const __getWeeklyMessages = async () => {
    const startAndEndDate = util.getCurrentWeekStartAndEndTime(true);
    return await getSentMessagesTotal(startAndEndDate.start, startAndEndDate.end);
}


module.exports = {
    getMessagesBottomLines,
    getUsersThatMessagedAtleastOnceBottomLine
}