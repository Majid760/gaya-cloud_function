const { makeAndUploadTodaysAnswersOnPostsDensityRawDataForGoogleSheet } = require('../exports/last_2_week_post.js');

/**
 * Get Answers density on post.
 */
const runAnswersOnPostsDensity = async () => {
  try {

    ///////////////////////// make and upload Post answers density to sheet ///////////////////////////
    await makeAndUploadTodaysAnswersOnPostsDensityRawDataForGoogleSheet()

  }
  catch (_) {
    console.log('error occured in runTop10PostsAndTheirResponses(): ', _);
  }

}




module.exports = {
    runAnswersOnPostsDensity
}
