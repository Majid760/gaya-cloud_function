

const { LoveMessageType, LOVE_MESSAGE_TASK, USER_ID, LOVE_MESSAGE_CONTENT, LOVE_MESSAGE_TYPE, LOVE_MESSAGE_SENDER_ID, LOVE_MESSAGE_SENDER_CUBE_ID } = require('../helpers/const.js')
const { getFunctions } = require("firebase-admin/functions");
const { sendMessage } = require('../../../connecty-cube/connectycube_services.js')
// This function is called when a new task is added to the queue.

/**
 * 
 * @param {Object} data - Must Contain userId, messageContent, and type [LoveMessageType]
 * 
 * @example
 * {
 *  USER_ID: id,
 *  LOVE_MESSAGE_SENDER_ID: id,
 *  LOVE_MESSAGE_SENDER_CUBE_ID: CubeId,
 *  LOVE_MESSAGE_CONTENT: content,
 *  LOVE_MESSAGE_TYPE: LoveMessageType.TEXT
 *
 * 
 * }
 */
const enqueueLoveMessage = async (data) => {
    console.log(`Enqueueing Love Message Task... \n=> ${JSON.stringify(data)}`);

    const userId = data[USER_ID]; // receiver FirebaseId
    const senderId = data[LOVE_MESSAGE_SENDER_ID]; // sender FirebaseId
    const senderCubeId = data[LOVE_MESSAGE_SENDER_CUBE_ID]; // sender Cube Id
    const messageContent = data[LOVE_MESSAGE_CONTENT];  // message

    /// Default to text
     if(!data[LOVE_MESSAGE_TYPE]) data[LOVE_MESSAGE_TYPE] = LoveMessageType.TEXT;

    if (!userId || !messageContent || !senderId || !senderCubeId) {
        throw new Error(`Invalid Data, userId, senderId, messageContent, and type are required. Received: ${JSON.stringify(data) ?? data}`);
    }

    const queue = getFunctions().taskQueue(LOVE_MESSAGE_TASK);

    console.log(`enqueueLoveMessage for task ${data[LOVE_MESSAGE_TYPE]} for user ${userId}`);
    const scheduleDelaySeconds = 1;
    await queue.enqueue(
        data,
        {
            scheduleDelaySeconds, // 1 second
            dispatchDeadlineSeconds: 60 * 5 // 5 minutes
        },
    );

    return;

};


const dequeueLoveMessage = async (data) => {

    /// Unwrap keys
    const userId = data[USER_ID];
    const senderId = data[LOVE_MESSAGE_SENDER_ID];
    const senderCubeId = data[LOVE_MESSAGE_SENDER_CUBE_ID];
    const messageContent = data[LOVE_MESSAGE_CONTENT];
    const type = data[LOVE_MESSAGE_TYPE];

    if (!userId || !messageContent || !type) {
        logger.error(`🆘 Invalid Data, userId, messageContent, and type are required. Received: ${JSON.stringify(data) ?? data}`);
    }

    switch (type) {
        case LoveMessageType.TEXT:
            await __handleLoveMessageTask(senderCubeId,senderId, userId, messageContent);
            break;

        default:
            logger.error(`🆘 Invalid Task ${task}.`);
    }


}

const __handleLoveMessageTask = async (senderCubeId,senderId,receiverId, messageContent) => {

    await sendMessage(senderCubeId, senderId, receiverId, messageContent);

    console.log(`__handleLoveMessageTask Executed Succesfully ✅`);

    return;
}

module.exports = {
    dequeueLoveMessage,
    enqueueLoveMessage,
    LoveMessageType,
}