const utils = require('./utils/helpers.js');
const kFileName = 'cc_messages.json';
const admin = require('firebase-admin');
const db = admin.firestore();

const runScriptToExportTop10UsersChats = async () => {
  const chatroomsMostMessageCount = {};

  const allMessages = await utils.loadFile(kFileName);
  console.log(`Loaded Messages : ${allMessages.length}`);

  for (const message of allMessages) {
    if (chatroomsMostMessageCount[message.sender_id] == undefined || chatroomsMostMessageCount[message.recipient_id] == undefined) {
      if (chatroomsMostMessageCount[message.sender_id] == undefined) {
        chatroomsMostMessageCount[message.sender_id] = 0;
      } else {
        chatroomsMostMessageCount[message.recipient_id] = 0
      }
    } else {

      chatroomsMostMessageCount[message.sender_id] += 1;
      chatroomsMostMessageCount[message.recipient_id] += 1;

    }
  }
  // const values = Object.values(chatroomsMostMessageCount);
  const sortByCount = (a, b) => {
    return b[1] - a[1];
  }

  const chatroomIdsSorted = Object.entries(chatroomsMostMessageCount).sort(sortByCount);

  // now get chats messages of top 31 users and save it in a file in json format like this  usersId: [MessageModel, MessageModel], UserId: [MessageModel, MessageModel]
  let top10Users = chatroomIdsSorted.slice(0, 31);

  // // now remove first one
  // top10Users.shift();

  const top10UsersMessages = {};
  for (const user of top10Users) {
    const userId = user[0];
    // const messages = allMessages.filter((message) => {
    //   return message.sender_id === Number(userId) || message.recipient_id === Number(userId);
    // });

    top10UsersMessages[userId] = {
      'UserId': userId,
      // 'TotalMessagesCount': messages.length || 0,
      // 'Messages': messages
    };
  }

  print('top10UsersMessages: ', top10UsersMessages);

  utils.makeFile('top30Users.json', top10UsersMessages);
};

const runScriptToExportUsersWhoNeverRespondedToReceivedMessages = async (chunkedUsers) => {
  const chatroomsMostMessageCount = {};
  const allMessages = await utils.loadFile(kFileName);
  console.log(`Loaded Messages : ${allMessages.length}`);

  for (const message of allMessages) {
    if (chatroomsMostMessageCount[message.sender_id] == undefined || chatroomsMostMessageCount[message.receiver_id] == undefined) {
      if (chatroomsMostMessageCount[message.sender_id] == undefined) {
        chatroomsMostMessageCount[message.sender_id] = 0;
      } else {
        chatroomsMostMessageCount[message.receiver_id] = 0
      }
    } else {

      chatroomsMostMessageCount[message.sender_id] += 1;
      chatroomsMostMessageCount[message.receiver_id] += 1;

    }
  }

  const sortByCount = (a, b) => {
    return b[1] - a[1];
  }

  const chatroomIdsSorted = Object.entries(chatroomsMostMessageCount).sort(sortByCount);

  let allUsers = [];
  // save all firestore users into firestoreUsers array
  chunkedUsers.forEach(async (chunk) => {

    chunk.forEach((user) => {
      try {

        const userData = user.data();
        allUsers.push({
          id: user.id,
          ...userData,
        });

      } catch (_) {
        console.log("Error occured at _getUnverifiedUsersCount(): " + _);
      }
    });

  });

  let usersWhoNeverRespondedToReceivedMessages = {};

  let usersWhoNeverRespondedToReceivedMessagesList = [];

  let notRespondedUsersCount = 0;

  console.log('allUsers[0].cubeId is: ', allUsers[0].cubeId);

  for (const user of allUsers) {
    const userId = user.cubeId;

    if (chatroomsMostMessageCount.hasOwnProperty(Number(userId)) && chatroomsMostMessageCount[Number(userId)] > 0) {
    } else {
      usersWhoNeverRespondedToReceivedMessagesList.push(user);
      notRespondedUsersCount += 1;
    }
  }

  usersWhoNeverRespondedToReceivedMessages['TotalUsersCountWhoNeverResponded'] = notRespondedUsersCount;
  usersWhoNeverRespondedToReceivedMessages['Users'] = usersWhoNeverRespondedToReceivedMessagesList;

  utils.makeFile('usersWhoNeverRespondedToReceivedMessages.json', usersWhoNeverRespondedToReceivedMessages);
};


const runScriptToExportTop100PostWithMostReactions = async () => {

  let totalPostMessages = [];

  const allMessages = await utils.loadFile(kFileName);

  for (const message of allMessages) {
    if (message.postId == undefined || message.postId == null) {
    } else {
      totalPostMessages.push(message);
    }
  }

  const postsWithMostMessageCount = {};

  for (const message of totalPostMessages) {
    if (postsWithMostMessageCount[message.postId] == undefined || postsWithMostMessageCount[message.postId] == null) {
      postsWithMostMessageCount[message.postId] = 0;
    } else {
      postsWithMostMessageCount[message.postId] += 1;
    }
  }

  const sortByCount = (a, b) => {
    return b[1] - a[1];
  }

  const postMessagesSorted = Object.entries(postsWithMostMessageCount).sort(sortByCount);

  // now get top 100 posts with most reactions
  let top100Posts = postMessagesSorted.slice(0, 100);

  let top100PostsData = {};

  for (const post of top100Posts) {
    let postId = post[0];
    let messagesOfSamePost = totalPostMessages.filter((postItem) => {
      return postItem.postId === postId;
    });

    let postAuthorId = '';
    let postAuthorName = '';
    let postTimesStamp = '';


    try {
      // Fetch the document
      let doc = await db.collection('posts').doc(postId).get();

      // check if postDoc exists and then get the data
      if (doc.exists) {
        // Document exists, and you can access its data
        let postData = doc.data();

        if (postData.createdAt != undefined && postData.createdAt != null) {
          postTimesStamp = postData.createdAt.toDate().toUTCString();
        }
        else {
          postTimesStamp = 'NAN';
        }
        if (postData.author.name != undefined && postData.author.name != null) {
          postAuthorName = postData.author.name;
        }
        else {
          postAuthorName = 'NAN';
        }
        if (postData.author.uid != undefined && postData.author.uid != null) {
          postAuthorId = postData.author.uid;
        }
        else {
          postAuthorId = 'NAN';
        }

      } else {
        console.log('No such document!' + postId);
        postAuthorId = 'Post Deleted';
        postAuthorName = 'Post Deleted';
        postTimesStamp = 'Post Deleted';
      }
    }
    catch (_) {
      console.error('Error getting document:', _);
      postAuthorId = '';
      postAuthorName = '';
      postTimesStamp = '';
    }




    top100PostsData[postId] = {
      'postId': postId,
      'postAuthorId': postAuthorId,
      'postAuthorName': postAuthorName,
      'postTimesStamp': postTimesStamp,
      'TotalMessagesCount': messagesOfSamePost.length || 0,
      'messages': messagesOfSamePost
    };
  }

  console.log('top100PostsData: ', top100PostsData);

  utils.makeFile('postsWithMostReactions.json', top100PostsData);
};


module.exports = { runScriptToExportTop10UsersChats, runScriptToExportUsersWhoNeverRespondedToReceivedMessages, runScriptToExportTop100PostWithMostReactions };