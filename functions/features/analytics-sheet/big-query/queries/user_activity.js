/**
* DESCRIPTION: 

- High Activity (10+ app opens/week, 10+ min/day): 4-6 notifications/day 
- Moderate Activity (3-10 app opens/week 4+ min/day): 2-4 notifications/day 
- Low Activity (0-3 app opens/week): 1-2 notifications/day 

 */
const { runBigQuery, TABLE_NAME } = require('../big_query.js'); 

/**
 * Get the activity of users for the current week
 * 
 * @returns {Promise<Array>} - rows - user_id, app_opens_per_week, tz_offset
 */
const runBQUserActivity = async () => {
  console.log(`ℹ️ [runBQUserActivity] Running query for user activity`);
  let query = `
  WITH active_users AS (
    SELECT DISTINCT
      user_id AS active_users
    FROM
      ${TABLE_NAME}
    WHERE
      event_name = "session_start"
      AND DATE_TRUNC(EXTRACT(DATE FROM TIMESTAMP_MICROS(event_timestamp)), WEEK) = DATE_TRUNC(CURRENT_DATE(), WEEK)
      AND user_id IS NOT NULL
      AND user_id NOT IN (
        SELECT DISTINCT
          user_id AS removed_users
        FROM
          ${TABLE_NAME}
        WHERE
          event_name = "app_remove"
          AND user_id IS NOT NULL
          AND DATE_TRUNC(EXTRACT(DATE FROM TIMESTAMP_MICROS(event_timestamp)), WEEK) = DATE_TRUNC(CURRENT_DATE(), WEEK)
      )
  ),
  user_activity AS (
    SELECT
      events.user_id,
      COUNT(events.event_name) AS app_opens_per_week,
      device.time_zone_offset_seconds AS tz_offset
    FROM
      ${TABLE_NAME} AS events
    LEFT JOIN
      active_users
    ON
      events.user_id = active_users.active_users
    LEFT JOIN
      UNNEST([events.device]) AS device
    WHERE
      events.event_name = "session_start"
      AND events.user_id IS NOT NULL
      AND DATE_TRUNC(EXTRACT(DATE FROM TIMESTAMP_MICROS(events.event_timestamp)), WEEK) = DATE_TRUNC(CURRENT_DATE(), WEEK)
    GROUP BY
      events.user_id, tz_offset
  )
  SELECT
    user_id,
    app_opens_per_week,
    tz_offset
  FROM
    user_activity;
`; 
  console.log(`query: ${query}`);

  const rows = await runBigQuery(query);

  // Print the results
  console.table(rows);
  // console.log(JSON.stringify(rows));
  return rows;
};




module.exports = {
  runBQUserActivity
}