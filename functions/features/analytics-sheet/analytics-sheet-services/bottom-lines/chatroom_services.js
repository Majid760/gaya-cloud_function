const { getChatroomsCountByDate } = require('./../../message/messages_services.js');
const util = require('./../../../../utils/helpers.js');
const { initialCCDate } = require('./../../consts.js');

const { getChatroomsCountFromGcp } = require('./../../big-query/queries/chatrooms_count_from_gcp.js'); 

/**
 * Fetches All the bottom lines for messages
 * 
 * @param {boolean} isDaily - Whether to get the daily count
 * @param {boolean} isWeekly - Whether to get the weekly count
 * @param {boolean} isTotal - Whether to get the total count
 * @returns {Promise<{dailyCount:string, weeklyCount:string, totalCount:String}} - A map containing the daily, weekly, and total counts.
 */
const getChatroomBottomLines = async (isDaily = true, isWeekly = true, isTotal = true) => {

    const data = {};
    if (isDaily && isWeekly && isTotal) {
        const promises = [];
        if (isDaily) promises.push(__getDailyChatroom())
        if (isWeekly) promises.push(__getWeeklyChatroom())
        if (isTotal) promises.push(__getTotalChatroom())

        const results = await Promise.all(promises);
        const [dailyCount, weeklyCount, totalCount] = results;
        if (isDaily) data.dailyCount = dailyCount;
        if (isWeekly) data.weeklyCount = weeklyCount;
        if (isTotal) data.totalCount = totalCount;

    } else {
        if (isDaily) {
            const dailyCount = await __getDailyChatroom();
            data.dailyCount = dailyCount;
        }

        if (isWeekly) {
            const weeklyCount = await __getWeeklyChatroom();
            data.weeklyCount = weeklyCount;
        }

        if (isTotal) {
            const totalCount = await __getTotalChatroom();
            data.totalCount = totalCount;
        }

    }

    console.log("Chatroom Bottom Lines");
    console.table(data); 

    return data;
}


const __getTotalChatroom = async () => {
    const todayStamp = util.getCurrentDateTime(true);
    return await getChatroomsCountByDate();
}

const __getDailyChatroom = async () => {
    // const startAndEndDate = util.getCurrentDayStartAndEndTime(true);
    // return await getChatroomsCountByDate(startAndEndDate.start, startAndEndDate.end);
    let date = new Date();
    /// Doing it bcs bQ is 1 day behind
    date.setDate(date.getDate() - 1); /// Revert to 1 day    9 , 10 , 12 , 
    console.log("---> Date is: " + date );

    return await getChatroomsCountFromGcp(date);
    
}

const __getWeeklyChatroom = async () => {
    const startAndEndDate = util.getCurrentWeekStartAndEndTime(true);
    return await getChatroomsCountByDate(startAndEndDate.start);
}


module.exports = {
    getChatroomBottomLines
}