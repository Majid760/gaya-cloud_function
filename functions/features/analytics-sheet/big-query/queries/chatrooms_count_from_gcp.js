const { runBigQuery, TABLE_NAME } = require('./../big_query.js')

/**
 * Get total no of Scrolls per day and average scrolls per user.
 * 
 * @param {Date} date
 * @return {Promise<number>} - The total no of Scrolls per day and average scrolls per user.
 */
const getChatroomsCountFromGcp = async (date) => {
    // Get the start and end timestamps for the given date
    const { startOfDayTimestamp, endOfDayTimestamp } = __getTimestampsForStartAndEnd(date);

const query = `
SELECT
  COUNT(DISTINCT params.value.string_value) as unique_chatroom_count
FROM
  ${TABLE_NAME},
  UNNEST(event_params) as params
WHERE
  event_name IN ('tap_post_homefeed', 'send_message_homefeed', 'send_message')
  AND TIMESTAMP_MICROS(event_timestamp) BETWEEN TIMESTAMP_MICROS(${startOfDayTimestamp}) AND TIMESTAMP_MICROS(${endOfDayTimestamp})
  AND params.key = 'dialog_id'
`;

    const [result] = await runBigQuery(query);

    console.log(`printed result is: ${JSON.stringify(result)}`);

    const chatroomsCount = result.unique_chatroom_count;

    if (!chatroomsCount) {
        console.log(`Something went wrong while fetching the activeUsers`);
        return ;
    }

    return chatroomsCount || 0;
}

/**
 * Get the start and end timestamps for a given date.
 * 
 * @param {Date} date  - The date to get the timestamps for.
 * @returns  {{ startOfDayTimestamp: number, endOfDayTimestamp: number }} 
 */
const __getTimestampsForStartAndEnd = (date) => {
    date.setHours(0, 0, 0, 0); // Set the time to the beginning of the day (00:00:00) 
    const startOfDayTimestamp = date.getTime() * 1000; // Convert to microseconds 
    date.setHours(23, 59, 59, 999); // Set the time to the end of the day (23:59:59.999) 
    const endOfDayTimestamp = date.getTime() * 1000; // Convert to microseconds 
    return {
        startOfDayTimestamp,
        endOfDayTimestamp
    }
}

module.exports = {
    getChatroomsCountFromGcp
};