
/**
 * 
 * @enum {string}
 * Payload should contain:
 
    {
        [POST_ID]: postId,
        whereas taskData should contain:
        {
            postId: <string>,
            
        }  
    }
 */
  
    const NoReplyNotificationTaskType = {

        SEND_NOTIFICATION_ON_NO_REPLY: 'SEND_NOTIFICATION_ON_NO_REPLY',
    }
    
    module.exports = {
        NoReplyNotificationTaskType
    }