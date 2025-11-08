/// Field names
const Sender_Id = 'senderId';
const Sender_Cube_Id = 'senderCubeId';
const Receiver_Id = 'receiverId';
const Receiver_Cube_Id = 'receiverCubeId';
const Message = 'message';
const Girlz_Bestie_Bot_Message_Task = 'girlzBestieBotMessageTask'; 
const Girlz_Bestie_Bot_Message_Task_Data = 'taskData';
const GIRLZ_BOT_MESSAGE_TASK_TYPE = 'SEND_BOT_MESSAGE';

// Task type enum
/**
 * 
 * @enum {string}
 */
const GirlzBotMessageTaskType = {
        SEND_BOT_MESSAGE: 'SEND_BOT_MESSAGE',
        SEND_ONBOARDING_MESSAGE: 'SEND_ONBOARDING_MESSAGE',
    }


module.exports = {
    Sender_Id,
    Sender_Cube_Id,
    Receiver_Id,
    Receiver_Cube_Id,
    Message, 
    Girlz_Bestie_Bot_Message_Task,
    Girlz_Bestie_Bot_Message_Task_Data,
    GirlzBotMessageTaskType,
    GIRLZ_BOT_MESSAGE_TASK_TYPE
}