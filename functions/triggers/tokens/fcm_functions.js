
const admin = require("firebase-admin");
const db = admin.firestore();
const { DEFAULT_LOVE_MESSAGE_STATUS } = require('../../features/pubsub/love-message/helpers/const.js');

const onFCMTokenCollectionCreate = async (snap, context) => {
    
    /// Default All users will get love message notification
    snap.ref.set(DEFAULT_LOVE_MESSAGE_STATUS, { merge: true });
    return Promise.resolve();

};

module.exports = {
    onFCMTokenCollectionCreate
}