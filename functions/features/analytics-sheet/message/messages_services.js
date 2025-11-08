const stateApi = require('../../connecty-cube/admin-sdk/cc_axios_api.js');

/**
 * Function to retrieve the total number of messages sent within a specified date range.
 * 
 * @param {number} startDate - The start date for the query in Unix timestamp format.
 * @param {number} endDate - The end date for the query in Unix timestamp format.
 * @returns {Promise<number>} A Promise that resolves to the total number of messages sent.
 */
const getSentMessagesTotal = async (startDate, endDate) => {
    try {
        const response = await stateApi.getSentMessagesTotal(startDate, endDate);
        // console.log('reponse is: ', response);

        return response.data.total;
    } catch (error) {
        console.log('Error occurred in getSentMessagesTotal():', JSON.stringify(error));
    } 
}

/**
 * Function to retrieve the total number of messages sent per day within a specified date range.
 * 
 * @param {number} startDate - The start date for the query in Unix timestamp format.
 * @param {number} endDate - The end date for the query in Unix timestamp format.
 * @returns {Promise<object>} A Promise that resolves to an object containing daily message counts.
 */
const getMessagesSentPerDay = async (startDate, endDate) => {
    try {
        const response = await stateApi.getMessagesSentPerDay(startDate, endDate);
        return response.data;
    } catch (error) {
        console.log('Error occurred in getMessagesSentPerDay():', error);
    } 
}


/**
 * Function to retreve the total number of chatrooms by date.
 * 
 * @param {number} startDate - The start date for the query in Unix timestamp format. 
 * 
 * @returns {Promise<number>} A Promise that resolves to the total number of chatrooms. 
 */
const getChatroomsCountByDate = async (startDate, endDate) => {
    try {
        const response = await stateApi.getCCChatroomCountByDate(startDate, endDate);
        return response;
    } catch (error) {
        console.log('Error occurred in getChatroomsCountByDate():', error);
    }
}
module.exports = {
    getSentMessagesTotal,
    getMessagesSentPerDay,
    getChatroomsCountByDate
}