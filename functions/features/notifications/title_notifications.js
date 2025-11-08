const admin = require("firebase-admin");
const utils = require('../../utils/helpers.js'); 




/**
 * Send notifications to multiple devices with automatic token batching.
 * Doesnt support data payload
 * Validates tokens and removes empty tokens
 *
 * @param {string} title - The notification title.
 * @param {string} body - The notification body.
 * @param {Array<string>} tokens - Array of tokens (automatically chunked to 500 tokens per request).
 */
const sendNotificationWithoutData = async (title, body, tokens) => {

    /// Validate data
    if (!title || !body || !tokens) {
        throw new Error(`Invalid Data, title, body, and tokens are required.`);
    }
    /// Validate tokens
    if (!Array.isArray(tokens)) {
        throw new Error(`Invalid Data, tokens must be an array.`);
    }
    /// remove empty tokens
    tokens = tokens.filter(token => !!token);

    if (tokens.length === 0) {
        console.log(`⚠️ No tokens to send notification to`);
        return;
    }

    // Chunk the tokens into batches of 500.
    const tokenBatches = utils.chunkArray(tokens, 500);

    // Define the notification payload.
    const payload = {
        notification: {
            title: title,
            body: body,
        },
    };

    /// Send notifications to each token batch asynchronously.
    for await (const batch of tokenBatches) {
        try {
            console.log(`🧐 Sending notification to ${batch.length} tokens in batch ${tokenBatches.indexOf(batch) + 1} 🧐`)
            const response = await admin.messaging().sendEachForMulticast({
                tokens: batch,
                ...payload
            });

            console.log(`😍😍 Batch ${tokenBatches.indexOf(batch) + 1} response: ${JSON.stringify(response)} 😍😍`)
        } catch (error) {
            console.error(`Failed to send notifications: ${error}`);
        }
    }
};


/**
 * Send notifications to multiple devices with automatic token batching.
 * Doesnt support data payload
 * Validates tokens and removes empty tokens
 *
 * @param {string} title - The notification title.
 * @param {string} body - The notification body.
 * @param {Array<string>} tokens - Array of tokens (automatically chunked to 500 tokens per request).
 * @param {Object} data - The notification data.
 */
const sendNotificationData = async (title, body, tokens, data) => {

    /// Validate data
    if (!title || !body || !tokens) {
        throw new Error(`Invalid Data, title, body, and tokens are required. Received: ${JSON.stringify(data) ?? data}`);
    }
    /// Validate tokens
    if (!Array.isArray(tokens)) {
        throw new Error(`Invalid Data, tokens must be an array. Received: ${JSON.stringify(data) ?? data}`);
    }
    /// remove empty tokens
    tokens = tokens.filter(token => !!token);

    if (tokens.length === 0) {
        console.log(`⚠️ No tokens to send notification to`);
        return;
    }


    // Chunk the tokens into batches of 500.
    const tokenBatches = utils.chunkArray(tokens, 500);

    // Define the notification payload.
    const payload = {
        notification: {
            title: title,
            body: body,
        },
        data: data,
    };

    /// Send notifications to each token batch asynchronously.
    for await (const batch of tokenBatches) {
        try {
            console.log(`\n\n🧐 Sending notification to ${batch.length} tokens in batch ${tokenBatches.indexOf(batch) + 1} 🧐\n\n`)
            const response = await admin.messaging().sendEachForMulticast({
                tokens: batch,
                ...payload
            });

            console.log(`\n\n😍😍 Batch ${tokenBatches.indexOf(batch) + 1} response: ${JSON.stringify(response)} 😍😍\n\n`)
        } catch (error) {
            console.error(`Failed to send notifications: ${error}`);
        }
    }
};


/**
 * Send Notifiction to Single FCM
 * 
 * @param {string} title - The notification title.
 * @param {string} body - The notification body.
 * @param {string} FCM - FCM Token
 */
const sendIndividualNotification = async (title, body, FCM) => {
    /// Validate data
    if (!title || !FCM) {
        throw new Error(`Invalid Data, title, body, and tokens are required. Receivied title: ${title}, body: ${body}, token: ${FCM}`);
    }
 
    const payload = {
        notification: {
            title: title,
            body: body,
        }, 
    };

    const response = await admin.messaging().send({
        token: FCM, 
        ...payload
    },  );
    console.log(`✅ Notification sent with title: ${title}, & FCM = ${FCM} with Response ${response}`); 
}

module.exports = {
    sendNotificationWithoutData,
    sendNotificationData,
    sendIndividualNotification
}