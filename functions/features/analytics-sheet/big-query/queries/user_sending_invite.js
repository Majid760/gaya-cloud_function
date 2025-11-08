//
// Users that are sending invite to other users
// 
const { runBigQuery, TABLE_NAME } = require('./../big_query.js');
const util = require('./../../../../utils/helpers.js');

 

/**
 * 
 * @description:
>  ┌─────────┬───────────────┬────────────────────────────┐
>  │ (index) │   event_day   │ total_users_sending_invite │
>  ├─────────┼───────────────┼────────────────────────────┤
>  │    0    │ '05/Dec/2023' │             24             │
>  └─────────┴───────────────┴────────────────────────────┘
 */
const runBQUserSendingInvite = async () => {
    const { start, end } = util.getCurrentDayStartAndEndTime(true);

    /// Users that opened the app SQL query
    const query = `
    SELECT 
        FORMAT_TIMESTAMP('%d/%b/%Y', TIMESTAMP_TRUNC(TIMESTAMP_MICROS(event_timestamp), DAY)) as event_day, 
        COUNT(DISTINCT user_id) as total_users_sending_invite,
        COUNT(user_id) as current_day_invites_sent
    FROM 
        ${TABLE_NAME}
    WHERE
        event_name = 'invite_user' 
        AND 
        user_id IS NOT NULL 
        AND 
        TIMESTAMP_MICROS(event_timestamp) >= TIMESTAMP_SECONDS(${start})
        AND TIMESTAMP_MICROS(event_timestamp) < TIMESTAMP_SECONDS(${end})
    GROUP BY (event_day) 
    ORDER BY event_day ASC
    `;
    const rows = await runBigQuery(query);

    // Print the results
    console.table(rows);
    // console.log(JSON.stringify(rows));
    return rows;
}

module.exports = {
    runBQUserSendingInvite
}