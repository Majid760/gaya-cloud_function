const { getMessagesSentPerDay } = require('./messages_services.js');
const { writeRawDataIntoGoogleSheet } = require('../analytics-sheet-services/analytics_sheet_services.js');

async function createCohortAnalysis(startDate, endDate, spreadsheetId, sheetName, rangeStartingPoint) {
  // Step 1: Retrieve daily message counts
  const dailyMessageCounts = await getMessagesSentPerDay(startDate, endDate);

  console.log("==> dailyMessageCounts: " + JSON.stringify(dailyMessageCounts) );

  // Step 2: Transform daily counts into weekly counts
  const weeklyMessageCounts = transformToWeekly(dailyMessageCounts);
  console.log("==> weeklyMessageCounts: " + JSON.stringify(weeklyMessageCounts) );
  
  // Step 3: Present data and visualize

  // Step 4: Write data to Google Sheet
  await writeRawDataIntoGoogleSheet(weeklyMessageCounts, sheetName, spreadsheetId, rangeStartingPoint);
}

/**
 * Transform daily message counts into weekly counts.
 *
 * @param {Object} dailyMessageCounts - Object with daily message counts (e.g., { "2023-02-20": 56, "2023-02-21": 78, ... }).
 * @returns {Object} Object with weekly message counts (e.g., { "Week 1": 250, "Week 2": 300, ... }).
 */
function transformToWeekly(dailyMessageCounts) {
    const weeklyMessageCounts = {};
  
    // Iterate through the daily counts and group them by week
    for (const date in dailyMessageCounts) {
      if (dailyMessageCounts.hasOwnProperty(date)) {
        const dailyCount = dailyMessageCounts[date];
        const weekNumber = 0;
  
        if (!weeklyMessageCounts[`Week ${weekNumber}`]) {
          weeklyMessageCounts[`Week ${weekNumber}`] = 0;
        }
  
        // Add the daily count to the corresponding week's total
        weeklyMessageCounts[`Week ${weekNumber}`] += dailyCount;
      }
    }
  
    return weeklyMessageCounts;
  }
  module.exports = {
    createCohortAnalysis, 

}
//   function getWeekNumber(date) {
//     // Copy the date object to avoid modifying the original date
//     date = new Date(date);
  
//     // Set to Monday (0 = Sunday, 1 = Monday, etc.)
//     date.setUTCDate(date.getUTCDate() - (date.getUTCDay() + 6) % 7);
  
//     // Find the Thursday in this week (ISO week starts on Monday)
//     date.setUTCDate(date.getUTCDate() + 3);
  
//     // Calculate the week number
//     const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
//     return 1 + Math.ceil((date - yearStart) / 604800000); // 604800000 = 7 * 24 * 60 * 60 * 1000
//   }

//   function calculateWeekNumber(date) {
//     console.log('date: ', date);
//     // Calculate the number of milliseconds between the given date and the starting date (e.g., September 29, 2023)
//     const millisecondsDiff = date - new Date(2023, 10, 13); // September is month 8 (0-based index)
  
//     // Calculate the week number based on the milliseconds difference
//     const millisecondsInAWeek = 7 * 24 * 60 * 60 * 1000;
//     return Math.floor(millisecondsDiff / millisecondsInAWeek) + 1;
//   }


  
 