const { runBigQuery, TABLE_NAME } = require('./../big_query.js')

/**
 * Get total no of Scrolls per day and average scrolls per user.
 * 
 * @param {Date} date
 * @return {Promise<number>} - The total no of Scrolls per day and average scrolls per user.
 */
const getDailyTotalScrollsAndAverageScrollsPerUser = async (date) => {
    // Get the start and end timestamps for the given date
    const { startOfDayTimestamp, endOfDayTimestamp } = __getTimestampsForStartAndEnd(date);

    const query = `
  WITH DailyUserPosts AS (
    SELECT
      user_id,
      COUNT(*) AS total_posts_scrolled
    FROM
      ${TABLE_NAME}
    WHERE
      event_name = 'view_post' AND
      TIMESTAMP_MICROS(event_timestamp) BETWEEN TIMESTAMP_MICROS(${startOfDayTimestamp}) AND TIMESTAMP_MICROS(${endOfDayTimestamp})
    GROUP BY
      user_id
  )

  SELECT
    AVG(total_posts_scrolled) AS average_posts_scrolled_per_user,
    SUM(total_posts_scrolled) AS total_posts_scrolled_daily
  FROM
    DailyUserPosts;
`;

    const [result] = await runBigQuery(query);

    const averagePostsScrolledPerUser = result.average_posts_scrolled_per_user;
    const totalPostsScrolledDaily = result.total_posts_scrolled_daily;

    if (!averagePostsScrolledPerUser && !totalPostsScrolledDaily) {
        console.log(`Something went wrong while fetching the total scrolls and average scrolls per user`);
        return {
            'dailyCount': 0,
            'averageCount': 0
        };
    }

    return {
        'dailyCount': totalPostsScrolledDaily,
        'averageCount': Math.ceil(averagePostsScrolledPerUser)
    };
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
    getDailyTotalScrollsAndAverageScrollsPerUser
};