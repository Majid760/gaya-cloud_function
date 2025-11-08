const utils = require('../../../../functions/utils/helpers.js');
// const kFileName = 'latest_cc_messages.json';
const kFileName = 'last_2_weeks_decrypted_messages.json';
const kNewFileName = 'last_2_week_messages_new.json';
const {writeRawDataIntoGoogleSheet} = require('../analytics-sheet-services/analytics_sheet_services.js');
const CryptoJS = require('crypto-js');

const exportLastTwoWeeksMessagesToExcelSheet = (async () => {

    const allMessages = await loadFromLocal();
    console.log('allMessages:', allMessages.length);
    const filteredMessages = filterMessagesLastTwoWeeks(allMessages);
    // utils.makeFile(kNewFileName, filteredMessages);
    console.log('filteredMessages:', filteredMessages.length);

    let headerRow = ['Last 2 Weeks Messages'];

    let secondHeaderRow = ['Message id', 'Sender id', 'Receiver id', 'Chatroom id', 'Timestamp', 'Attachment url', 'Message content'];
    
    let finalRawData = [];

    // set header row in final sheet raw data
    finalRawData.push(headerRow);

    // set providers auth count in final sheet raw data
    finalRawData.push(secondHeaderRow);

    for (let i = 0; i < filteredMessages.length; i++) {

      let singleMessage = filteredMessages[i];

      // if message.length > 50000 then remove after 40000 from end
      if (singleMessage.message.length > 40000) {
        singleMessage.message = singleMessage.message.substring(0, 40000);
      }

      if(singleMessage.message == 'Attachment'){

        if(singleMessage.attachments.length > 0 && singleMessage.attachments[0].url != undefined){
          singleMessage.url = singleMessage.attachments[0].url || '';
        }
        else{
          singleMessage.url = '';
        }

        
        // if name = 'post' then add post title and post content
        if(singleMessage.attachments.length > 0 && singleMessage.attachments[0].name == 'post'){
          singleMessage.postId = singleMessage.postId || '';
          singleMessage.postTitle = singleMessage.title || '';
          singleMessage.postContent += singleMessage.content || '';
        }
        
        else{
          singleMessage.postId = '';
          singleMessage.postTitle = '';
          singleMessage.postContent = '';
        }


      }
      else{
        singleMessage.url = '';
        singleMessage.postId = '';
        singleMessage.postTitle = '';
        singleMessage.postContent = '';
      }

      let parentDataRow = [
        singleMessage._id,
        singleMessage.sender_id,
        singleMessage.recipient_id,
        singleMessage.chat_dialog_id,
        singleMessage.created_at,
        singleMessage.url,
        singleMessage.postId,
        singleMessage.postTitle,
        singleMessage.postContent,
        singleMessage.message,
      ];
      
      finalRawData.push(parentDataRow);

    }

    console.log("total parentDataRow are : " + finalRawData.length);

    console.log("1st message is : " + finalRawData[0]);


    console.log("Lst message is : " + finalRawData[finalRawData.length - 1]);

    console.table(finalRawData[finalRawData.length - 1]); 


    // write to google sheet
    const NEW_SHEET_ID = '14YVUuK9tG_sCuiDqVfID_2HLx9WYVn5X3uRtTmv_jrk';
    const sheetName = 'Last 2 Week Messages';
    const sheetId = NEW_SHEET_ID;
    const rangeStartingPoint = 'A3';
    
    await writeRawDataIntoGoogleSheet(finalRawData, sheetName, sheetId, rangeStartingPoint);

    console.log('Done');
});

function generateRandomIV() {
    const randomBytes = CryptoJS.lib.WordArray.random(16);
    return CryptoJS.enc.Base64.stringify(randomBytes);
  }


function encrypt(text, key, iv) {
    const cipherText = CryptoJS.AES.encrypt(text, key, { iv: iv }).toString();
    return cipherText;
  }
  
  function decrypt(encryptedText, key, iv) {
    const keyBytes = CryptoJS.enc.Utf8.parse(key);
    const ivBytes = CryptoJS.enc.Utf8.parse(iv);
    const encryptedBytes = CryptoJS.enc.Base64.parse(encryptedText);
  
    const decrypted = CryptoJS.AES.decrypt(
      { ciphertext: encryptedBytes },
      keyBytes,
      { iv: ivBytes, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
    );
  
    return decrypted.toString(CryptoJS.enc.Utf8);
  }

// function decrypt(encryptedText, key, iv) {
//     const keyBuffer = Buffer.from(key, 'utf-8');
//     const ivBuffer = Buffer.from(iv, 'utf-8');
//     const encryptedBuffer = Buffer.from(encryptedText, 'base64');
  
//     const decipher = crypto.createDecipheriv('aes-256-cbc', keyBuffer, ivBuffer);
//     let decrypted = decipher.update(encryptedBuffer, 'binary', 'utf-8');
//     decrypted += decipher.final('utf-8');
//     return decrypted;
//   }


function filterMessagesLastTwoWeeks(messages) {
    // Get the current date and time
    const currentDateTime = new Date();

    // Calculate the date two weeks ago
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(currentDateTime.getDate() - 14);

    // Filter messages with 'updated_at' from the last two weeks
    const filteredMessages = messages.filter(message => {
        const updatedAt = new Date(message.updated_at);
        return updatedAt >= twoWeeksAgo;
    });

    return filteredMessages;

    // // decript messages 
    // const decryptedMessages = filteredMessages.map(message => {
    //     const decryptedMessage = utils.decryptMessage(message);
    //     return decryptedMessage;
    // });

    // return decryptedMessages;
}

const loadFromLocal = async () => {

    const allMessages = utils.loadFile(kFileName);
    return allMessages;
}


module.exports = { exportLastTwoWeeksMessagesToExcelSheet}