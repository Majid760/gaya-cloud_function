const { runBigQuery, TABLE_NAME } = require('./../big_query.js')


const runExport = async () => {   
  // ALL USERS SPENT TIME IN APP HOURLY.
//     const query = `
//    SELECT
//   user_pseudo_id,
//   user_id,
//   SUM(params.value.int_value) / 1000 / 3600 AS total_time_spent_hours 
// FROM ${TABLE_NAME} AS events,
//   UNNEST(events.event_params) AS params
// WHERE 
//   events.event_name = "user_engagement"
//   AND params.key = "engagement_time_msec"
//   AND user_id is not null
// GROUP BY 
//   user_pseudo_id, user_id;
//     `;


const query = `
WITH FilteredEvents AS (
  SELECT
    user_pseudo_id,
    user_id,
    (
      SELECT
        IFNULL(userProperties['uid'], NULL)
      FROM
        UNNEST(event_params) AS userProperties
      WHERE
        userProperties.key = 'uid'
    ) AS uid,
    params.value.int_value AS engagement_time_msec,
    DATE(TIMESTAMP_MICROS(event_timestamp)) AS event_date
    FROM ${TABLE_NAME} AS events,
  CROSS JOIN
    UNNEST(events.event_params) AS params
  WHERE 
    events.event_name = "user_engagement"
    AND params.key = "engagement_time_msec"
    AND DATE(TIMESTAMP_MICROS(event_timestamp)) >= DATE_SUB(DATE('2024-05-17'), INTERVAL 16 DAY) AND DATE(TIMESTAMP_MICROS(event_timestamp)) <= DATE('2024-05-17')
),
MonthlyAggregates AS (
  SELECT
    COALESCE(user_id, user_pseudo_id) AS user_identifier,
    COALESCE(uid, user_pseudo_id) AS user_identifier2,
    FORMAT_TIMESTAMP("%Y-%m", TIMESTAMP(event_date)) AS month,
    SUM(engagement_time_msec) / 1000 / 3600 AS total_time_spent_hours
  FROM 
    FilteredEvents
  WHERE
    DATE(event_date) BETWEEN DATE('2024-05-01') AND DATE('2024-05-17')
  GROUP BY 
    user_identifier, user_identifier2, month
)
SELECT 
  user_identifier AS user_id,
  user_identifier2 AS uid,
  COALESCE(MAX(CASE WHEN month = '2024-05' THEN total_time_spent_hours END), 0) AS may_hours,
  COALESCE(MAX(CASE WHEN month = '2024-04' THEN total_time_spent_hours END), 0) AS april_hours,
  COALESCE(MAX(CASE WHEN month = '2024-03' THEN total_time_spent_hours END), 0) AS march_hours,
  COALESCE(MAX(CASE WHEN month = '2024-02' THEN total_time_spent_hours END), 0) AS feb_hours
FROM 
  MonthlyAggregates
GROUP BY 
  user_identifier, user_identifier2
ORDER BY 
  user_identifier;
`;
    
    const rows = await runBigQuery(query);
    
    return  rows ;
}

 

module.exports = { runExport };
