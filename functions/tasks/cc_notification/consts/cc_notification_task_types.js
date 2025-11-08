
/**
 * 
 * @enum {string}
 * Payload should contain:
 
    {
        [POST_ID]: postId,
        [POST_TASK_DATA]: taskData, 
        [POST_TASK_TYPE]: taskType,

        whereas taskData should contain:
        {
            postId: <string>,
            title:  <string>,
            body: <string>,
            authorUid: <string>, 
        }  
    }
 */
  
    const CCNotificationTaskType = {

        SEND_NOTIFICATION_FIRST_MESSAGE: 'SEND_NOTIFICATION_FIRST_MESSAGE',
    }
    
    module.exports = {
        CCNotificationTaskType
    }