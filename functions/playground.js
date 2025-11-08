const admin = require("firebase-admin");
const db = admin.firestore();


const subscribeAllUsersToLoveMessage = async () => {
    const tokens = await db.collection('fcmTokens').get();
    console.log(`Total Tokens: ${tokens.size}`);
    const {DEFAULT_LOVE_MESSAGE_STATUS} =  require('./features/pubsub/love-message/helpers/const.js');
    tokens.forEach(token => {
        token.ref.set(DEFAULT_LOVE_MESSAGE_STATUS, { merge: true });
    })
}

module.exports = {
    subscribeAllUsersToLoveMessage
}