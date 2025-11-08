const { runBigQuery, TABLE_NAME } = require('./../big_query.js')

// /**
//  * Get the todays average spent time by users. 
//  * 
//  * @param {Date} date
//  * @return {number} - todays average spent time by users.  
//  */
const dailyAverageTimeSpentByUserCount = async (date) => {
  // Get the start and end timestamps for the given date
  let { startOfDayTimestamp, endOfDayTimestamp } = __getTimestampsForStartAndEnd(date);

  const query = `
  WITH TodayEngagements AS (
    SELECT
      user_pseudo_id,
      params.value.int_value AS engagement_time_msec
    FROM 
    ${TABLE_NAME},
      UNNEST(event_params) AS params
    WHERE 
      event_name = "user_engagement"
      AND params.key = "engagement_time_msec"
      AND TIMESTAMP_MICROS(event_timestamp) BETWEEN TIMESTAMP_MICROS(${startOfDayTimestamp}) AND TIMESTAMP_MICROS(${endOfDayTimestamp})
  ),
  AggregatedData AS (
    SELECT 
      COUNT(DISTINCT user_pseudo_id) AS total_unique_users,
      SUM(engagement_time_msec) AS total_time_spent_msec
    FROM 
      TodayEngagements
  )
  SELECT 
    total_unique_users,
    total_time_spent_msec,
    total_time_spent_msec / NULLIF(total_unique_users, 0) AS avg_time_spent_per_user_msec
  FROM 
    AggregatedData;`;

  const result = await runBigQuery(query);

  console.log('result', result);

  if (!result || result.length <= 0) return 0;

  let avg_time_minutes = 0;
  if (result[0].avg_time_spent_per_user_msec){
    avg_time_minutes = (result[0].avg_time_spent_per_user_msec / 1000) / 60;

    // rount of avg_time_minutes
    avg_time_minutes = Math.round(avg_time_minutes);
  }

  console.log('avg_time_minutes', avg_time_minutes);

  return  avg_time_minutes || 0;

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
    dailyAverageTimeSpentByUserCount
};