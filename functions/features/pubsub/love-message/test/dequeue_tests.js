

const dequeue = require('../services/love_message_taskHandler.js').dequeueLoveMessage;
const {USER_ID, LOVE_MESSAGE_CONTENT, LOVE_MESSAGE_SENDER_ID, LOVE_MESSAGE_TASK, LOVE_MESSAGE_TYPE, LoveMessageType} = require('../helpers/const.js');
 

const call = async ()=> {
    // const userId = data[USER_ID];
    // const senderId = data[LOVE_MESSAGE_SENDER_ID];
    // const senderCubeId = data[LOVE_MESSAGE_SENDER_CUBE_ID];
    // const messageContent = data[LOVE_MESSAGE_CONTENT];
    // const type = data[LOVE_MESSAGE_TYPE];

    // const receiverId =  10877567;
    // const senderFirebaseId =  "NS3Uf39M3LSbsWldx4hW12XWqJ72"; /// bot firebaseId
    // const senderCubeId =  10721361; /// bot cubeId
    // const Content =  "I love real people!";
    // cc.sendMessage(senderCubeId, senderFirebaseId, receiverId, Content);


    const data = {
        USER_ID: 10877567,
        LOVE_MESSAGE_SENDER_ID:"NS3Uf39M3LSbsWldx4hW12XWqJ72", /// bot cubeId
        LOVE_MESSAGE_SENDER_CUBE_ID: 10721361, /// bot cubeId
        LOVE_MESSAGE_CONTENT: "HAAAAA!!!",
        LOVE_MESSAGE_TYPE: LoveMessageType.TEXT,

    }

    dequeue(data);
    
}


 
module.exports = {
    call
}