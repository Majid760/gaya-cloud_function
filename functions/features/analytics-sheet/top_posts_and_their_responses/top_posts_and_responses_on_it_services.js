const admin = require("firebase-admin");
const db = admin.firestore();
var { google } = require('googleapis');
const { GoogleAuth } = require('google-auth-library');
const DEFAULT_SHEET_ID = '11cXM4DM_eL6q_nOhlD-Rtna0OOm1xdxH6Rr8cJgnGPs';
const NEW_SHEET_ID = '14YVUuK9tG_sCuiDqVfID_2HLx9WYVn5X3uRtTmv_jrk';
const { ADMIN_CREDENTIAL } = require('../../../configs/api_keys.js')

const { getDailyResponsesOnPosts } = require('./services/post_responses_services.js');
const { getDailyTotalMessages } = require('./services/messages_on_post_services.js');
// const { getDailyTop10Posts } = require('./services/top_posts_services.js');

const { writeRawDataIntoGoogleSheet } = require('../analytics-sheet-services/analytics_sheet_services.js');
const { makeAndUploadTodaysPostsRawDataForGoogleSheetFromFirestore } = require('../exports/last_2_week_post.js');


/**
 * Get top 10 dailt posts, people responses on that post count and total no of messages on that post.
 */
const runTop10PostsAndTheirResponses = async () => {
  try {

    ////////////////////// get daily answer messages on Posts from GCP ///////////////////////////
    const responsesOnPostsData = await getDailyResponsesOnPosts();

    // utils.makeFile('topPosts.json', responsesOnPostsData);

    // Counter object to store counts for each post_id
    const postCounters = {};

    let inValidCount = 0;

    responsesOnPostsData.forEach(obj => {
      const post_id = obj.event_params.find(param => param.key === 'post_id');
      const dialog_id = obj.event_params.find(param => param.key === 'dialog_id');

      if(!post_id || !dialog_id){
        inValidCount++;
      }

      if (post_id && dialog_id) {
        const postIdValue = post_id.value.string_value;
        // postCounters[postIdValue] = (postCounters[postIdValue] || 0) + 1;
        postCounters[postIdValue] = {
          count: '',
          post_id: postIdValue,
          dialog_ids: 
          // check if dialog_ids is not undefined then push dialog_id.value.string_value to it else push dialog_id.value.string_value to new array
          (postCounters[postIdValue] && postCounters[postIdValue].dialog_ids) ? [...postCounters[postIdValue].dialog_ids, dialog_id.value.string_value] : [dialog_id.value.string_value],
          dialog_count: (postCounters[postIdValue] && postCounters[postIdValue].dialog_ids)  ? ((postCounters[postIdValue].dialog_ids.length || 0) + 1) : 1,
        };

      }
    });

    // console.log('---> inValidCount is:', inValidCount)

    // Convert postCounters object to an array
    const postCountArray = Object.values(postCounters);

    ///////////////////// get overall daily messages on Posts from GCP ///////////////////////////

    // Extract dialog_ids from postCounters
    const dialogIds = [];

    // Loop through postCounters and extract dialog_ids
    for (const postIdValue in postCounters) {
      if (postCounters.hasOwnProperty(postIdValue)) {
        const postCounter = postCounters[postIdValue];
        if (postCounter.dialog_ids) {
          dialogIds.push(...postCounter.dialog_ids);
        }
      }
    }


    // console.log('---> dialogIds length:', dialogIds.length);

    // remove null values from dialogIds
    const dialogIdsWithoutNull = dialogIds.filter(dialogId => dialogId !== null);

    // console.log('---> dialogIdsWithoutNull length:', dialogIdsWithoutNull.length);

    // dialogIdsWithoutNull have data
    if (dialogIdsWithoutNull.length > 0) {

      const totalMessagesData = await getDailyTotalMessages(dialogIdsWithoutNull);

      // utils.makeFile('dailyMessages.json', totalMessagesData);

      const dialogIdCounters = {};

      totalMessagesData.forEach(message => {
        const dialogIdParam = message.event_params.find(param => param.key === 'dialog_id');

        if (dialogIdParam) {
          let dialogId = dialogIdParam.value.string_value;
          dialogIdCounters[dialogId] = (dialogIdCounters[dialogId] || 0) + 1;
        }
      });

      // check postCountArray dialog_ids with dialogIdCounters dialog_id and add/increase post.count to postCountArray
      postCountArray.forEach(post => {
        if (post.dialog_ids) {
          post.dialog_ids.forEach(dialogId => {
            if (dialogIdCounters[dialogId]) {
              post.count = (post.count || 0) + (dialogIdCounters[dialogId] || 0);
            }
          });
        }
      });
    }
    else {
      console.log('---> dialogIdsWithoutNull.length is:', dialogIdsWithoutNull.length);
    }
    //////////////// ended get overall daily messages on Posts from GCP ///////////////////////////


    // Sort the array in descending order based on count
    const sortedPosts = postCountArray.sort((a, b) => b.count - a.count);

    // Get the top 3000 posts
    const top3000Posts = sortedPosts.slice(0, 3020);

    ///////////////////////// make and upload firestore top 10 posts to sheet ///////////////////////////
    await makeAndUploadTodaysPostsRawDataForGoogleSheetFromFirestore(top3000Posts)

  }
  catch (_) {
    console.log('error occured in runTop10PostsAndTheirResponses(): ', _);
  }

}




module.exports = {
  runTop10PostsAndTheirResponses

}
