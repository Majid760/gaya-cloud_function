
/// Supported message types - ENUM
const LoveMessageType = {
    TEXT: 'text',
}

/// Cube User Id of Love Message Sender
const LOVE_MESSAGE_SENDER_ID = 'LOVE_MESSAGE_SENDER_ID';
const LOVE_MESSAGE_SENDER_CUBE_ID = 'LOVE_MESSAGE_SENDER_CUBE_ID';

// Task Name at index.js
const LOVE_MESSAGE_TASK = 'handleLoveMessageTask';

// Task Data Keys
const USER_ID = 'USER_ID';
const LOVE_MESSAGE_TYPE = 'LOVE_MESSAGE_TYPE';
const LOVE_MESSAGE_CONTENT = 'LOVE_MESSAGE_CONTENT';


/// Default Values for Sender - Almog Elmaliah
const DEFAULT_CUBE_ID = 10987447;
const DEFAULT_FIREBASE_ID = '5qOMKbWGeecEvfGUdt6PgV8o1Wv2';

const getEnvirnomentBasedDefaultCubeId = () => {
    return isDevelopment() ?  GIRLZ_BESTIE_CUBE_ID_DEV : DEFAULT_CUBE_ID;
}

const getEnvirnomentBasedDefaultFirebaseId = () => {
    return isDevelopment() ?  GIRLZ_BESTIE_FIREBASE_ID_DEV : DEFAULT_FIREBASE_ID;

}

const GIRLZ_BESTIE_CUBE_ID = 11203417;
const GIRLZ_BESTIE_FIREBASE_ID = 'nS5dDmUcMjZ9BjLnnav1p0b6kVD2';
const GIRLZ_BESTIE_CUBE_ID_DEV= 11229050;
const GIRLZ_BESTIE_FIREBASE_ID_DEV = 'znuGuYrnuKfrgpECUsBImL76eSC2';

/// FCM Notification Status Key - for User at FCM Tokens Collection
const DEFAULT_LOVE_MESSAGE_STATUS = {'loveMessageStatus': true};


const isDevelopment = () => {

    /// get firebnase project id
    const projectId = process.env.GCLOUD_PROJECT || process.env.GCP_PROJECT;
    /// check if project id is development
    return projectId === 'girlz-96072';
}

module.exports = {
    // enum
    LoveMessageType,

    /// consts
    LOVE_MESSAGE_SENDER_ID,
    LOVE_MESSAGE_SENDER_CUBE_ID,
    LOVE_MESSAGE_TASK, 
    USER_ID,
    LOVE_MESSAGE_TYPE,
    LOVE_MESSAGE_CONTENT,

    ///Default Values
    DEFAULT_CUBE_ID,
    DEFAULT_FIREBASE_ID,

    DEFAULT_LOVE_MESSAGE_STATUS,

    GIRLZ_BESTIE_CUBE_ID,
    GIRLZ_BESTIE_FIREBASE_ID,

    getEnvirnomentBasedDefaultCubeId,
    getEnvirnomentBasedDefaultFirebaseId

}