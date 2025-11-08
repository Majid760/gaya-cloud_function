const { runBigQuery, TABLE_NAME } = require('./../big_query.js')


// /**
//  * Get the todays app downloads. 
//  * 
//  * @param {Date} date
//  * @return {number} - App downloads count. 
//  */
const dailyAppDownloadsCount = async (date) => {
  // Get the start and end timestamps for the given date
  let { startOfDayTimestamp, endOfDayTimestamp } = __getTimestampsForStartAndEnd(date);


    const query = `
    SELECT
    COUNT(DISTINCT user_pseudo_id) AS distinct_entries_count
  FROM
  ${TABLE_NAME}
  WHERE
    event_name = 'first_open'
    AND
    TIMESTAMP_MICROS(event_timestamp) BETWEEN TIMESTAMP_MICROS(${startOfDayTimestamp}) AND TIMESTAMP_MICROS(${endOfDayTimestamp})
      `;   

  const result = await runBigQuery(query);

  return  result[0].distinct_entries_count || 0;

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
    dailyAppDownloadsCount
};