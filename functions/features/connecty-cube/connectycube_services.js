const connectycube = require('connectycube');
const { CC_APP_ID, CC_AUTH_KEY, CC_AUTH_SECRET, CC_APP_ID_DEV, CC_AUTH_KEY_DEV, CC_AUTH_SECRET_DEV } = require('../../configs/api_keys');

const admin = require('firebase-admin');
const db = admin.firestore();
const helper = require('../../utils/helpers.js')

const isDevelopment = () => {

    /// get firebnase project id
    const projectId = process.env.GCLOUD_PROJECT || process.env.GCP_PROJECT;
    /// check if project id is development
    return projectId === 'girlz-96072';
}
const CONFIG = {
    on: {
      sessionExpired: (handleResponse, retry) => {
        // call handleResponse() if you do not want to process a session expiration,
        // so an error will be returned to origin request
        // handleResponse();
  
        connectycube.createSession()
          .then(retry)
          .catch((error) => {
            console.log('Session expired error', error); 
          });
      },
    },
  };
   
connectycube.init({
    appId: isDevelopment() ? CC_APP_ID_DEV : CC_APP_ID,
    authKey: isDevelopment() ? CC_AUTH_KEY_DEV : CC_AUTH_KEY,
    authSecret: isDevelopment() ? CC_AUTH_SECRET_DEV : CC_AUTH_SECRET
},
CONFIG
);




function getUserAnonymousName(dob) {
    const age = helper.getAgeFromDOB(dob);
    if (age > 0) {
        return `Anonymous Girl - ${age} years old`;
    }
    return `Anonymous Girl`;
}

/**
 * Create a user in connecty cube from firebase user - incase if error, just update
 * @param {Object} user -- user object from firebase (user.data())
 * @returns {Promise<void>}
 */
const createUserInConnectyCube = async (user) => {
    let token = '';
    try {
        return await createUserCC(user);

    } catch (_) {

        console.log("user error", JSON.stringify(_));
        if (isEmailUniqueError(_)) {
            user.email = `${user.uid}@connectycube.com`
            return await createUserCC(user);
        } else if (isPhoneError(_)) {
            delete user.phoneNumber;
            user.email = `${user.uid}@connectycube.com`
            return await createUserCC(user);
        } else {
            console.log(`Couldnt retry.`)
        }
    }
}

async function createUserCC(user) {
    console.log("creating a user", user.email);
    token = (await connectycube.createSession()).token
    if (user.phoneNumber) {
        user.phoneNumber = user.phoneNumber.code + user.phoneNumber.number;
    }
    const connectyCubeUser = {
        login: user.uid,
        password: user.uid,
        phone: user.phoneNumber,
        avatar: user.profilePic ?? '',
        full_name: user.name,

    };
    /// if dob is present then add otherwise ignore
    if (user.dob) {
        connectyCubeUser.custom_data = JSON.stringify({
            anonymousName: getUserAnonymousName(user.dob)
        })
    }

    /// if email is present then add it to connecty cube user with trimmed value
    if (user.email) {
        connectyCubeUser.email = user.email.trim();
    }

    console.log(JSON.stringify(connectyCubeUser))

    const createdUser = await connectycube.users.signup(connectyCubeUser);
    console.log("user created", JSON.stringify(createdUser));
    return createdUser;
}

function isEmailUniqueError(errorResponse) {
    if (errorResponse && errorResponse.code === 422 && errorResponse.info && errorResponse.info.errors && errorResponse.info.errors.base) {
        const errorMessages = errorResponse.info.errors.base;
        return errorMessages.includes("email must be unique");
    }
    return false;
}
function isPhoneError(errorResponse) {
    if (errorResponse && errorResponse.code === 422 && errorResponse.info && errorResponse.info.errors && errorResponse.info.errors.phone) {
        if (errorResponse.info.errors.phone) {
            return true;
        }
    }
    return false;
}

/**
 * A function to update users in connecty cube
 * @param {Object} user - user object from firebase (user.data())
 * Updates only the following fields: full_name, avatar, phone
 */
