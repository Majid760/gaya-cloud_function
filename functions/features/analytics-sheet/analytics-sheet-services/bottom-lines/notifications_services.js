const {getSingleDayTotalReceivedNotifications, getSingleDayTotalOpenedNotifications} = require('./../../big-query/queries/total_received_opened_notifications.js');

/**
 * Show total notifications received / opened. 
 * Fetches from bigQuery
 * 
 * @returns {Promise<String>} - The total no of notifications received / opened. 
 */
const getDailyTotalReceivedNotifications = async () => {
    const date = new Date();
    /// Doing it bcs bQ is 1 day behind
    date.setDate(date.getDate() - 1); /// Revert to 1 day
    console.log("---> Date is: " + date );

    const totalNotificationsReceived = await getSingleDayTotalReceivedNotifications(date);

    if(!totalNotificationsReceived) {
        return 0;
    }

    console.log("Total Notifications Received" + `${totalNotificationsReceived || 0}`);

    return totalNotificationsReceived || 0;
}

/**
 * Show total notifications received / opened. 
 * Fetches from bigQuery
 * 
 * @returns {Promise<String>} - The total no of notifications received / opened. 
 */
const getDailyTotalOpenedNotifications = async () => {
    const date = new Date();
    /// Doing it bcs bQ is 1 day behind
    date.setDate(date.getDate() - 1); /// Revert to 1 day
    console.log("---> Date is: " + date );

    const totalNotificationsOpened = await getSingleDayTotalOpenedNotifications(date);

    if(!totalNotificationsOpened ) {
        return 0;
    }

    console.log("Total Notifications Opened: " + `${totalNotificationsOpened || 0}`);

    return totalNotificationsOpened || 0;
}


module.exports = {
    getDailyTotalReceivedNotifications,
    getDailyTotalOpenedNotifications
}

