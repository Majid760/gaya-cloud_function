const {getSingleDayTotalMessages} = require('./../../big-query/queries/top_posts_responses_onIt_and_total_messages_onIt.js');
const util = require('./../../../../utils/helpers.js');

/**
 * Show the number of posts created today per user as distinct. 
 * Fetches from bigQuery
 * @param {Array} dialogIds - list of dialog_ids
 * @returns {Promise<Number>} - The number of posts created today per user.
 */
const getDailyTotalMessages = async (dialogIds) => {
    const date = new Date();
    /// Doing it bcs bQ is 1 day behind
    date.setDate(date.getDate() - 1);

    return await getSingleDayTotalMessages(date, dialogIds);
}


module.exports = {
    getDailyTotalMessages,
}