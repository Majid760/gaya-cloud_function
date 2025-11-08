const { runBigQuery, TABLE_NAME } = require('./../big_query.js')

/**
 * Get the todays total purchases count. 
 * 
 * @param {Date} date
 * @return {Promise<number>} - The todays total purchases count. 
 */
const getSingleDayTotalPurchasesCount = async (date) => {
  // Get the start and end timestamps for the given date
  let { startOfDayTimestamp, endOfDayTimestamp } = __getTimestampsForStartAndEnd(date);

  // // query to get all possible payment popup events
  // const query = `
  // SELECT
  //   *
  // FROM
  //   ${TABLE_NAME}
  // WHERE
  //   event_name = 'popup_payment' AND
  //   TIMESTAMP_MICROS(event_timestamp) BETWEEN TIMESTAMP_MICROS(${startOfDayTimestamp}) AND TIMESTAMP_MICROS(${endOfDayTimestamp})
  // `;

  const query = `
  SELECT
    COUNT(DISTINCT user_id) AS unique_users_count
  FROM
    ${TABLE_NAME}
  WHERE
    event_name = 'rc_purchase_success' AND
    TIMESTAMP_MICROS(event_timestamp) BETWEEN TIMESTAMP_MICROS(${startOfDayTimestamp}) AND TIMESTAMP_MICROS(${endOfDayTimestamp})
  `;

  const rows = await runBigQuery(query);

  // // Assuming 'results' is the array of events fetched from the database
  // let fromCounts = {};

  // fromCounts['totalPurchases'] = rows.length;

  // rows.forEach(event => {
  //   // Extract the event_params, which should be an array of key-value pairs
  //   const params = event.event_params;

  //   // Find the 'from' parameter
  //   const fromParam = params.find(param => param.key === 'from');
  //   const fromValue = fromParam ? fromParam.value.string_value : 'unknown'; // Adjust this according to your data structure

  //   // Increment the count for this 'from' value
  //   if (!fromCounts[fromValue]) {
  //     fromCounts[fromValue] = 0;
  //   }
  //   fromCounts[fromValue] += 1;
  // });

  // console.log('Counts of each type of "from" value:', fromCounts);

  //   return;

  let dataCount = 0;
  // Process the result
  if (rows.length > 0) {
    const { unique_users_count } = rows[0];
    dataCount = unique_users_count;
    console.log(`Total Unique Users Count: ${unique_users_count}`);
  } else {
    dataCount = 0;
    console.log('No data found for the specified conditions.');
  }
  return dataCount;

}

// /**
//  * Get the todays purchases and all possible use cases. 
//  * 
//  * @param {Date} date
//  * @return {Map<string, string>} - Map of purchases by types. 
//  */
const getDailyPurchasesCount = async (date) => {
  // Get the start and end timestamps for the given date
  let { startOfDayTimestamp, endOfDayTimestamp } = __getTimestampsForStartAndEnd(date);

  const query = `
    SELECT
      *
    FROM
      ${TABLE_NAME}
    WHERE
      event_name = 'rc_purchase_success' AND
      TIMESTAMP_MICROS(event_timestamp) BETWEEN TIMESTAMP_MICROS(${startOfDayTimestamp}) AND TIMESTAMP_MICROS(${endOfDayTimestamp})
    `;

  const rows = await runBigQuery(query);

  // Assuming 'results' is the array of events fetched from the database
  let fromCounts = {};

  fromCounts['totalPurchases'] = rows.length;

  rows.forEach(event => {
    // Extract the event_params, which should be an array of key-value pairs
    const params = event.event_params;

    // Find the 'from' parameter
    const fromParam = params.find(param => param.key === 'purchased_from');
    const fromValue = fromParam ? fromParam.value.string_value : 'unknown'; // Adjust this according to your data structure

    // Increment the count for this 'from' value
    if (!fromCounts[fromValue]) {
      fromCounts[fromValue] = 0;
    }
    fromCounts[fromValue] += 1;
  });

  let allPossiblePurchases = ["totalPurchases", "NotificationNavigationService", "HomeScreen", "AlreadyChattedUserWidget", "InviteFriendsUnlimitedChatsLimitation", "Restore_Purchase_AppSetting"];

  allPossiblePurchases.forEach((purchaseType) => {
    if (!fromCounts[purchaseType]) {
      fromCounts[purchaseType] = 0;
    }
  });
  
  // make new modified map fromCounts
  let purchaseCountsMap = {}; 

  purchaseCountsMap["totalPurchases"] = fromCounts["totalPurchases"] || 0;
  purchaseCountsMap["notificationPurchase"] = fromCounts["NotificationNavigationService"] || 0;
  purchaseCountsMap["homeScreenPurchase"] = fromCounts["HomeScreen"] || 0;
  purchaseCountsMap["conversationPurchase"] = fromCounts["AlreadyChattedUserWidget"] || 0;
  purchaseCountsMap["inviteFriendsPurchase"] = fromCounts["InviteFriendsUnlimitedChatsLimitation"] || 0;
  purchaseCountsMap["restorePurchase"] = fromCounts["Restore_Purchase_AppSetting"] || 0;

  return purchaseCountsMap;
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
  getSingleDayTotalPurchasesCount,
  getDailyPurchasesCount
};