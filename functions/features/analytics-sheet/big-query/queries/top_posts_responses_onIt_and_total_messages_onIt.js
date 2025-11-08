const { runBigQuery, TABLE_NAME } = require('./../big_query.js')

// /**
//  * Get Single Day Responses on Posts
//  * 
//  * @param {Date} date
//  * @return {Promise<number>} - The number of responses on posts created on the given day.
//  */
// const getSingleDayPostResponsesMessages = async (date) => {

//   // Get the start and end timestamps for the given date
//   const { startOfDayTimestamp, endOfDayTimestamp } = __getTimestampsForStartAndEnd(date);
//   // Get the number of users that posted today
//   const query = `
//   SELECT 
//     FORMAT_TIMESTAMP('%d/%b/%y', TIMESTAMP_TRUNC(TIMESTAMP_MICROS(event_timestamp), DAY)) as event_day, 
//     COUNT(DISTINCT user_pseudo_id) as num_users_posted_today
//   FROM 
//     ${TABLE_NAME}
//   WHERE
//     event_name = 'create_post' AND
//     TIMESTAMP_MICROS(event_timestamp) BETWEEN TIMESTAMP_MICROS(${startOfDayTimestamp}) AND TIMESTAMP_MICROS(${endOfDayTimestamp})
//   GROUP BY (event_day)
//   ORDER BY event_day ASC
// `;

//   // Get the total count of users that posted today
//   const totalCountQuery = `
//   SELECT SUM(num_users_posted_today) as total
//   FROM (
//     ${query}
//   )
// `;
//   const rows = await runBigQuery(totalCountQuery);

//   // Print the results
//   console.table(rows);
//   if (!rows || rows.length == 0) return 0;
//   return rows[0].total || 0;
// }

/**
 * Get Single Day Total Messages
 * 
 * @param {Date} date
 * @param {Array} dialogIds - list of dialog_ids
 * @return {Promise<array>} - Messages created on the given day.
 */
const getSingleDayTotalMessages = async (date, dialogIds) => {
  // console.time('getSingleDayTotalMessages');
  const dialogIdConditions = dialogIds.map(dialogId => `param.value.string_value = '${dialogId}'`).join(' OR ');

  // Get the start and end timestamps for the given date
  const { startOfDayTimestamp, endOfDayTimestamp } = __getTimestampsForStartAndEnd(date);

  const query = `
    SELECT
      *
    FROM
    ${TABLE_NAME}
    WHERE
      event_name = 'send_message' AND
      TIMESTAMP_MICROS(event_timestamp) BETWEEN TIMESTAMP_MICROS(${startOfDayTimestamp}) AND TIMESTAMP_MICROS(${endOfDayTimestamp})
      AND
      EXISTS (
        SELECT 1
        FROM UNNEST(event_params) AS param
        WHERE param.key = 'dialog_id' AND (${dialogIdConditions})
      )
  `;



  const rows = await runBigQuery(query);
  // console.timeEnd('getWeeklyMessagesDataFromGcp');

  console.timeEnd('Rows length is' + rows.length);

  if (!rows || rows.length == 0) return [];
  return rows || [];

}


/**
 * Get Single Day Responses on Posts
 * 
 * @param {Date} date
 * @return {Promise<number>} - The number of responses on posts created on the given day.
 */
const getSingleDayPostResponsesMessages = async (date) => {
  // Get the start and end timestamps for the given date
  const { startOfDayTimestamp, endOfDayTimestamp } = __getTimestampsForStartAndEnd(date);

  const query = `
    SELECT
      *
    FROM
    ${TABLE_NAME}
    WHERE
      event_name = 'send_message_homefeed' AND
      TIMESTAMP_MICROS(event_timestamp) BETWEEN TIMESTAMP_MICROS(${startOfDayTimestamp}) AND TIMESTAMP_MICROS(${endOfDayTimestamp})
  `;

  const rows = await runBigQuery(query);

  // Print the results
  // console.table(rows);
  if (!rows || rows.length == 0) return [];
  return rows || [];

}

/**
 * Get Single Day Answers messages Counts on Posts
 * 
 * @param {Date} date
 * @return {Promise<number>} - The number of answers on posts created on the given day.
 */
const getSingleDayAnswersCountOnPosts = async (date) => {
  // Get the start and end timestamps for the given date
  const { startOfDayTimestamp, endOfDayTimestamp } = __getTimestampsForStartAndEnd(date);

  const query = `
    SELECT
      COUNT(*) as total_count
    FROM
    ${TABLE_NAME}
    WHERE
      event_name = 'send_message_homefeed' AND
      TIMESTAMP_MICROS(event_timestamp) BETWEEN TIMESTAMP_MICROS(${startOfDayTimestamp}) AND TIMESTAMP_MICROS(${endOfDayTimestamp})
  `;

  const rows = await runBigQuery(query);

  if (!rows || rows.length === 0) {
    return 0; // Return 0 if there are no matching rows
  }
  
  return rows[0].total_count;
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
  getSingleDayPostResponsesMessages,
  getSingleDayTotalMessages,
  getSingleDayAnswersCountOnPosts
};