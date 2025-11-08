const { runBigQuery, TABLE_NAME } = require('./../big_query.js')

/**
 * Get the todays total users count who opened insta share bottomsheet.
 * 
 * @param {Date} date
 * @return {Promise<number>} - The todays total users count who opened insta share bottomsheet.
 */
const getSingleDayTotalUsersWhoOpenedInstaShareBottomsheetCount = async (date) => {
  // Get the start and end timestamps for the given date
  const { startOfDayTimestamp, endOfDayTimestamp } = __getTimestampsForStartAndEnd(date);

  const query = `
    SELECT
    COUNT(*) AS total_results
    FROM
    ${TABLE_NAME}
    WHERE
      event_name = 'popup_swap_limitation' AND
      TIMESTAMP_MICROS(event_timestamp) BETWEEN TIMESTAMP_MICROS(${startOfDayTimestamp}) AND TIMESTAMP_MICROS(${endOfDayTimestamp})
  `;

  const rows = await runBigQuery(query);

  return  rows[0].total_results || 0;
}
/**
 * Get the todays total users count who actually posted as story.
 * 
 * @param {Date} date
 * @return {Promise<number>} - The todays total users count who actually posted as story.
 */
const getSingleDayTotalUsersWhoActuallyPostedCount = async (date) => {
    // Get the start and end timestamps for the given date
    const { startOfDayTimestamp, endOfDayTimestamp } = __getTimestampsForStartAndEnd(date);
  
    const query = `
      SELECT
      COUNT(*) AS total_results
      FROM
      ${TABLE_NAME}
      WHERE
        event_name = 'tap_share_insta_story' AND
        TIMESTAMP_MICROS(event_timestamp) BETWEEN TIMESTAMP_MICROS(${startOfDayTimestamp}) AND TIMESTAMP_MICROS(${endOfDayTimestamp})
    `;
  
    const rows = await runBigQuery(query);
    
    return  rows[0].total_results || 0;
  
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
    getSingleDayTotalUsersWhoOpenedInstaShareBottomsheetCount,
    getSingleDayTotalUsersWhoActuallyPostedCount
};