const updateUsersInConnectyCube = async (user) => {
    try {
        await connectycube.destroySession().catch((error) => { });
        await connectycube.logout().catch((error) => { });
        const credetials = {
            login: user.uid,
            password: user.uid,
        }
        console.log("updating a user", user.email);
        (await connectycube.createSession(credetials)).token
        const connectyCubeUser = {
            login: user.uid,
            password: user.uid,
            full_name: user.userName ?? user.name ?? '',
            avatar: user.profilePhoto ?? '',
        };

        /// if dob is present then add otherwise ignore
        if (user.dob) {
            connectyCubeUser.custom_data = JSON.stringify({
                anonymousName: getUserAnonymousName(user.dob)
            })
        }
        const loggedUser = await connectycube.users.update(connectyCubeUser)
        console.log("User updated at CC ✅", loggedUser);


    } catch (_) {
        console.log("user error JSOn", JSON.stringify(_));
    }
}

/**
 * A Function to to delete a user from connecty cube
 * @param {string} userId - user id  
 */
const deleteUserInConnectyCube = async (userId) => {
    const credetials = {
        login: userId,
        password: userId
    }


    connectycube.createSession(credetials).then(async () => {
        console.log("Session created")
        await connectycube.users.delete(credetials);
    });


    console.log("Succesfully deleted user from connecty cube :", userId)

}

const loginToChat = async (userId, cubeId) => {
    const credetials = {
        login: userId,
        password: userId
    };

    await connectycube.createSession(credetials);

    const token = connectycube.service.sdkInstance.session.token;

    const userCredentials = {
        userId: cubeId,
        password: token
    };

    await connectycube.chat.connect(userCredentials).then(() => { });
}

/**
 * 
 * @param {String} firebaseId 
 * @returns {Promise<Number>?} - cubeId
 */
const getCubeIdByFirebaseId = async (firebaseId) => {
    try {
        await __createSession(firebaseId);
        const users = await connectycube.users.get({ login: firebaseId });

        if (users && users.items && users.items.length > 0) {
            return users.items[0].id;
        }
    } catch (_) {
        console.log("error", _);
    }

}

const _isCCSessionExpired = () => {
    /// CC expire session after 2 hours, so we will create session after every 1.5 hours
    return (new Date() - lastSessionCreatedAt) > 1000 * 60 * 60 * 1.5; 
}

/**
 * 
 * @param {Number} senderCubeId - sender cube id
 * @param {String} senderFirebaseId - sender firebase id
 * @param {String} receiverCubeId - receiver firebase id
 * @param {String} message - message to send
 * @param {Boolean?} isGirlzBestieMessage - if the message is from girlz bestie 
 * @param {Boolean?} isOnboardingMessage -  if the message is onboarding message
 */
const sendMessage = async (senderCubeId, senderFirebaseId, receiverCubeId, message, isGirlzBestieMessage = false, isOnboardingMessage = false) => {

    /// 1) Make Session for the sender...
    await __createSession(senderFirebaseId);

    /// 2) Connect to Chat for the sender...
    await __connectToChat(senderCubeId, senderFirebaseId);

    /// 3) Create Chatroom (Dialog) with the receiver...
    let dialog;
    if (isGirlzBestieMessage) {
        dialog = await ___createDialogAsGirlzBestie(receiverCubeId);
    } else {
        dialog = await ___createDialogAsAnonymous(receiverCubeId);
    }

    /// 4) Send Message to the receiver...
    await __sendMessage(dialog._id, receiverCubeId, message, isOnboardingMessage);
}
let lastSessionCreatedAt = new Date();
const __createSession = async (firebaseId) => {
    const isSessionExpired = _isCCSessionExpired();
    if (connectycube.service.sdkInstance.session && !isSessionExpired) {
        console.log("Already created session 🤟🏿");
        return;
    }
    // set last session created at
    lastSessionCreatedAt = new Date();
    const senderCredentials = {
        login: firebaseId,
        password: firebaseId
    };
    /// 1) Create SESSION  
    console.log("Creating session...")
    await connectycube.createSession(senderCredentials);
    console.log("✅ 1) Created a session ✅");
}


