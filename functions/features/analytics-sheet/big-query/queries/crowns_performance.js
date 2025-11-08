const { runBigQuery, TABLE_NAME } = require('./../big_query.js')

/**
 * Get Single Day Crowns Count
 * 
 * @param {Date} date
 * @return {Promise<number>} - The number of crowns given on the given day.
 */
const getSingleDayCrownsCount = async (date) => { 

    // Get the start and end timestamps for the given date
    const { startOfDayTimestamp, endOfDayTimestamp } = __getTimestampsForStartAndEnd(date);
    const query = `
    SELECT 
    COUNT(*) AS total_results
    FROM  ${TABLE_NAME}
    WHERE
      event_name = 'send_message' AND
      TIMESTAMP_MICROS(event_timestamp) BETWEEN TIMESTAMP_MICROS(${startOfDayTimestamp}) AND TIMESTAMP_MICROS(${endOfDayTimestamp}) AND
      EXISTS (SELECT 1 FROM UNNEST(event_params) AS param WHERE param.key = 'message' AND param.value.string_value = 'You sent a crown 👑')
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

module.exports = { getSingleDayCrownsCount };
