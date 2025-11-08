
const {runBQUserSendingInvite} = require('./../../big-query/queries/user_sending_invite.js'); 




/**
 * Get Today (N-1) users that are sending invite to other users AND Total Invites Sent Today
 * 
 * @returns {Promise<{usersThatSentInviteCount:number, totalInvitesSentCount:number}>} - A map containing the usersThatSentInviteCount and totalInvitesSentCount.
 */
const getInvitesBottomLine = async ()=> {
    let usersThatSentInviteCount = 0;
    let totalInvitesSentCount = 0;

    try {
        const response = await runBQUserSendingInvite(); 
        if(response.length>0){
            usersThatSentInviteCount = response[0].total_users_sending_invite;
            totalInvitesSentCount = response[0].current_day_invites_sent;
        } 
        console.log("User Sending Invite Bottom Line");
        // console.table(data); 
    } catch (e) { 
        console.error(e);
    }


    return {
        usersThatSentInviteCount,
        totalInvitesSentCount
    };
}


/**
 * @@@IMPORTANT@@@
 * COMMENTED OUT BECAUSE TWILLIO DEPENDENT 
 * NOW SHIFTED TO *BIG_QUERY* called `getInvitesBottomLine` 
 */
// 
// const admin = require("firebase-admin");
// const db = admin.firestore();
// const util = require('../../../../utils/helpers.js');

// /**
//  * Fetches All the bottom lines
//  * 
//  * @param {boolean} isDaily - Whether to get the daily count
//  * @param {boolean} isWeekly - Whether to get the weekly count
//  * @param {boolean} isTotal - Whether to get the total count
//  * @returns {Promise<{dailyCount:string, weeklyCount:string, totalCount:String}} - A map containing the daily, weekly, and total counts.
//  */
// const getInviteBottomLines = async (isDaily = true, isWeekly = true, isTotal = true) => {
//     const data = {};
//     if(isDaily && isWeekly && isTotal) {
//         const promises = [];
//         if (isDaily) promises.push(__getDailyInvites())
//         if (isWeekly) promises.push(__getWeeklyInvites())
//         if (isTotal) promises.push(_getTotalInvites())
    
//         const results = await Promise.all(promises);
//         const [dailyCount, weeklyCount, totalCount] = results;
    
      
     
    
//       if (isDaily) data.dailyCount = dailyCount;
//       if (isWeekly) data.weeklyCount = weeklyCount;
//       if (isTotal) data.totalCount = totalCount;
//     }else{
//         if (isDaily) {
//             const dailyCount = await __getDailyInvites();
//             data.dailyCount = dailyCount;
//         }
    
//         if (isWeekly) {
//             const weeklyCount = await __getWeeklyInvites();
//             data.weeklyCount = weeklyCount;
//         }
    
//         if (isTotal) {
//             const totalCount = await _getTotalInvites();
//             data.totalCount = totalCount;
//         }
//     }

//     console.log("Invite Bottom Lines");
//     console.table(data); 

//   return data;
// }


// /// INVITES ///
// const _getTotalInvites = async () => {
//     return await __firestoreQueryInvitesCount();
// }
// const __getDailyInvites = async () => {
//     const startAndEndDate = util.getCurrentDayStartAndEndTime();
//     return await __firestoreQueryInvitesCount(startAndEndDate.start, startAndEndDate.end);
// }

// const __getWeeklyInvites = async () => {
//     const startAndEndDate = util.getCurrentWeekStartAndEndTime();
//     return await __firestoreQueryInvitesCount(startAndEndDate.start, startAndEndDate.end);
// }


// /**
//  * Fetches the total number of invites sent between the given start and end dates.
//  * 
//  * @param {Date?} start 
//  * @param {Date?} end 
//  * @returns  {Promise<Number>} total number of invites
//  */
// const __firestoreQueryInvitesCount = async (start, end) => { 
//     let query = db.collection('messages');
//     if (start && end) {
//         query = query.where('delivery.startTime', '>=', start).where('delivery.startTime', '<=', end);
//     }

//     const totalCount = await query.count().get();

//     return totalCount.data().count; 
// } 

module.exports = { 
    getInvitesBottomLine,
}