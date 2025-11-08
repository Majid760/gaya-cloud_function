
const enqueue = require('../services/love_message_taskHandler.js').enqueueLoveMessage;
const {USER_ID, LOVE_MESSAGE_CONTENT, LOVE_MESSAGE_SENDER_ID, LOVE_MESSAGE_TASK, LOVE_MESSAGE_TYPE, LoveMessageType} = require('../helpers/const.js');
 

const call = async ()=> {
    enqueue({
        USER_ID: 10877567,
        LOVE_MESSAGE_SENDER_ID:"NS3Uf39M3LSbsWldx4hW12XWqJ72", /// bot cubeId
        LOVE_MESSAGE_SENDER_CUBE_ID: 10721361, /// bot cubeId
        LOVE_MESSAGE_CONTENT: "HAAAAA!!!",
        LOVE_MESSAGE_TYPE: LoveMessageType.TEXT,

    })

}


module.exports = {
    call
}