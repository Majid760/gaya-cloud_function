const { runBigQuery, TABLE_NAME } = require('./../big_query.js')

/**
 * Get Single Day Crowns Count
 * 
 * @param {Date} date
 * @return {Promise<number>} - The number of crowns given on the given day.
 */
const getScollPostsAverageByUsersCount = async () => {

    const query = `
    WITH UserPosts AS (
        SELECT
          user_id,
          COUNT(*) AS total_posts_scrolled
        FROM
          ${TABLE_NAME}
        WHERE
          event_name = 'view_post'
        GROUP BY
          user_id
      )
      
      SELECT
        AVG(total_posts_scrolled) AS average_posts_scrolled_per_user
      FROM
        UserPosts 
  `;

    // const query = `
    // SELECT 
    //  *
    // FROM  ${TABLE_NAME}
    // WHERE
    //   event_name = 'view_post'
    // LIMIT 1  
    //   `;

    //   const query = `
    //   SELECT 
    //    *
    //   FROM  ${TABLE_NAME}
    //   WHERE
    //     event_name = 'send_message'
    //     AND 'You sent a crown 👑' IN (
    //       SELECT value.string_value
    //       FROM UNNEST(event_params) AS param
    //       WHERE param.key = 'message'
    //     )
    //     LIMIT 1

    //     `;

    // SELECT 
    //     *
    // FROM 
    //     ${TABLE_NAME}
    // WHERE
    //    events.event_name = 'send_message'
    // `;

    const rows = await runBigQuery(query);
    console.log(`Today's rows: ${rows.length}`);

    console.log(`Today's rows: ${JSON.stringify(rows)}`);


    // let crownsMessagesCount = 0;
    // // iterate over the rows and and check if "event_params" contains "message" with value "You sent a crown 👑" then increment crownsMessagesCount by 1
    // rows.forEach(row => {
    //     const { event_params } = row;
    //     event_params.forEach(param => {
    //         if (param.key === 'message' && param.value.string_value === "You sent a crown 👑") {
    //             crownsMessagesCount++;
    //         }
    //     });
    // });

    return 0;


    // Print the results
    console.log('rows data is: ' + JSON.stringify(rows));
    // console.table(rows);
    if (!rows || rows.length == 0) return 0;
    return rows[0].total || 0;
}


module.exports = { getScollPostsAverageByUsersCount };
