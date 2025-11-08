const { runBigQuery, TABLE_NAME } = require('./../big_query.js')
/**
 * Users that posted at least once today as distinct users count.
 *  
 * @returns {Promise<Array>} rows
 */
const runBQUsersPostedToday = async () => {

    /// Users that posted at least once SQL query
    const query = `
        SELECT 
            FORMAT_TIMESTAMP('%d/%b/%Y', TIMESTAMP_TRUNC(TIMESTAMP_MICROS(event_timestamp), DAY)) as event_day, COUNT(DISTINCT user_pseudo_id) as num_users_posted_today
        FROM 
            ${TABLE_NAME}
        WHERE
            event_name = 'create_post' AND
            _TABLE_SUFFIX = FORMAT_TIMESTAMP("%d/%b/%Y", CURRENT_DATE())
        GROUP BY (event_day) 
        ORDER BY event_day ASC
    `;

    const rows = await runBigQuery(query);

    // Print the results
    console.table(rows);
    return rows;



}
/**
 * 
 * @param {Date} startDate 
 * @param {Date} endDate 
 * @returns 
 */
const runBQUsersPostedRange = async (startDate, endDate) => {

    const startDateTimestamp = startDate.toISOString().slice(0, 19).replace('T', ' ');
    const endDateTimestamp = endDate.toISOString().slice(0, 19).replace('T', ' ');

    console.log("Start Date Timestamp: ", startDateTimestamp);
    console.log("End Date Timestamp: ", endDateTimestamp);
    console.log("Start Date: ", startDate);
    console.log("End Date: ", endDate);
    return;



    // /// Users that posted at least once SQL query
    // const query = `
    //     SELECT 
    //         FORMAT_TIMESTAMP('%d/%b/%y', TIMESTAMP_TRUNC(TIMESTAMP_MICROS(event_timestamp), DAY)) as event_day, COUNT(user_pseudo_id) as num_users_posted_today
    //     FROM 
    //         ${TABLE_NAME}
    //     WHERE
    //         event_name = 'create_post' AND
    //         _TABLE_SUFFIX BETWEEN '${startDate}' AND '${endDate}'
    //     GROUP BY (event_day)
    //     ORDER BY event_day ASC

    // `;
    const query = `
  SELECT 
    FORMAT_TIMESTAMP('%d/%b/%y', TIMESTAMP_TRUNC(TIMESTAMP_MICROS(event_timestamp), DAY)) as event_day, 
    COUNT(user_pseudo_id) as num_users_posted_today
  FROM 
    ${TABLE_NAME}
  WHERE
    event_name = 'create_post' AND
    TIMESTAMP_MICROS(event_timestamp) BETWEEN TIMESTAMP('${startDateTimestamp}') AND TIMESTAMP('${endDateTimestamp}')
  GROUP BY (event_day)
  ORDER BY event_day ASC
`;

    const rows = await runBigQuery(query);

    // Print the results
    console.table(rows);
    return rows;
}

/**
 * Get Single Day Posts Count
 * 
 * @param {Date} date
 * @return {Promise<number>} - The number of posts created on the given day.
 */
const getSingleDayPostsCount = async (date) => { 

    // Get the start and end timestamps for the given date
    const { startOfDayTimestamp, endOfDayTimestamp } = __getTimestampsForStartAndEnd(date);
    // Get the number of users that posted today
    const query = `
  SELECT 
    FORMAT_TIMESTAMP('%d/%b/%y', TIMESTAMP_TRUNC(TIMESTAMP_MICROS(event_timestamp), DAY)) as event_day, 
    COUNT(DISTINCT user_pseudo_id) as num_users_posted_today
  FROM 
    ${TABLE_NAME}
  WHERE
    event_name = 'create_post' AND
    TIMESTAMP_MICROS(event_timestamp) BETWEEN TIMESTAMP_MICROS(${startOfDayTimestamp}) AND TIMESTAMP_MICROS(${endOfDayTimestamp})
  GROUP BY (event_day)
  ORDER BY event_day ASC
`;

    // Get the total count of users that posted today
    const totalCountQuery = `
  SELECT SUM(num_users_posted_today) as total
  FROM (
    ${query}
  )
`;
    const rows = await runBigQuery(totalCountQuery);

    // Print the results
    console.table(rows);
    if (!rows || rows.length == 0) return 0;
    return rows[0].total || 0;
}

// /**
//  * Get posts between 2 data. 
//  * 
//  * @param {Date} date
//  * @return {number} - App downloads count. 
//  */
const fetchAllPostsFromGcp = async (end, start) => {
  // Get the start and end timestamps for the given date
  let { endOfDayTimestamp  } = __getTimestampsForStartAndEnd(end);

  let { startOfDayTimestamp } = __getTimestampsForStartAndEnd(start);

    const query = `
    SELECT
    *
  FROM
  ${TABLE_NAME}
  WHERE
    event_name = 'create_post'
    AND
    TIMESTAMP_MICROS(event_timestamp) BETWEEN TIMESTAMP_MICROS(${startOfDayTimestamp}) AND TIMESTAMP_MICROS(${endOfDayTimestamp})
      `;   

  const result = await runBigQuery(query);

  // apply loop on results and save them in an array
  const allPosts = [];

  // check if result is valid and not empty 
  if(!result) return [];
  
  result.forEach((post) => {

    if(post.event_params){
      // check if timestamp and userId keys exists then print their values
      if(post.event_params.find((param) => param.key === "timestamp") && post.event_params.find((param) => param.key === "userId")){

        let timestamp = post.event_params.find((param) => param.key === "timestamp").value;

        let date = timestamp.int_value ? new Date(timestamp.int_value) : new Date();

        let createdAt = date.toISOString().split('T')[0]

        let userId = post.event_params.find((param) => param.key === "userId").value;

        allPosts.push({
          userId: userId.string_value || '',
          createdAt: createdAt,
        });
        
      }
    }

  });

  console.log("All Posts length: ", allPosts.length);

  return  allPosts || [];

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

module.exports = { runBQUsersPostedToday, runBQUsersPostedRange, getSingleDayPostsCount,
   fetchAllPostsFromGcp 
};