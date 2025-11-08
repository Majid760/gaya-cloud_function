const admin = require("firebase-admin");
const db = admin.firestore();
var { google } = require('googleapis');
const { GoogleAuth } = require('google-auth-library');
const DEFAULT_SHEET_ID = '11cXM4DM_eL6q_nOhlD-Rtna0OOm1xdxH6Rr8cJgnGPs';
const NEW_SHEET_ID = '14YVUuK9tG_sCuiDqVfID_2HLx9WYVn5X3uRtTmv_jrk';
const { ADMIN_CREDENTIAL, base_url_prod, apiKeyProd1 } = require('../../../configs/api_keys.js')
const axios = require("axios");
const fetch = require('node-fetch');

const { writeRawDataIntoGoogleSheet } = require('../analytics-sheet-services/analytics_sheet_services.js');
const { all } = require("axios");


// /**
//  *  @returns {Promise<array>} - Weekly new posts creations
//  */
const exportLastTwoWeeksPostsToExcelSheet = async () => {

  try {

    // Calculate the date two weeks ago
    let twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);


    const postsCollectionRef = db.collection('posts');

    // Retrieve all posts
    const allPosts = [];
    const postsSnapshot = await postsCollectionRef.where('createdAt', '>=', twoWeeksAgo).get();

    if (postsSnapshot.empty || postsSnapshot.docs.length < 0) return;

    // split users into chunks of 490
    const chunkedPosts = chunkArray(postsSnapshot.docs, 490);

    chunkedPosts.forEach(async (chunk) => {

      chunk.forEach((post) => {
        try {

          const postData = post.data();
          allPosts.push({
            id: post.id,
            ...postData,
          });

        } catch (_) {
          console.log("Error occured at exportLastTwoWeeksPostsToExcelSheet(): " + _);
        }
      });

    });

    console.log("total allPosts are : " + allPosts.length);

    let parentDataRow = [];

    for (let i = 0; i < allPosts.length; i++) {
      const singlePost = allPosts[i];

      let childDataRow = [
        singlePost.id,
        singlePost.author.uid,
        singlePost.author.name,
        singlePost.author.cubeId,
        singlePost.createdAt.toDate(),
        singlePost.title,
        singlePost.content
      ];

      parentDataRow.push(childDataRow);

    }

    console.log("total parentDataRow are : " + parentDataRow.length);

    console.log("1st postis : " + parentDataRow[0]);
    console.log("1st post is : " + JSON.stringify(parentDataRow[0]));


    const NEW_SHEET_ID = '14YVUuK9tG_sCuiDqVfID_2HLx9WYVn5X3uRtTmv_jrk';

    const sheetName = 'Last 2 Week Posts';
    const sheetId = NEW_SHEET_ID;
    const rangeStartingPoint = 'A3';



    await writeRawDataIntoGoogleSheet(parentDataRow, sheetName, sheetId, rangeStartingPoint);



  }
  catch (error) {
    console.log("error occured in exportLastTwoWeeksPostsToExcelSheet():" + error);
  }
}


// /**
//  *  @returns {Promise<array>} - Daily top 3000 posts with their responses
//  */
const makeAndUploadTodaysPostsRawDataForGoogleSheetFromFirestore = async (topPosts) => {

  try {

    //// create new sheet with todays date and top 10 posts data
    const formattedTodaysDate = getTodaysFormattedDate();

    const sheetName = `Daily Top 3000 Posts and Their Responses`;

    // await createNewSheetWithNewSheetName(sheetName);

    const topPostIds = topPosts.map(post => post.post_id);

    // get all posts by post ids
    let posts = await getPostsByIds(topPostIds);

    let matchingPost = topPosts.find(topPost => topPost.post_id === posts[0].id);

    if (posts.length <= 0) return;

    // iterate posts and add total answers and total messages on post
    posts.forEach(post => {
      // find out the post where topPostIds.key is equal to doc.id
      let matchingPost = topPosts.find(topPost => topPost.post_id == post.id);
      // now save topPost map value in post object total_answers field
      post.totalAnswers = matchingPost.count || 0;
      // console.log("post.totalAnswers is: " + post.totalAnswers);

      // find out the post total messages count by looking for dialog_count in topPosts
      const topPostDialog = topPosts.find(topPost => topPost.post_id == post.id);
      post.totalMessagesOnPost = topPostDialog.dialog_count;

      post.postId = post.id;
    });

    const postsWithoutNull = posts.filter(post => post !== null);

    // Sort the posts array in descending order based on totalAnswers
    const sortedPosts = postsWithoutNull.sort((a, b) => b.totalAnswers - a.totalAnswers);

    // slice posts array to 3000
    const allPosts = sortedPosts.slice(0, 3000);

    const titleHeader = [`Top 3000 Posts and Their Messages Info (${formattedTodaysDate})`, '', '', '', '', '', '', '', ''];

    const headerRow = [
      "Post Id",
      "No of People Answered",
      "Total Messages on Post",
      "Author Id",
      "Author Name",
      "Author Cube Id",
      "Created At",
      "Title",
      "Content"
    ];

    let parentDataRow = [];

    parentDataRow.push(titleHeader);

    parentDataRow.push(headerRow);

    for (let i = 0; i < allPosts.length; i++) {
      const singlePost = allPosts[i];

      // ignore if author field not exists
      if (!singlePost.author) {
        console.log("----> singlePost.author is null" + singlePost.postId);
        continue;
      }

      const authorId = singlePost.author.uid || '';

      if (authorId === '') {
        console.log("----> singlePost.author.uid is null" + singlePost.postId);
      }

      let childDataRow = [
        singlePost.postId,
        singlePost.totalMessagesOnPost || '',
        singlePost.totalAnswers,
        singlePost.author.uid || '',
        singlePost.author.name || '',
        singlePost.author.cubeId || '',
        singlePost.createdAt || '',
        singlePost.title,
        singlePost.content
      ];

      parentDataRow.push(childDataRow);
    }

    const rangeStartingPoint = 'A1';

    await writeRawDataIntoGoogleSheet(parentDataRow, sheetName,
      NEW_SHEET_ID,
      rangeStartingPoint);

  }
  catch (error) {
    console.log("error occured in exportLastTwoWeeksPostsToExcelSheet():" + error);
  }
}