const __connectToChat = async (senderCubeId, senderFirebaseId) => {


    const isAlreadyConnected = connectycube.chat.isConnected;
    const isSessionExpired = _isCCSessionExpired();

    if (isAlreadyConnected && !isSessionExpired) {
        console.log("Already connected to Chat 🤟🏿");
        return;
    }
    const chatCredentials = {
        userId: senderCubeId,
        password: senderFirebaseId,
    };

    console.log(`Connecting to Chat...`);
    /// 2) Login to Chat...
    await connectycube.chat.connect(chatCredentials);

    console.log("✅ 2) Connected to Chat ✅");
}

const ___createDialogAsAnonymous = async (receiverCubeId) => {
    const params = {
        type: 3,
        occupants_ids: [receiverCubeId],
        data: { "class_name": "UserInfo", 'otherUser': 'Anonymous User', 'creatorUser': 'Girlz Bestie', "isLoveMessage": true }
    };
    console.log(`Creating dialog...`)
    const dialog = await connectycube.chat.dialog.create(params);
    console.log(`✅ 2) Dialog Fetched: ${JSON.stringify(dialog)}`);
    return dialog;
}

const ___createDialogAsGirlzBestie = async (receiverCubeId) => {
    const params = {
        type: 3,
        occupants_ids: [receiverCubeId],
        data: { "class_name": "UserInfo", 'otherUser': 'Anonymous User', 'creatorUser': 'Girlz Bestie', "isLoveMessage": true }
    };
    console.log(`Creating dialog...`)
    console.log("params", params);
    const dialog = await connectycube.chat.dialog.create(params);
    console.log(`✅ 2) Dialog Fetched: ${JSON.stringify(dialog)}`);
    return dialog;
}

const __sendMessage = async (dialogId, oponnentId, content, isOnboardingMessage = false) => {
    const messagePayload = {
        type: 'chat',
        body: content,
        extension: {
            save_to_history: 1,
            dialog_id: dialogId,
        },
        markable: 1
    };
    if (isOnboardingMessage) {
        messagePayload.extension.attachments = [{
            "type": 'onboarding'
        }]

    } else if (content.includes("https://www.btl.social/community")) {
        messagePayload.extension.attachments = [{
            "type": 'communityGuideline'
        }]
    }
    await connectycube.chat.send(oponnentId, messagePayload);
    console.log(`🎉 Sent Message Successfully to ${oponnentId} with content ${content} 🎉`);

}
const sendMessageAsPost = async (senderCubeId, senderFirebaseId, receiverCubeId, message, post, isGirlzBestieMessage = false) => {
    /// 1) Make Session for the sender...
    await __createSession(senderFirebaseId);

    /// 2) Connect to Chat for the sender...
    await __connectToChat(senderCubeId, senderFirebaseId)

    /// 3) Create Chatroom (Dialog) with the receiver...
    let dialog;
    if (isGirlzBestieMessage) {
        dialog = await ___createDialogAsGirlzBestie(receiverCubeId);
    } else {
        dialog = await ___createDialogAsAnonymous(receiverCubeId);
    }

    /// 4) Send Message to the receiver...
    await __sendMessageAsPost(dialog._id, receiverCubeId, message, post);
}
const __sendMessageAsPost = async (dialogId, oponnentId, content, post) => {
    const messagePayload = {
        type: 'chat',
        body: 'attachment',
        extension: {
            save_to_history: 1,
            dialog_id: dialogId,
            'postId': post.id,
            'title': post.title,
            'content': post.content,
            'author': post.author.uid,
            'backgroundImgURL': post.backgroundImgURL,
            attachments: [{
                'type': null,
                'url': null,
                'name': 'post',
                'data': post.id,

            }],
        },
        markable: 1
    };
    console.log("message payload", JSON.stringify(messagePayload))
    await connectycube.chat.send(oponnentId, messagePayload);
    console.log(`🎉 Sent Message Successfully to ${oponnentId} with content ${content} 🎉`);

}
/// Path: functions/index.js
module.exports = {
    createUserInConnectyCube,
    deleteUserInConnectyCube,
    updateUsersInConnectyCube,
    getUserAnonymousName,
    sendMessage,
    getCubeIdByFirebaseId,
    sendMessageAsPost
}