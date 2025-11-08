const { runBigQuery, TABLE_NAME } = require('../big_query.js')
const fs = require('fs');
const utils = require('../../../../utils/helpers.js');

const getWeeklyMessagesDataFromGcp = async (startDate, endDate) => {  
  console.time('getWeeklyMessagesDataFromGcp');

  const query = `
    SELECT
      MAX(IF(param.key = 'to_cube_id', param.value.string_value, NULL)) AS cubeId,
      event_timestamp as sentAt,
    FROM
    ${TABLE_NAME}
    CROSS JOIN UNNEST(event_params) AS param
    WHERE
      event_name = 'send_message' AND
      event_timestamp >= ${startDate * 1000} AND event_timestamp <= ${endDate * 1000}
    GROUP BY
      event_timestamp
    ORDER BY
      event_timestamp DESC
  `;



  const rows = await runBigQuery(query);
  console.timeEnd('getWeeklyMessagesDataFromGcp');

  // writeToFile(rows);
  // console.log(rows)
  return rows;

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


const writeToFile = (data) => {
  const fileName = 'data.json';
  const filePath = `./${fileName}`;
  const fileData = JSON.stringify(data, null, 2);
  fs.writeFileSync(filePath, fileData);
  console.log(`Data written to file: ${filePath}`);
}
module.exports = {
  getWeeklyMessagesDataFromGcp
}