// /**
//  *  @returns {Promise<array>} - make and upload Post answers density to sheet
//  */
const makeAndUploadTodaysAnswersOnPostsDensityRawDataForGoogleSheet = async () => {

  try {

    let todayDate = new Date();
    todayDate.setDate(todayDate.getDate() - 1);

    // finding todays date STARTING POINT AND ENDING POINT
    let todaysStartTime = todayDate.toISOString().split('T')[0] + 'T00:00:00.000Z';
    let todaysEndTime = todayDate.toISOString().split('T')[0] + 'T23:59:59.999Z';

    // save todays date in formatted form like this: Date/Month/Year
    const formattedTodaysDate = `${todayDate.getDate()}/${todayDate.getMonth() + 1}/${todayDate.getFullYear()}`;

    const result = await getPostsDensityAnswers(todaysStartTime, todaysEndTime);

    // save all keys and values in seperate arrays
    let keys = [];
    let values = [];

    for (let i = 0; i < Object.keys(result).length; i++) {
      let key = Object.keys(result)[i];
      let value = result[key];
      keys.push(key);
      values.push(value);
    }

    if (keys.length <= 0) return;

    const gRawData = __convertDailyAnswersOnPostsDensityIntoGoogleSheetRawData(formattedTodaysDate, keys, values);
    const sheetName = 'Density groups';

    console.log(`~ DAILY gRawData ~`);
    console.table(gRawData);

    /// Write daily reports into google sheet
    await addNewColumnToSheet(
      NEW_SHEET_ID,
      sheetName, gRawData, 'A30:Z40');

  }
  catch (error) {
    console.log("error occured in makeAndUploadTodaysAnswersOnPostsDensityRawDataForGoogleSheet():" + error);
  }
}

/**
 * Convert AnswersOnPostsDensity data into google sheet raw data.
 *  
 */
const __convertDailyAnswersOnPostsDensityIntoGoogleSheetRawData = (formattedTodaysDate, keys, values) => {


  // // Get the yesterday date as the header dd/mm/yyyy
  // const todayDate = getYesterdayDateAsDDMMYYYY();

  // Define the header row
  const titlesRow = [
    'Daily Answers on posts',
    ...keys
  ];

  // Create an array to store the column-based data for the sheet
  const columnBasedData = [
    titlesRow,
    [
      formattedTodaysDate,
      ...values
    ]
  ];
  return transposeTable(columnBasedData);
};

const transposeTable = (a) => a[0].map((_, c) => a.map((r) => r[c] === undefined ? '' : r[c] + ''))

/**
 * Add a new column to a Google Sheet and shift existing columns to the right.
 *
 * @param {string} sheetId - ID of the Google Sheet.
 * @param {string} sheetName - Name of the sheet where the new column should be added.
 * @param {number} columnIndex - Index of the new column (e.g., 1 for the first column). `Defaults to "1" = Col:B`.
 * @param {string[]} columnData - An array of data to be added to the new column.
 */
