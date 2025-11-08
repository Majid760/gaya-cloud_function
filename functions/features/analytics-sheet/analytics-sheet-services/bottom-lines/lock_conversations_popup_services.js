const {getSingleDayTotalLockConversationLimitCount} = require('./../../big-query/queries/lock_conversation_limit_popup_from_gcp');

/**
 * Show total locked conversation popups count. 
 * Fetches from bigQuery
 * 
 * @returns {Promise<String>} - The total locked conversation popups count. 
 */
const getLockConversationLimitCount = async () => {
    let date = new Date();
    /// Doing it bcs bQ is 1 day behind
    date.setDate(date.getDate() - 1); /// Revert to 1 day
    console.log("---> Date is: " + date );

    let dataCount = await getSingleDayTotalLockConversationLimitCount(date);

    if(!dataCount) {
        return 0;
    }

    return dataCount || 0;
}


module.exports = {
    getLockConversationLimitCount
}

