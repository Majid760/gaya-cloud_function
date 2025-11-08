
const task = require('../no_reply_notification_task.js')
const { NoReplyNotificationTaskType } = require('../consts/no_reply_task_types.js')

const { POST_ID} = require('../consts/no_reply_fields.js')
const admin = require("firebase-admin");
const db = admin.firestore();
const call = () => {
    // const {fetchRandom10PercentPeople} = require('./../../common/notification_services.js')
    // fetchRandom10PercentPeople();
    handleDequeue();
};

let postId = "g7JZRA89tKCthLqMioPu";

async function handleEnqueue() {
    const post = await getMyPostData();
    const payload = {
        postId: postId,
        title: post.title,
        body: post.content,
        authorUid: post.author.uid,
    }
    
    task.enqueuePostTask(postId, {
        [DIALOG_ID]: postId,
        [CCNOTIFICATION_TASK_DATA]: payload,
        [CCNOTIFICATION_TASK_TYPE]: CCNotificationTaskType.SEND_NOTIFICATION_FIRST_MESSAGE,
      },
    );
}


async function handleDequeue() {
    const post = await getMyPostData();
    const payload = {
        postId: postId,
        title: post.author.name,
        body: post.content || post.title,
        authorUid: post.author.uid,
    };
    task.dequeuePostTask({
        [POST_ID]: postId,
        [POST_TASK_DATA]: payload,
        [POST_TASK_TYPE]: PostTaskType.SEND_NOTIFICATION_10_PERCENT,
      },
    );
}

const getMyPostData = async () => {

    const post = await db.collection('posts').where('region', '==', 'NY').limit(1).get();
    console.log(`Post: ${JSON.stringify(post.docs[0].data())}`);
    postId = post.docs[0].id;
    return post.docs[0].data();
}


module.exports = {
    call, 
}