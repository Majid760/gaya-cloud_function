const { getSentMessagesTotal, getMessagesSentPerDay } = require('./messages_services.js');
const { createCohortAnalysis } = require('./cohort_analysis.js');


const call = async () => {


   const todayDate = new Date();

   const startDate = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate() - 7).getTime() / 1000;
   const endDate = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate()).getTime() / 1000;
   console.log("todayDate: " + todayDate + " startDate: " + startDate + " endDate: " + endDate );

   const total = await getSentMessagesTotal(startDate, endDate);
   console.log('total: ', total);

   const perDay = await getMessagesSentPerDay(startDate, endDate);
   Object.keys(perDay).forEach((key) => {
      console.log(`Date: ${key} => `, perDay[key]);
   });

}

const cohortAnalysis = async () => {
   const todayDate = new Date();
   const startDate = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate() - 7).getTime() / 1000;
   const endDate = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate()).getTime() / 1000;
   const spreadsheetId = '11cXM4DM_eL6q_nOhlD-Rtna0OOm1xdxH6Rr8cJgnGPs';
   const sheetName = 'Testing';
   const rangeStartingPoint = 'A40';

   // console.log("todayDate: " + todayDate + " startDate: " + startDate + " endDate: " + endDate );


   createCohortAnalysis(startDate, endDate, spreadsheetId, sheetName, rangeStartingPoint)
      .then(() => {
         console.log('Cohort analysis data written to Google Sheet.');
      })
      .catch((error) => {
         console.error('Error:', error);
      });
}

// module.exports = cohortAnalysis;
module.exports = {
   cohortAnalysis,
   call,
}