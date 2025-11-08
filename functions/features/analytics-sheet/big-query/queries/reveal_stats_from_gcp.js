const { runBigQuery, TABLE_NAME } = require('./../big_query.js')


// /**
//  * Get the todays reveal stats . 
//  * 
//  * @param {Date} date
//  * @return {Map<string, string>} - Map of todays reveal stats .
//  */
const getDailyRevealStatsCount = async (date) => {
  // Get the start and end timestamps for the given date
  let { startOfDayTimestamp, endOfDayTimestamp } = __getTimestampsForStartAndEnd(date);

  const query = `
  SELECT
  event_name,
  COUNT(*) AS total_entries
FROM
  ${TABLE_NAME}
WHERE
  event_name IN ('accept_revealing_request', 'decline_revealing_request', 'send_revealing_request') AND
  TIMESTAMP_MICROS(event_timestamp) BETWEEN TIMESTAMP_MICROS(${startOfDayTimestamp}) AND TIMESTAMP_MICROS(${endOfDayTimestamp})
GROUP BY
  event_name
    `;

  const rows = await runBigQuery(query);

  // now find out all 3 reveal stats and also calculate the unknown or pending one by subtracting the accept_revealing_request and decline_revealing_request from send_revealing_request
  let revealStatsMap = {};

    let totalRevealRequests = 0;
    let totalRevealRequestsAccepted = 0;
    let totalRevealRequestsDeclined = 0;
    let totalRevealRequestsPending = 0;

    rows.forEach(event => {

        if(event.event_name === "send_revealing_request"){
            totalRevealRequests = event.total_entries;
        }
        if(event.event_name === "accept_revealing_request"){
            totalRevealRequestsAccepted = event.total_entries;
        }
        if(event.event_name === "decline_revealing_request"){
            totalRevealRequestsDeclined = event.total_entries;
        }
    }
    );

    totalRevealRequestsPending = totalRevealRequests - (totalRevealRequestsAccepted + totalRevealRequestsDeclined);

    revealStatsMap["totalRevealRequests"] = totalRevealRequests || 0;
    revealStatsMap["totalRevealRequestsAccepted"] = totalRevealRequestsAccepted || 0;
    revealStatsMap["totalRevealRequestsDeclined"] = totalRevealRequestsDeclined || 0;
    revealStatsMap["totalRevealRequestsPending"] = (totalRevealRequestsPending > 0) ?  totalRevealRequestsPending : 0;
    
  return revealStatsMap;


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
  getDailyRevealStatsCount
};