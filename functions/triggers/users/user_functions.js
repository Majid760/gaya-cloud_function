
const connectyCubeServices = require("../../features/connecty-cube/connectycube_services.js")
const utils = require("../../utils/validators/user_validators.js")
const admin = require("firebase-admin");
const db = admin.firestore();
const { welcomeToAppOnboardingMessage } = require('./../../configs/consts.js')
const { GIRLZ_BESTIE_CUBE_ID, GIRLZ_BESTIE_FIREBASE_ID } = require('../../features/pubsub/love-message/helpers/const.js')
const { TaskTypes, enqueueUserTask, dequeueUserTask } = require('./creation_cloudtask.js');

const { enqueueGirlzBestieBotMessageTask, GirlzBotMessageTaskType } = require('../onCCMessage/girlBestie/tasks.js')
const {isUserSuperAdmin} = require(`../../common/user_services.js`)

const { FieldValue } = require("firebase-admin/firestore");

const onUserCollectionUpdate = async (snap, context) => {
    const beforeData = snap.before.data();
    const afterData = snap.after.data();
    const userId = snap.after.id;
    const isChanged = utils.hasChanged(beforeData, afterData);
    if (isChanged) {
        console.log(`User ${userId} has changed data in firestore`);
        console.log(`Old Data: ${JSON.stringify(beforeData)}`);
        console.log(`New Data: ${JSON.stringify(afterData)}`);
        await connectyCubeServices.updateUsersInConnectyCube({
            ...afterData,
            uid: userId
        });
        admin.auth().updateUser(userId, {
            displayName: afterData.userName,
            photoURL: afterData.profilePhoto,
            
        });
    }

    console.log(`onUserUpdate executed succesfully`);
    return "Executed Succesfully!";
};



const onUserCollectionDelete = async (snap, context) => {
    const userData = {
        ...snap.data(),
        uid: snap.id
    }

    // /// Register user deletion task
    await enqueueUserTask({
        userId: userData.uid,
        task: TaskTypes.CONNECTYCUBE_USER_DELETION
    });
    console.log(`onUserCreate executed succesfully`);
    return "Executed Succesfully!";
}
/**
 * When A Firebase Auth user is created.
 * @param {UserRecord} user - FirebaseAuthUserRecord
 */
const onAuthUserCreate = async (user) => {
    try{
        const userData = {
            'uid': user.uid,
            'email': user.email ?? `${user.uid}@connectycube.com`,
            'phoneNumber': user.phoneNumber,
            'profilePhoto': user.photoURL,
            'userName': user.displayName,
        }
        /// create user in CC
        const cubeUser = await connectyCubeServices.createUserInConnectyCube(userData);
        /// update user in firestore
        await db.collection('users').doc(userData.uid).set(
            {
                cubeId: cubeUser.user.id,
                didTrialInvite: true,
                'createdAt': FieldValue.serverTimestamp(),
                'updatedAt': FieldValue.serverTimestamp(),
            },
            { merge: true },
        );
    
        const recieverCubeId = cubeUser.user.id;
    
        try {
            const taskData = {
                receiverId: userData.uid,
                receiverCubeId: recieverCubeId,
                body: welcomeToAppOnboardingMessage(userData.userName),
            }
            await enqueueGirlzBestieBotMessageTask(taskData, GirlzBotMessageTaskType.SEND_ONBOARDING_MESSAGE);
            console.log(`Sent welcome message to user ${userData.uid}`);
        } catch (e) {
            console.log(`⚠️ Could not send welcome message to user ${userData.uid} with error: ${JSON.stringify(e)}`);
        }
    }catch(_){
        console.log(_);
    }


}

/**
 * A Function that disables a user by uid (admin only)
 * @returns 
 */
const deleteUserByIDOnCall = async (data, context) => {
    console.log(context.auth);
    /// authenticate the user
    if (!context.auth) {
       
        throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }
    const adminUID = context.auth.uid;
    const { uid, isBlock } = data;
    if (!uid || !isBlock) {
        throw new functions.https.HttpsError('invalid-argument', 'The function must be called with uid and isBlock.');
    }

    if (!(await isUserSuperAdmin(adminUID))) {
        throw new functions.https.HttpsError('permission-denied', 'The function must be called by a super admin.');
    }

    if (isBlock) {
        return await _disableAUserByUserId(uid);
    } else {
        return await _enableAUserByUserId(uid);
    }

}

/**
 *  Disable a user by uid
 * @param {string} userId  - The user id to be disabled
 * @returns 
 */
async function _disableAUserByUserId(userId) {
    const user = await admin.auth().getUser(userId);
    if (user.disabled) {
        console.log(`User ${userId} is already disabled`);
        return { message: `User ${userId} is already disabled` };
    }
    await admin.auth().updateUser(userId, { disabled: true });
    console.log(`User ${userId} is disabled`);
    /// store in firestore
    await db.collection('users').doc(userId).set(
        {
            'disabled': true,
            'updatedAt': FieldValue.serverTimestamp(),
        },
        { merge: true },
    );

    // delete all his posts
    

    return { message: `User ${userId} is disabled` };
};

/**
 *  Enable a user by uid
 * @param {string} userId  - The user id to be enabled
 * @returns 
 */
async function _enableAUserByUserId(userId) {
    const user = await admin.auth().getUser(userId);
    if (!user.disabled) {
        console.log(`User ${userId} is already enabled`);
        return { message: `User ${userId} is already enabled` };
    }
    await admin.auth().updateUser(userId, { disabled: false });
    console.log(`User ${userId} is enabled`);
    /// store in firestore
    await db.collection('users').doc(userId).set(
        {
            'disabled': false,
            'updatedAt': FieldValue.serverTimestamp(),
        },
        { merge: true },
    );
    return { message: `User ${userId} is enabled` };
}
module.exports = {
    onUserCollectionUpdate,
    onUserCollectionDelete,
    onAuthUserCreate,
    dequeueUserTask, 
    deleteUserByIDOnCall
}