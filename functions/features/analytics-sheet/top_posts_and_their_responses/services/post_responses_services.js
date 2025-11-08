const {getSingleDayPostResponsesMessages, getSingleDayAnswersCountOnPosts} = require('./../../big-query/queries/top_posts_responses_onIt_and_total_messages_onIt.js');

/**
 * Show the responses on posts. 
 * Fetches from bigQuery
 * 
 * @returns {Promise<Number>} - The number of posts created today per user.
 */
const getDailyResponsesOnPosts = async () => {
    const date = new Date();
    /// Doing it bcs bQ is 1 day behind
    date.setDate(date.getDate() - 1); /// Revert back to 1 day

    return await getSingleDayPostResponsesMessages(date);
}


/**
 * Show the answers counts on posts. 
 * Fetches from bigQuery
 * 
 * @returns {Promise<Number>} - The number of posts created today per user.
 */
const getDailyAnswersCountOnPosts = async () => {
    const date = new Date();

    /// Doing it bcs bQ is 1 day behind
    date.setDate(date.getDate() - 1); /// Revert back to 1 day

    console.log('<========================> date is: ', date);

    return await getSingleDayAnswersCountOnPosts(date);
}


module.exports = {
    getDailyResponsesOnPosts,
    getDailyAnswersCountOnPosts
}