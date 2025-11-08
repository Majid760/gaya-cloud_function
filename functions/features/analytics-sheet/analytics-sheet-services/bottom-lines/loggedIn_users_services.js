const admin = require("firebase-admin");
const db = admin.firestore();
const util = require('../../../../utils/helpers.js');



/**
*  @returns {Promise<array>} - Daily Logged-In users
*/
const getFirebaseAuthLoggedInUsersPercentage = async () => {

    try {

        // Separate users based on login date
        const currentDate = new Date();
        let firstDate = new Date(currentDate);
        firstDate.setDate(currentDate.getDate() - 2); // Adjust as needed

        let secondDate = new Date(currentDate);
        secondDate.setDate(currentDate.getDate() - 1);
        
        console.log('firstDate is:' + firstDate + " and secondDate is:", secondDate);


        const initalDate = util.getStartAndEndTimeForGivenDate(firstDate);
        const dayAfterDate = util.getStartAndEndTimeForGivenDate(secondDate);

        const initialDayUsersLoginCounts = await __firestoreQueryInvitesCount(initalDate.start, initalDate.end);
        const dayAfterDayUsersLoginCounts = await __firestoreQueryInvitesCount(dayAfterDate.start, dayAfterDate.end);

        // calculate percentage of users who logged in on next day
        const percentageOfUsers = Math.ceil((dayAfterDayUsersLoginCounts / initialDayUsersLoginCounts) * 100);

        console.log('Percentage of users who logged in on next day:', percentageOfUsers);

        return percentageOfUsers;

    }
    catch (error) {
        console.log("error occured in getFirebaseAuthLoggedInUsersPercentage():" + error);
    }
}


/**
 * Fetches the total number logged-in users between the given start and end dates.
 * 
 * @param {Date?} start 
 * @param {Date?} end 
 * @returns  {Promise<Number>} total number of users
 */
const __firestoreQueryInvitesCount = async (start, end) => {
    let query = db.collection('fcmTokens');
    if (start && end) {
        query = query.where('updatedAt', '>=', start).where('updatedAt', '<=', end);
    }

    const totalCount = await query.count().get();

    return totalCount.data().count;
}

module.exports = {
    getFirebaseAuthLoggedInUsersPercentage
}


