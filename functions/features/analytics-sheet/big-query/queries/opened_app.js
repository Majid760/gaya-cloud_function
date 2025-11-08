// /**
//  * Not In Use - Issue is we cant make relations between users in the app and users in the big query.
//  * pseudo_id is not the same as user_id in the app.
//  * Workaround: We will have to use client side to set the user_id as the pseudo_id. 
//  * more: https://firebase.google.com/docs/analytics/userid 😕
//  */


const { runBigQuery, TABLE_NAME } = require('./../big_query.js')
/**
 * Users that opened the app this week as distinct users count.
 *  
 * @returns {Promise<Number>} - The number of users that opened the app this week as distinct users count.
 */
const runBQUsersOpenedApp = async () => { 

    const query = `
            SELECT 
                events.event_date as event_week,
            ARRAY_AGG(distinct events.user_id) as user_ids_opened_app_this_week
            FROM
            ${TABLE_NAME} as events
            WHERE events.event_name = "session_start" AND events.user_id IS NOT NULL
            group by events.event_date 
            order by events.event_date desc
            `
    const rows = await runBigQuery(query);

    // Print the results
    console.table(rows);
    // console.log(JSON.stringify(rows));
    return rows;
}

/**
 * @returns {Promise<Array<{id: String, createdAt: String}>>} - An array of users with their id and createdAt date.
 */
const _fetchUsers = async () => {
    const admin = require("firebase-admin");
    const db = admin.firestore();
    const users = (await db.collection('users').orderBy('createdAt', 'desc').limit(500).get()).docs;
    const usersCreatedAt = users.map(user => { user.id, user.data().createdAt });
    console.log(`length: ${usersCreatedAt.length}`);
    return usersCreatedAt;
}

const makeCohortAppOpenedWithUserRegistration = async () => {

    // Fetch user registration data
    const usersWithRegDate = await _fetchUsers(); // result: [{id: '123', createdAt: '2021-09-01'}, {id: '456', createdAt: '2021-09-02'}]

    // Fetch users who opened the app
    const usersOpenedApp = await runBQUsersOpenedApp(); // result: [{event_week: '2021-09-01', user_ids_opened_app_this_week: ['123', '456']}]

    // Create a cohort object
    const cohort = {};

    // Iterate through the user registration data
    usersWithRegDate.forEach(user => {
        // Initialize the cohort entry for each user
        cohort[user.id] = { registrationDate: user.createdAt, openedApp: [] };
    });

    // Iterate through users who opened the app data
    usersOpenedApp.forEach(weekData => {
        const eventWeek = weekData.event_week;
        const openedUsers = weekData.user_ids_opened_app_this_week;

        // Iterate through opened users in this week
        openedUsers.forEach(userId => {
            // Check if the user exists in the cohort (registered users)
            if (cohort[userId]) {
                // Add the week to the list of weeks in which the user opened the app
                cohort[userId].openedApp.push(eventWeek);
            }
        });
    });

    // Now, your cohort object contains registration and app open data for each user
    console.log(cohort);
}


module.exports = {
    runBQUsersOpenedApp,
    makeCohortAppOpenedWithUserRegistration
}