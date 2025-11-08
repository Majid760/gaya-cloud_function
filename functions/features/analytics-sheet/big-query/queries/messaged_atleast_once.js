//
// This query returns the number of users who have messaged at least once in the app.
// 
const { runBigQuery, TABLE_NAME } = require('./../big_query.js');
const util = require('./../../../../utils/helpers.js');

 

/**
 *   
 * 
>  ┌─────────┬────────────┐
>  │ (index) │ user_count │
>  ├─────────┼────────────┤
>  │    0    │    3674    │
>  └─────────┴────────────┘
 */
const runBQUserMessagedAtleastOnce = async (date) => { 

       // Get the start and end timestamps for the given date
       const { startOfDayTimestamp, endOfDayTimestamp } = __getTimestampsForStartAndEnd(date);
   // Users who messaged at least once SQL query
   const query = `
    SELECT
       COUNT(DISTINCT user_id) as user_count
   
    FROM
       ${TABLE_NAME}
   
    WHERE
       event_name IN ('tap_post_homefeed', 'send_message_homefeed', 'send_message')
       AND
       TIMESTAMP_MICROS(event_timestamp) BETWEEN TIMESTAMP_MICROS(${startOfDayTimestamp}) AND TIMESTAMP_MICROS(${endOfDayTimestamp})
       AND 
       user_id IS NOT NULL
   
    HAVING 
        COUNT(DISTINCT event_name) >= 1
   `;

    const rows = await runBigQuery(query);

    // Print the results
    console.table(rows);
    // console.log(JSON.stringify(rows));
    return rows;
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
    runBQUserMessagedAtleastOnce
}