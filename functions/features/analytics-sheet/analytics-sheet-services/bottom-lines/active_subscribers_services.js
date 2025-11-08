const admin = require("firebase-admin");
const db = admin.firestore();
/**
 * Fetches All the bottom lines
 * 
 * @param {boolean} isDaily - Whether to get the daily count
 * @param {boolean} isWeekly - Whether to get the weekly count
 * @param {boolean} isTotal - Whether to get the total count
 * @returns {Promise<{dailyCount:string, weeklyCount:string, totalCount:String}} - A map containing the daily, weekly, and total counts.
 */
const getActiveSubscribersBottomLines = async (isDaily = true, isWeekly = true, isTotal = true) => {

    let dailyCount = 0;
    if (isDaily) {
        dailyCount = await __getDailyActiveSubscribers();
    }
    return dailyCount;
}

const __getDailyActiveSubscribers = async () => {
    return await __firestoreQueryInvitesCount();
}

/**
 * Fetches the total number of active pro subscribers.
 * @returns  {Promise<Number>} total number of active pro subscribers.
 */
const __firestoreQueryInvitesCount = async () => {

    try {
        const usersCollection = db.collection('users');

        const date = new Date();
        /// Doing it bcs bQ is 1 day behind
        date.setDate(date.getDate() - 1); /// Revert to 1 day

        const currentFullYear = date.getFullYear();

        // Counter variable for active subscribers
        let activeSubscribersCount = 0;

        // Query the users collection for active pro subscribers
        const querySnapshot = await usersCollection

            .where('entitlements', '!=', null) // Filter where 'subscriptions' field exists
            .orderBy('entitlements')
            .orderBy('createdAt') // Order by 'createdAt' field
            .get();

        // iterate on querySnapshot and save all the data into an array ob users
        if (querySnapshot.docs.length <= 0) return;
        let allUsers = querySnapshot.docs.map(doc => doc.data());

        // Process the query results
        allUsers.forEach((userDoc) => {
            let userData = userDoc;
            // Check if 'entitlements' map exists and 'PRO' key exists inside it
            if (userData.entitlements && userData.entitlements.PRO) {

                let expiresDate = new Date(userData.entitlements.PRO.expires_date);
                // console.log(`expiresDate is : ${expiresDate}`);

                // Check if 'expire_date' is within today
                if (expiresDate && expiresDate >= date && (expiresDate.getFullYear() - currentFullYear) <= 1 ) {
                    // Increment the counter if the user is a pro subscriber
                    activeSubscribersCount++;
                } else {
                }
            }
        });


        console.log('---------------------> Active Subscribers Count:', activeSubscribersCount);
        return activeSubscribersCount || 0;

    }
    catch (_) {
        console.log("Error in __firestoreQueryInvitesCount" + _);
        return 0;
    }

}
module.exports = {
    getActiveSubscribersBottomLines
}