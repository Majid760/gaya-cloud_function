const { CC_APP_ID, CC_AUTH_KEY, CC_AUTH_SECRET, CC_APP_ID_DEV, CC_AUTH_KEY_DEV, CC_AUTH_SECRET_DEV } = require('../../configs/api_keys');
const connectyCubeService = require('../../features/connecty-cube/connectycube_services.js');
const functions = require('firebase-functions');
const connectycube = require('connectycube');
const axios = require('axios');
const helper = require('../../utils/helpers.js')

const isDevelopment = () => {
    /// get firebnase project id
    const projectId = process.env.GCLOUD_PROJECT || process.env.GCP_PROJECT;
    /// check if project id is development
    console.log('yes its projecttdkd====');
    return projectId === 'girlz-96072';
}

connectycube.init({
    appId: isDevelopment() ? CC_APP_ID_DEV : CC_APP_ID,
    authKey: isDevelopment() ? CC_AUTH_KEY_DEV : CC_AUTH_KEY,
    authSecret: isDevelopment() ? CC_AUTH_SECRET_DEV : CC_AUTH_SECRET
});

const sendNotificationForNoResponseOnFirstMessage = async (taskData) => {
    const {dialogId, messageId, firebaseId, senderCubeId, receiverCubeId, messageDateSent, encodedPayloadMessage} = taskData;
    if (!messageDateSent) {
        messageDateSent = helper.getCurrentDateTime(true);
    }
    await __createSession(firebaseId);
    await __connectToChat(senderCubeId, firebaseId);
    const cbToken = connectycube.service.sdkInstance.session.token;
    console.log('this is message id', messageId);
    console.log('this is recipient id', receiverCubeId);
    console.log('this is sender id', senderCubeId);
    var shoudSend = await shouldSendNotfication(messageDateSent, receiverCubeId, dialogId, cbToken);
    if (shoudSend) {
        console.log('woow there is no message we should send notification ===>>> )');
        await __sendCustomNotification(cbToken, receiverCubeId, encodedPayloadMessage);
    } else {
        console.log('<<< === oops there is a message we should not send notification ===>>> ):');
    }
    return;
}

/// fetching all chat messages
async function shouldSendNotfication(messageDateSent, receipantId, dialogId, cbToken) {
    // Axios instance with base URL and headers

    const params = {
        chat_dialog_id: dialogId,
        limit:100, // default limit is 50
        // recipient_id:receipantId,
        sender_id: receipantId,
        date_sent: { gte: messageDateSent },  // Using the Greater Than or Equal To operator
        // sort_desc: messageDateSent
        sort_asc:messageDateSent
    }
    // Axios instance with base URL and headers
    const instance = axios.create({
        baseURL: 'https://api.connectycube.com',
        headers: {
            'CB-Token': cbToken
        }
    });
    try {
        const response = await instance.get('/chat/Message', {
            params: params
        });
        const chatMessages = response.data;    
        console.log('Fetched Chat Messages:', chatMessages.items.length);
        console.log('these are message =>>',JSON.stringify(chatMessages));
        return !(chatMessages.items!=undefined && chatMessages.items.length > 0 );
    } catch (error) {
        console.error('Error fetching chat messages====>>>>>:', error.message);
        return false;
    }
}


// Function to send a custom notification
async function __sendCustomNotification(sessionToken, receipantId, encodedMessage) {
    try {
        // Setup the payload as per ConnectyCube API requirements
        const payload = {
            event: {
                notification_type: "push",
                event_type: "one_shot",
                environment: "production",
                user: {
                    ids: receipantId // The user IDs who will receive the notification
                },
                message: encodedMessage
            }
        };
        // Function to send notification
        const response = await axios.post('https://api.connectycube.com/events', payload, {
            headers: {
                'Content-Type': 'application/json',
                'CB-Token': sessionToken
            }
        });
        console.log('Wow Notification sent successfully:123 <==>', response.data);
    } catch (error) {
        console.error(' Oops Error sending notification:123 <==>', error);
        throw error;
    }
}


/// create session for conncectyCube
const __createSession = async (firebaseId) => {
    try {
        if (connectycube.service.sdkInstance.session) {
            console.log("Already created session 🤟🏿");
            return;
        }
        const senderCredentials = {
            login: firebaseId,
            password: firebaseId
        };
        /// 1) Create SESSION  
        console.log("Creating session...")
        const token = (await connectycube.createSession(senderCredentials)).token;
        console.log("✅ 1) Created a session ✅", token);
    } catch (e) {
        console.log('error during creating session=>>', e);
    }
}

const __connectToChat = async (senderCubeId, senderFirebaseId) => {
    try {
        if (connectycube.chat.isConnected) {
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
    } catch (e) {
        console.log('error during connecting to chat=>>', e);
    }
}


module.exports = {
sendNotificationForNoResponseOnFirstMessage
}