async function addNewColumnToSheet(sheetId, sheetName, columnData, startingRange, columnIndex = 1) {
  const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
  const { google } = require('googleapis');

  try {
    const auth = new GoogleAuth({
      // TODO(BADAR):Remove this key if pushing
      // keyFile: '/Volumes/dumb/girl-z-cloudfunctions/functions/girlz-dev-3233fb523984.json',
      scopes: SCOPES,
      credentials: ADMIN_CREDENTIAL,
    });
    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient });

    // Retrieve the current data in the specified sheet.
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `${sheetName}!A30:Z40` , //sheetName, // `${sheetName}!${startingRange}`, // sheetName,
    });

    const currentData = response.data.values || [];

    // Insert the new column at the specified index.
    currentData.forEach((row, rowIndex) => {
      row.splice(columnIndex, 0, columnData[rowIndex][1] || ''); // Insert a cell or empty string.

      // check if each row have more than 8 length then remove extra data from end side
      if (row.length > 8) {
        row.splice(8, row.length, '');
      }
    });
    /// If have data, update the sheet with the modified data.
    if (currentData.length > 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: `${sheetName}!A30:Z40`,
        valueInputOption: 'RAW',
        resource: { values: currentData },
      }).then((response) => {
        console.log('✅ Updated cells: ' + response.data.updatedCells);
      });
    } else {
      /// If no data, add a new column with the specified data. (Create as new)
      await writeRawDataIntoGoogleSheet(columnData, sheetName, sheetId, 'A30:Z40',
      // startingRange || 'A30'
      );
    }

  } catch (error) {
    console.error(JSON.stringify(error, null, 2));
  }
}

const getPostsByIds = async (postsIds) => {
  try {

    // POST request with the array in the request body
    const response = await fetch(`${base_url_prod}/api/analytics/posts?apiKey=${apiKeyProd1}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ids: postsIds,
      }),
    });

    // Parse the JSON response
    const responseData = await response.json();

    console.log(responseData.data.length);


    let allPosts = [];

    if (responseData.failed == false && responseData.data.length > 0) {
      console.log(`If case occured`);

      // iterate over each post and check if post is not valid or post.id is not valid then remove it from array
      responseData.data.forEach(post => {
        if (post == null || post.id == undefined) {
          console.log(`post is null or post.id is undefined`);
        } else {
          allPosts.push(post);
        }
      });

    }
    else {
      console.log(`Else case occured`);
    }

    console.log(`--> Posts length is: ${allPosts.length}`);

    return allPosts;
  } catch (error) {
    console.error(`Error fetching posts : ${error.message}`);
    return [];
  }
};

// get analytics of density answers on post
const getPostsDensityAnswers = async (todaysStartTime, todaysEndTime) => {
  try {

    const response = await fetch(`${base_url_prod}/api/analytics/density-groups/answers?apiKey=${apiKeyProd1}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        startDate: todaysStartTime,
        endDate: todaysEndTime,
      }),
    });

    // Parse the JSON response
    const responseData = await response.json();

    let results = {};

    if (responseData.failed == false && responseData.data) {
      console.log(`If case occured`);

      results = responseData.data;

    }
    else {
      console.log(`Else case occured`);
    }

    if (results['0 Answers'] == undefined) {
      results['0 Answers'] = 0;
    }
    if (results['1 Answer'] == undefined) {
      results['1 Answer'] = 0;
    }
    if (results['2 Answers'] == undefined) {
      results['2 Answers'] = 0;
    }
    if (results['3-7 Answers'] == undefined) {
      results['3-7 Answers'] = 0;
    }
    if (results['8-20 Answers'] == undefined) {
      results['8-20 Answers'] = 0;
    }
    if (results['21-50 Answers'] == undefined) {
      results['21-50 Answers'] = 0;
    }
    if (results['51-100 Answers'] == undefined) {
      results['51-100 Answers'] = 0;
    }
    if (results['101-200 Answers'] == undefined) {
      results['101-200 Answers'] = 0;
    }
    if (results['201+ Answers'] == undefined) {
      results['201+ Answers'] = 0;
    }

    return results;
  } catch (error) {
    console.error(`Error fetching posts answers density : ${error.message}`);
    return {};
  }
};


// function to return todays date
const getTodaysFormattedDate = () => {
  const date = new Date();
  // Doing it because BigQuery is 1 day behind
  date.setDate(date.getDate() - 1);

  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
  const year = date.getFullYear();

  const formattedDate = `${day}-${month}-${year}`;
  return formattedDate;
}



// split array into 240 chunks
const chunkArray = (array, size) => {
  const chunked_arr = [];
  let index = 0;
  while (index < array.length) {
    chunked_arr.push(array.slice(index, size + index));
    index += size;
  }
  return chunked_arr;
};

module.exports = {
  exportLastTwoWeeksPostsToExcelSheet,
  makeAndUploadTodaysPostsRawDataForGoogleSheetFromFirestore,
  makeAndUploadTodaysAnswersOnPostsDensityRawDataForGoogleSheet
}
