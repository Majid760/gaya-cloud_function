
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
const PostTaskType = {

    SEND_NOTIFICATION_10_PERCENT: 'SEND_NOTIFICATION_10_PERCENT',
    RANK_POST_GPT: 'RANK_POST_GPT',
}

module.exports = {
    PostTaskType
}