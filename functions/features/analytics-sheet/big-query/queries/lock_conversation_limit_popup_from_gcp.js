const { runBigQuery, TABLE_NAME } = require('./../big_query.js')

/**
 * Get the total locked conversation popups count. 
 * 
 * @param {Date} date
 * @return {Promise<number>} - The total locked conversation popups count. 
 */
const getSingleDayTotalLockConversationLimitCount = async (date) => {
  // Get the start and end timestamps for the given date
  let { startOfDayTimestamp, endOfDayTimestamp } = __getTimestampsForStartAndEnd(date);

  //   const query = `
  //   SELECT
  //     COUNT(DISTINCT user_id) AS unique_users_count
  //   FROM
  //     ${TABLE_NAME}
  //   WHERE
  //     event_name = 'lock_chatroom_event' AND
  //     TIMESTAMP_MICROS(event_timestamp) BETWEEN TIMESTAMP_MICROS(${startOfDayTimestamp}) AND TIMESTAMP_MICROS(${endOfDayTimestamp})
  // `;


  const query = `
  SELECT
    COUNT(DISTINCT IF(param.key = 'other_user_id', param.value.string_value, NULL)) AS unique_users_count
  FROM
    ${TABLE_NAME},
    UNNEST(event_params) AS param
  WHERE
    event_name = 'lock_chatroom_event' AND
    TIMESTAMP_MICROS(event_timestamp) BETWEEN TIMESTAMP_MICROS(${startOfDayTimestamp}) AND TIMESTAMP_MICROS(${endOfDayTimestamp}) AND
    param.key = 'other_user_id'
`;

  const rows = await runBigQuery(query);

  let dataCount = 0;

  // Process the result
  if (rows.length > 0) {
    const { unique_users_count } = rows[0];
    dataCount = unique_users_count;
    console.log(`Total Unique Users Count: ${unique_users_count}`);
  } else {
    dataCount = 0;
    console.log('No data found for the specified conditions.');
  }

  return dataCount;

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
  getSingleDayTotalLockConversationLimitCount
};