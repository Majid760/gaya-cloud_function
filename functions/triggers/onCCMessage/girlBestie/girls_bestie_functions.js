const cc = require('../../../features/connecty-cube/connectycube_services.js')
const { enqueueGirlzBestieBotMessageTask } = require('./tasks.js')
const {DEFAULT_FIREBASE_ID} = require('../../../features/pubsub/love-message/helpers/const.js')

 
/**
 * HTTPS for girlz bestie bot message
 * 
 * @param {Request} req - Request object
 * @param {Response} res - Response object
 * 
 * @returns {Promise<void>} - Promise that resolves when the response is sent
 */

const girlzBestieBotMessage = async (req, res) => {

    try {

        /// extract input fields from request body
        const user = req.user;
        const params = req.params;
            
        let senderId = user.user_id;
        let senderCubeId = user.cube_id;
        const message = params.message;
        const isDebug = params.isDebug;
        const attachment = params.attachment;
        
        // dialog id
        // const dialogId = event.dialog_id;
    
        if(params.to_user_id != DEFAULT_FIREBASE_ID){
            console.log(`⚠️ Chatroom is not Default bot, skipping task. DEFAULT_FIREBASE_ID= ${DEFAULT_FIREBASE_ID} and to_user_id: ${params.to_user_id}`);
            return { statusCode: 200, message: `⚠️ Chatroom is not Default bot, skipping task. DEFAULT_FIREBASE_ID= ${DEFAULT_FIREBASE_ID}`,};

        }
    
        if (!isDebug) {
            console.log(`🐞 Debug mode is disabled, skipping task. isDebug: ${isDebug}`);
            return { statusCode: 200, message: `🐞 Debug mode is disabled, skipping task. isDebug: ${isDebug}`,};

        }
        else {
            console.log(`🐞 Debug mode is enabled, processing task.`);
        }
    
        if (message == 'Attachment' || message == 'attachment' || message == '' || attachment != 'text') {
            console.log(`⚠️ Attachment message, skipping task.`);
        return { statusCode: 200, message: `⚠️ Attachment message, skipping task.`,};
            
        }
        else {
            console.log(`⚠️ Text message is valid, processing task.`);
        }
    
        if (!senderCubeId) {
            /// Get User's CubeId from FirebaseId
            senderCubeId = await cc.getCubeIdByFirebaseId(senderId);
            if (!senderCubeId) {
                console.log(`⚠️ User ${senderId} doesnt have a cubeId`);
        return { statusCode: 200, message: `⚠️ User ${senderId} doesnt have a cubeId`,};
            }
        }
    
        /// Enqueue task to send bot message reply
        await enqueueGirlzBestieBotMessageTask({
            senderId: senderId,
            senderCubeId: senderCubeId,
            body: message,
        });

        return { statusCode: 200, message: `send_message event responded successfully.`,};

    } catch (err) {
        console.log(err);
        return { statusCode: 400, message: JSON.stringify(err) };
    }

};


module.exports = { 
    girlzBestieBotMessage
}