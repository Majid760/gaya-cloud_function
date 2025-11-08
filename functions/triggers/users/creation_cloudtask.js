
const { TaskTypes, UserCreationTask } = require('./consts.js');
const cc = require('./../../features/connecty-cube/connectycube_services.js')
const admin = require("firebase-admin");
const db = admin.firestore();
const logger = require('firebase-functions/lib/logger')
const { getFunctions } = require("firebase-admin/functions"); 
const {deleteUserNestedCollections} = require("./../../common/user_services.js")
/** 
 * @param {Object} data : Should contain userId and task (TaskTypes enum) 
 */
const enqueueUserTask = async (data) => {
    const { userId, task } = data;

    if (!userId || !task) {
        throw new Error(`Invalid Data, userId and task are required. Received: ${JSON.stringify(data) ?? data}`);
    }
 
    const queue =  getFunctions().taskQueue(UserCreationTask);

    console.log(`Loggin creation for task ${task} for user ${userId}`);
    const scheduleDelaySeconds = 1;
    await queue.enqueue(
        {
            'userId': userId,
            'task': task
        },
        {
            scheduleDelaySeconds, // 1 second
            dispatchDeadlineSeconds: 60 * 5 // 5 minutes
        },
    )

}


const dequeueUserTask = async (data) => {

    const { userId, task } = data;

    if (!userId || !task) {
        logger.error(`🆘 Invalid Data, userId and task are required. Received: ${JSON.stringify(data) ?? data}`);
    }

    switch (task) { 
        case TaskTypes.CONNECTYCUBE_USER_DELETION:
            await __handleUserDeletionTask(userId);
            break;

        default:
            logger.error(`🆘 Invalid Task ${task}.`);
    }

};



/********************************************************************************************
                                    PRIVATE FUNCTIONS
*********************************************************************************************/


 


/**
 * Delete a user from connecty cube
 * @param {String} user - user id
 */
const __handleUserDeletionTask = async (userId) => {
    
      admin.auth().deleteUser(userId);
    /// delete user in connecty cube
      cc.deleteUserInConnectyCube(userId);

      /// delete nested collections
      deleteUserNestedCollections(userId);

    console.log(`User ${userId} deleted succesfully`);
};

module.exports = {
    enqueueUserTask,
    dequeueUserTask,
    TaskTypes,
}