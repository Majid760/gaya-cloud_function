const { runBigQuery, TABLE_NAME } = require('./../big_query.js')

/**
 * Get Single Day Received notifications
 * 
 * @param {Date} date
 * @return {Promise<number>} - The number of received notifications on the given day.
 */
const getSingleDayTotalReceivedNotifications = async (date) => {
  // Get the start and end timestamps for the given date
  const { startOfDayTimestamp, endOfDayTimestamp } = __getTimestampsForStartAndEnd(date);

  // const query = `
  //   SELECT
  //     *
  //   FROM
  //   ${TABLE_NAME}
  //   WHERE
  //     event_name = 'notification_receive' AND
  //     TIMESTAMP_MICROS(event_timestamp) BETWEEN TIMESTAMP_MICROS(${startOfDayTimestamp}) AND TIMESTAMP_MICROS(${endOfDayTimestamp})
  // `;


  const query = `
  SELECT
    COUNT(*) AS total_results
  FROM
    ${TABLE_NAME}
  WHERE
    event_name = 'notification_receive' AND
    TIMESTAMP_MICROS(event_timestamp) BETWEEN TIMESTAMP_MICROS(${startOfDayTimestamp}) AND TIMESTAMP_MICROS(${endOfDayTimestamp})
`;

  const rows = await runBigQuery(query);

  
  if (!rows ) return 0;
  return rows[0].total_results || 0;

}
/**
 * Get Single Day Opened notifications
 * 
 * @param {Date} date
 * @return {Promise<number>} - The number of opened notifications on the given day.
 */
const getSingleDayTotalOpenedNotifications = async (date) => {
    // Get the start and end timestamps for the given date
    const { startOfDayTimestamp, endOfDayTimestamp } = __getTimestampsForStartAndEnd(date);
  
    const query = `
      SELECT
      COUNT(*) AS total_results
      FROM
      ${TABLE_NAME}
      WHERE
        event_name = 'notification_open' AND
        TIMESTAMP_MICROS(event_timestamp) BETWEEN TIMESTAMP_MICROS(${startOfDayTimestamp}) AND TIMESTAMP_MICROS(${endOfDayTimestamp})
    `;
  
    const rows = await runBigQuery(query);
  console.log("2 Total Notifications Opened" + `${rows[0].total_results}`);
    
    if (!rows) return 0;
    return rows[0].total_results || 0;
  
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
    getSingleDayTotalReceivedNotifications,
    getSingleDayTotalOpenedNotifications
};