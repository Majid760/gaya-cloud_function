
const task = require('../tasks.js');
const {GIRLZ_BOT_MESSAGE_TASK_TYPE, Girlz_Bestie_Bot_Message_Task_Data} = require('../const.js');  

const call = () => {
         handleEnqueue();
        // handleDequeue();
}

async function handleEnqueue() { 
    const taskData = {
        receiverId:'ormmYtFoljc7sYkj6tQdEvKrkuY2',
        receiverCubeId: 11514547,
        body : 'Hey welcome to Girlz Bestie!'
    } 
    await task.enqueueGirlzBestieBotMessageTask(taskData, task.GirlzBotMessageTaskType.SEND_ONBOARDING_MESSAGE);
}

async function handleDequeue(){
    const payload = {
        receiverId:'ormmYtFoljc7sYkj6tQdEvKrkuY2',
        receiverCubeId: 11514547,
        body : 'Hey welcome to Girlz Bestie!'
    };
    const taskData = {
        [Girlz_Bestie_Bot_Message_Task_Data]: payload,
        [GIRLZ_BOT_MESSAGE_TASK_TYPE]: task.GirlzBotMessageTaskType.SEND_ONBOARDING_MESSAGE,
      }
    
    task.dequeueGirlzBestieBotMessageTask(taskData);  
}

module.exports = {
    call
}