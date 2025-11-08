const axios = require('./cc_axios_config.js');
// import fetch from 'node-fetch'
const fetch = require('node-fetch');
const { CC_ADMIN_API_KEY } = require('./../../../configs/api_keys.js');

/**
 * Retrieve the total number of messages sent within a specified date range.
 *
 * @param {number} startDate - The start date for the query in Unix timestamp format.
 * @param {number} endDate - The end date for the query in Unix timestamp format.
 * @returns {Promise<{ data: {total: number} }>} A Promise that resolves to the API response, which should be an object like {"total": 167}.
 */
function getSentMessagesTotal(startDate, endDate) {
  // Make a GET request to the '/admin/stats/messages/sent-total' endpoint
  // with query parameters for start_date and end_date
  return axios.get('/admin/stats/messages/sent-total', {
    params: {
      start_date: startDate,
      end_date: endDate,
    },
  });
}

/**
 * Retrieve the total number of messages sent per day within a specified date range.
 *
 * @param {number} startDate - The start date for the query in Unix timestamp format.
 * @param {number} endDate - The end date for the query in Unix timestamp format.
 * @returns {Promise<{ [date: string]: number }>} 
 *   A Promise that resolves to the API response, which should be an object where each key is a date (string) 
 *   and each value is the number of messages sent (number).
 */
function getMessagesSentPerDay(startDate, endDate) {
  // Make a GET request to the '/admin/stats/messages/sent-per-day' endpoint
  // with query parameters for start_date and end_date
  return axios.get('/admin/stats/messages/sent-per-day', {
    params: {
      start_date: startDate,
      end_date: endDate,
    },
  });
}


// get total chatrooms count from Connectycube
async function getCCTotalChatroomsCount() {

  const url = 'https://api.connectycube.com/admin/chat/list'
  const headers = { 'CB-Administration-API-Key': CC_ADMIN_API_KEY }

  const firstResponse = await fetch(`${url}`, { headers }).then(response => response.json())
  const { total_entries } = firstResponse;
  
  if(!total_entries) {
    return;
  }
  return total_entries;
}

async function getCCChatroomCountByDate(startDate, endDate) {
  const url = 'https://api.connectycube.com/admin/chat/list'
  const headers = { 'CB-Administration-API-Key': CC_ADMIN_API_KEY }
  const limit = 100

  console.log('startDate: ', startDate);
  if(!startDate) {
    return await getCCTotalChatroomsCount();
  }


  const firstResponse = await fetch(`${url}?created_at[gte]=${startDate}&sort_asc=created_at`, { headers }).then(response => response.json())
  const { total_entries, items } = firstResponse;
  
  if(!total_entries) {
    return;
  }

  console.log('Total Entries: ', total_entries);

  // as endDate added so incase of only start date the total entries will be returned else the loop will run to get chatrooms count between start and end date
  if(!endDate) {
    return total_entries;
  }

  /// new code to get chatrooms count between start and end date

  let allDialogs = []

  allDialogs = allDialogs.concat(items)

  const totalBatchesCount = Math.ceil(total_entries / limit)

  for (let i = 1; i < totalBatchesCount; ++i) {
    const lastRetrievedDialog = allDialogs.at(-1)
    const lastId = lastRetrievedDialog['_id']
    let dateObject = new Date(lastRetrievedDialog['created_at']);
    let lastMessageDate = dateObject.getTime() / 1000;


    // if the last message date is greater or equal than the start date and less than and equal to end date, then we need to stop the loop
    if (lastMessageDate < startDate || lastMessageDate > endDate) {
      continue;
    }
  
    const firstResponse = await fetch(`${url}?limit=${limit}&created_at[gte]=${startDate}&sort_asc=created_at&_id[gt]=${lastId}`, { headers }).then(response => response.json())
    const { items } = firstResponse

    // only add thos items which are between start and end date
    let validItems = [];
    for(let j = 0; j < items.length; ++j) {
      let dateObject = new Date(items[j]['created_at']);

      let messageDate = dateObject.getTime() / 1000;

      if(messageDate >= startDate && messageDate <= endDate) {
        validItems.push(items[j]);
      }
    }

    allDialogs = allDialogs.concat(validItems)
  }

  return allDialogs.length;
}

// get weekly connectycube dialogs (paginated form)
async function getWeeklyConnectycubeDialogsData(startDate, endDate) {
  try {
    const url = 'https://api.connectycube.com/admin/chat/list'
    const headers = { 'CB-Administration-API-Key': CC_ADMIN_API_KEY }
    const limit = 100

    let allDialogs = []

    const firstResponse = await fetch(`${url}?updated_at[gte]=${startDate}&updated_at[lte]=${endDate}&limit=${limit}`, { headers }).then(response => response.json())
    const { total_entries, items } = firstResponse


    allDialogs = allDialogs.concat(items)

    const totalBatchesCount = Math.ceil(total_entries / limit)

    console.log('total_entries: ', total_entries + " totalBatchesCount: " + totalBatchesCount);



    for (let i = 1; i < totalBatchesCount; ++i) {
      const lastRetrievedDialog = allDialogs.at(-1)
      const lastId = lastRetrievedDialog['_id']

      const firstResponse = await fetch(`${url}?limit=${limit}&_id[lt]=${lastId}`, { headers }).then(response => response.json())
      const { items } = firstResponse

      allDialogs = allDialogs.concat(items)
    }
    return allDialogs;

  }
  catch (_) {
    console.log("Error in getWeeklyConnectycubeDialogsData(): " + _)
  }

}

// get messages from start date to end date connectycube messages (paginated form)
async function getConnectycubeMessagesData(startDate, endDate) {
  try {

    const url = 'https://api.connectycube.com/admin/chat/messages/list'
    const headers = { 'CB-Administration-API-Key': CC_ADMIN_API_KEY }
    const limit = 100

    let allMessages = []

    const firstResponse = await fetch(`${url}?date_sent[lte]=${endDate}&date_sent[gte]=${startDate}&limit=${limit}&sort_asc=created_at`, { headers }).then(response => response.json())
    const { total_entries, items } = firstResponse
    console.log("total_entries: " + total_entries)
    
    allMessages = allMessages.concat(items)

    const totalBatchesCount = Math.ceil(total_entries / limit)
    console.log("totalBatchesCount: " + totalBatchesCount)

    for (let i = 1; i < totalBatchesCount; ++i) {
      let lastRetrievedMessage = allMessages.at(-1)
      let lastId = lastRetrievedMessage['_id'];

      let lastMessageDate = Date.parse(lastRetrievedMessage['date_sent'])/1000;
      
      // if the last message date is greater or equal than the start date and less than and equal to end date, then we need to stop the loop
      if (lastMessageDate < startDate || lastMessageDate > endDate) {
        continue;
      }

      let firstResponse = await fetch(`${url}?date_sent[lte]=${endDate}&date_sent[gte]=${startDate}&limit=${limit}&_id[gt]=${lastId}&sort_asc=created_at`, { headers }).then(response => response.json())
      let {total_entries, items } = firstResponse;

      allMessages = allMessages.concat(items);
    }

    console.log("Total allMessages are : " + allMessages.length)

    
    return allMessages;
  }
  catch (_) {
    console.log("Error in getAllConnectycubeMessages(): " + _);
  }

}

module.exports = {
  getSentMessagesTotal,
  getMessagesSentPerDay,
  getCCTotalChatroomsCount,
  getConnectycubeMessagesData,
  getWeeklyConnectycubeDialogsData,
  getCCChatroomCountByDate,
};