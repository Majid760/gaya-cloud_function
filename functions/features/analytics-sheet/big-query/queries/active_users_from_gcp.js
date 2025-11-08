const { runBigQuery, TABLE_NAME } = require('./../big_query.js')

/**
 * Get total no of Scrolls per day and average scrolls per user.
 * 
 * @param {Date} date
 * @return {Promise<number>} - The total no of Scrolls per day and average scrolls per user.
 */
const getActiveUsersCountFromGcp = async (date) => {
    // Get the start and end timestamps for the given date
    const { startOfDayTimestamp, endOfDayTimestamp } = __getTimestampsForStartAndEnd(date);

const query = `
SELECT
  FORMAT_DATE('%Y-%m-%d', DATE(TIMESTAMP_MICROS(event_timestamp))) AS event_day,
  COUNT(DISTINCT user_id) AS daily_active_users
FROM
${TABLE_NAME}
WHERE
  TIMESTAMP_MICROS(event_timestamp) BETWEEN TIMESTAMP_MICROS(${startOfDayTimestamp}) AND TIMESTAMP_MICROS(${endOfDayTimestamp})
GROUP BY
  event_day
ORDER BY
  event_day
`;

    const [result] = await runBigQuery(query);

    console.log(`printed result is: ${JSON.stringify(result)}`);


    const activeUsers = result.daily_active_users;

    if (!activeUsers) {
        console.log(`Something went wrong while fetching the activeUsers`);
        return 0;
    }

    return activeUsers || 0;
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
    getActiveUsersCountFromGcp
};