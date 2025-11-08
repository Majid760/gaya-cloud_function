const { Sender_Id, Sender_Cube_Id, Receiver_Id, Receiver_Cube_Id, Message, Girlz_Bestie_Bot_Message_Task, Girlz_Bestie_Bot_Message_Task_Data, GIRLZ_BOT_MESSAGE_TASK_TYPE } = require('./const.js');
const { getFunctions } = require("firebase-admin/functions");
const { generateGirlzBestieBotMessage } = require('../../../common/gpt-services/gpt.js')
const { sendMessage } = require('../../../features/connecty-cube/connectycube_services.js');
const { DEFAULT_CUBE_ID, DEFAULT_FIREBASE_ID, getEnvirnomentBasedDefaultCubeId, getEnvirnomentBasedDefaultFirebaseId } = require('../../../features/pubsub/love-message/helpers/const.js')
const { GirlzBotMessageTaskType } = require('./const.js');
const { welcomeToAppOnboardingMessage } = require('../../../configs/consts.js')
const userService = require('./../../../common/user_services.js')
/**
 * 
 * @param {Object} taskData - The task data 
 * @returns void
 */
const enqueueGirlzBestieBotMessageTask = async (taskData, taskType = GirlzBotMessageTaskType.SEND_BOT_MESSAGE) => {

    if (!taskData || !taskType) {
        throw new Error(`Invalid Data and taskType are required. Received: ${JSON.stringify(taskData) ?? taskData}`);
    }

    const queue = getFunctions().taskQueue(Girlz_Bestie_Bot_Message_Task);

    console.log(`girlzBestieBotMessageTask called. >>, taskType:  `, taskType);
    let scheduleDelaySeconds = 1; // 1 seconds
    if (taskType === GirlzBotMessageTaskType.SEND_ONBOARDING_MESSAGE) {
        scheduleDelaySeconds = 45; // 45 seconds
    }
    await queue.enqueue(
        {
            [Girlz_Bestie_Bot_Message_Task_Data]: taskData,
            [GIRLZ_BOT_MESSAGE_TASK_TYPE]: taskType,
        },
        {
            scheduleDelaySeconds,
            dispatchDeadlineSeconds: 60 * 5 // 5 minutes
        },
    );

    return;

};

/**
 * 
 * @param {Object} data - Must Contain taskData
 *  
 */
const dequeueGirlzBestieBotMessageTask = async (data) => {

    /// Unwrap keys
    const taskData = data[Girlz_Bestie_Bot_Message_Task_Data];
    const taskType = data[GIRLZ_BOT_MESSAGE_TASK_TYPE];
    console.log(`taskData: ${JSON.stringify(taskData)} < > taskType: ${taskType}`);


    if (!taskData || !taskType) {
        console.log(`🆘 Invalid Data, taskData is required. Received: ${JSON.stringify(data) ?? data}`);
        return;
    }

    switch (taskType) {
        case GirlzBotMessageTaskType.SEND_BOT_MESSAGE:
            await __handleSendBotMessage(taskData);
            break;
        case GirlzBotMessageTaskType.SEND_ONBOARDING_MESSAGE:
            // Unwrapping data (receiverId, receiverCubeId, body)
            await __handleOnBoardingMessage(taskData);
            break;

        default:
            logger.error(`🆘 Invalid Task ${task}.`);
    }

}



///                     
///
/// PRIVATE FUNCTIONS
///
///


const __handleSendBotMessage = async (taskData) => {

    // console.log(`senderId: ${taskData.senderId}, body: ${taskData.body}, senderCubeId: ${taskData.senderCubeId}`);
    // console.log(" typeof senderCubeId: " + typeof senderCubeId);
    const { senderId, senderCubeId, body } = taskData;
    if (!senderId || !senderCubeId || !body) throw new Error(`Invalid Data, senderId, body, and senderCubeId are required. Received: ${JSON.stringify(taskData) ?? taskData}`);

    console.log(`__handleSendBotMessage for Message: ${body}`);

    // get ChatGpt response for body
    const message = await generateGirlzBestieBotMessage(body);


    if (!message) {
        console.log(`⚠️ Could not generate love message for user ${senderId}`);
        return;
    }
    else {
        console.log(`✅ ChatGpt Generated message is: ${message}`);
    }

    console.log(`Sending love message to user ${senderId} with message: ${message}`);

    await sendMessage(DEFAULT_CUBE_ID, DEFAULT_FIREBASE_ID, senderCubeId, message);

    console.log(`__handleSendBotMessage Executed Succesfully ✅`);

    return;
}

/**
 * 
 * @param {<{string: receiverId, string: receiverCubeId}>} taskData 
 */
const __handleOnBoardingMessage = async (taskData) => {

    console.log(`___HandleOnBoardingMessage, taskData: ${JSON.stringify(taskData) ?? taskData}`);
    console.log(`senderId: ${taskData.receiverId}, body: ${taskData.body}, senderCubeId: ${taskData.receiverCubeId}`);
 
    let { receiverId, receiverCubeId, body } = taskData;
    if (!receiverId || !receiverCubeId){ 
        throw new Error(`Invalid Data, senderId, body, and senderCubeId are required. TASK DATA: ${JSON.stringify(taskData) ?? taskData}`);
    }
    /// get user profile data
    const receiverProfileData = await userService.getUserById(receiverId);

    /// Send onboarding to those who have not received it yet (shouldSendOnBoardingMessage = true)
    /// `workaround`: To skip those who doesnt have onboarding functionality (local button in girlzBestieBot) yet
    ///
    /// This will ensure that we dont send onboarding msg that doesnt have onboarding functionality yet
    if(receiverProfileData.data().shouldSendOnBoardingMessage){
        const receiverName = receiverProfileData.data().name;
        body = welcomeToAppOnboardingMessage(receiverName); 
        console.log(`__handleOnBoardingMessage for Message: ${body}`); 
        // send onboarding message
        await sendMessage(getEnvirnomentBasedDefaultCubeId(), getEnvirnomentBasedDefaultFirebaseId(), receiverCubeId, body,true,true);
    }
 
}

module.exports = {
    enqueueGirlzBestieBotMessageTask,
    dequeueGirlzBestieBotMessageTask,
    Girlz_Bestie_Bot_Message_Task,
    GirlzBotMessageTaskType,
}