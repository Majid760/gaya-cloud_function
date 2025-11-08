
const task = require('../tasks.js')
const cc = require('../../../../features/connecty-cube/connectycube_services.js')

const {Sender_Id, Sender_Cube_Id, Receiver_Id, Receiver_Cube_Id, Message, Girlz_Bestie_Bot_Message_Task, Girlz_Bestie_Bot_Message_Task_Data, GIRLZ_BOT_MESSAGE_TASK_TYPE} = require('../const.js');
const {DEFAULT_CUBE_ID, DEFAULT_FIREBASE_ID} = require('../../../../features/pubsub/love-message/helpers/const.js')
const {GirlzBotMessageTaskType} = require('../const.js');


const call = () => {
     handleEnqueue();
    // handleDequeue();
};

async function handleEnqueue() {
    const data = await getRecieverData();

    const user = data.user;
    const params = data.params;

    let senderId = user.user_id;
    let senderCubeId = user.cube_id;
    const message = params.message;
    const isDebug = params.isDebug;
    const attachment = params.attachment;

    console.log(`senderId: ${senderId}, message: ${message}, senderCubeId: ${senderCubeId}`);

    
    if(params.to_user_id != DEFAULT_FIREBASE_ID){
        console.log(`⚠️ Chatroom is not Default bot, skipping task. DEFAULT_FIREBASE_ID= ${DEFAULT_FIREBASE_ID}`);
        return;
    }

    if (!isDebug) {
        console.log(`🐞 Debug mode is disabled, skipping task.`);
        return;
    }
    else {
        console.log(`🐞 Debug mode is enabled, processing task.`);
    }

    if (message == 'Attachment' || message == 'attachment' || message == '' || attachment != 'text') {
        console.log(`⚠️ Attachment message, skipping task.`);
        return;
    }
    else {
        console.log(`⚠️ Text message is valid, processing task.`);
    }

    if (!senderCubeId) {
        /// Get User's CubeId from FirebaseId
        senderCubeId = await cc.getCubeIdByFirebaseId(senderId);
        if (!senderCubeId) {
            console.log(`⚠️ User ${senderId} doesnt have a cubeId`);
            return;
        }
    }
    
    task.enqueueGirlzBestieBotMessageTask({
        senderId: senderId,
        senderCubeId: senderCubeId,
        body: message,
    }
    );
}


async function handleDequeue() {

    const data = await getRecieverData();

    const payload = {
        senderId: data.user.user_id,
        body: params.message,
        senderCubeId: data.user.cube_id,
    };

    task.dequeueGirlzBestieBotMessageTask({
        [Girlz_Bestie_Bot_Message_Task_Data]: payload,
        [GIRLZ_BOT_MESSAGE_TASK_TYPE]: GirlzBotMessageTaskType.SEND_BOT_MESSAGE,
      },
    );
}

const getRecieverData = async () => {
    const recieverData = {
        'user': {
            'user_id': 'UEtPU8EJ1xe3wA3ZnJaP4Y5l6LY2',
            'cube_id': 11028790,
            // 'user_id': 'WpEcF5hiQ7alJnzOsqYOrNpRRym2',
            // 'cube_id': 11028805,
            // 'user_id': 'Kc3DsSdEmSTZhgI4jSMWOiXoF1K3',
            // 'cube_id': 11018439,
        },
        'params': {
            'message': 'Hey, How are you? is there any holyday plan?',
            'isDebug': true,
            'attachment': 'text',
            'dialog_id': '12365fqwwqed',
            'to_user_id': DEFAULT_FIREBASE_ID,
        } 
    };
    return recieverData;
}


module.exports = {
    call, 
    handleEnqueue
}