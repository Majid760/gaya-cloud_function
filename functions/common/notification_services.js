const admin = require("firebase-admin");
const db = admin.firestore();
const fcmTokensRef = db.collection('fcmTokens');
const utils = require('./../utils/helpers.js');
// const { FieldValue } = require('@google-cloud/firestore');
const { FieldValue } = require("firebase-admin/firestore");
/**
 * Fetches 2% of the total tokens in the database
 *
 * @returns {Promise<Array<{id: string, token: string}>>} A Promise that resolves to an array of objects, where each object has two properties:
 *   - id (string): user ID.
 *   - token (string): The token retrieved from the document's data.
 */
async function fetchRandom10PercentPeople() {
    const [totalTokens, minDoc, maxDoc] = await Promise.all([
        allTokenCount(),
        fetchMinMaxUpdatedAt(),
        fetchMinMaxUpdatedAtDesc(),
    ]);
    const minUpdatedAt = minDoc.data().updatedAt;
    const maxUpdatedAt = maxDoc.data().updatedAt;


    // Step 3: Generate a random query to fetch 8 percent
    const randomUsersCount = Math.ceil((8 / 100) * totalTokens);
    const randomFCMTokens = [];

    // Define a maximum number of iterations to prevent an infinite loop
    const maxIterations = 2 * randomUsersCount; // 2 times the number of users you want to fetch (In case you have a small number of users)

    for (let i = 0; i < maxIterations; i++) {
        // Generate a random timestamp between minUpdatedAt and maxUpdatedAt
        const randomTimestamp = new Date(
            minUpdatedAt.toDate().getTime() +
            Math.random() * (maxUpdatedAt.toDate().getTime() - minUpdatedAt.toDate().getTime())
        );

        // Create a query with the random timestamp
        const randomQuery = fcmTokensRef
            .where('updatedAt', '>=', randomTimestamp)
            .orderBy('updatedAt')
            .limit(randomUsersCount - randomFCMTokens.length);

        const randomQuerySnapshot = await randomQuery.get();

        if (!randomQuerySnapshot.empty) {
            randomQuerySnapshot.forEach((doc) => {
                randomFCMTokens.push({
                    id: doc.id,
                    token: doc.data().token,

                });
            });
        }

        // Check if you have fetched enough data
        if (randomFCMTokens.length >= randomUsersCount) {
            break;
        }
    }

    console.log(`Total tokens: ${totalTokens}, random tokens: ${JSON.stringify(randomFCMTokens)}`);

    return randomFCMTokens;

}

/**
 * Once notification is sent successfully, update the lastServerSentAt field
 * 
 * Automatically handle batching of tokens
 * 
 * @param {Array<{id: string, token: string>}} rawTokens - Array of raw tokens 
 */
async function notificationSentSuccess(rawTokens) {

    const chunkedTokens = utils.chunkArray(rawTokens, 470);

    for (const tokens of chunkedTokens) {
        const batch = db.batch();
        for (const token of tokens) {
            const docRef = fcmTokensRef.doc(token.id);
            batch.set(docRef, {
                lastServerSentAt: FieldValue.serverTimestamp(),
            },
                {
                    merge: true,
                },
            );
        }
        await batch.commit();

    }
}

/**
 * Clear FCM tokens
 * @param {Array<string>} tokens - Array of tokens to clear
 * automatically handle batching of tokens
 * 
 * @returns {Promise<void>}
 */
async function clearTokens(tokens) {
    const chunkedTokens = utils.chunkArray(tokens, 470);

    for (const tokens of chunkedTokens) {
        const batch = db.batch();
        for (const token of tokens) {
            const docRef = fcmTokensRef.doc(token.id);
            batch.delete(docRef);
        }
        await batch.commit();

    }
}


const allTokenCount = async () => {
    const query = db.collection('fcmTokens').count();
    return (await query.get()).data().count;
}
const fetchMinMaxUpdatedAt = async () => {
    const query = fcmTokensRef.orderBy('updatedAt').limit(1);
    const snapshot = await query.get();
    const minDoc = snapshot.docs[0];
    return minDoc;
}
const fetchMinMaxUpdatedAtDesc = async () => {
    const query = fcmTokensRef.orderBy('updatedAt', 'desc').limit(1);
    const snapshot = await query.get();
    const maxDoc = snapshot.docs[0];
    return maxDoc;
}

/**
 * STUB => Fetches 10% of the total tokens in the database
 *
 * @returns {Promise<Array<{id: string, token: string}>>} A Promise that resolves to an array of objects, where each object has two properties:
 *   - id (string): user ID.
 *   - token (string): The token retrieved from the document's data.
 */
const fetchMyDevPeople = async () => {
    const query = fcmTokensRef.doc('aOnVC7tckVdrKONHkr2tMxGwPil2');
    const snapshot = await query.get();

    const arr = [];
    arr.push({
        id: snapshot.id,
        token: snapshot.data().token,
    });
    return arr;
}

/**
 * Get all user's FCM tokens from the Firestore collection.
 *
 * @returns {Promise<Array<string>>} - An array of user FCM tokens.
 */
const allUsersToken = async () => {
    try {
        // Fetch the raw tokens from the 'fcmTokens' collection in Firestore.
        const querySnapshot = await db.collection('fcmTokens').get();

        // Extract and map the token data from the documents.
        const tokens = querySnapshot.docs.map((doc) => doc.data().token);

        return tokens;
    } catch (error) {
        // Handle any potential errors, e.g., database connection issues.
        console.error('Error fetching FCM tokens:', error);
        throw error; // Optionally, you can rethrow the error for higher-level error handling.
    }
}

/**
 * Get stale tokens from the Firestore collection.
 * 
 * @returns {Promise<admin.firestore.QueryDocumentSnapshot<admin.firestore.DocumentData>[]>} - An array of all the Tokens docs in the QuerySnapshot.

 */
const getStaleTokens = async () => {
    try {  
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30); 

        // Fetch the stale tokens from the 'fcmTokens' collection in Firestore.
        const querySnapshot = await db.collection('fcmTokens').where('updatedAt', '<', thirtyDaysAgo).get();

        return querySnapshot.docs;
    } catch (error) {
        // Handle any potential errors, e.g., database connection issues.
        console.error('Error fetching stale FCM tokens:', error);
        throw error; // Optionally, you can rethrow the error for higher-level error handling.
    }
}

module.exports = {
    fetchRandom10PercentPeople,
    notificationSentSuccess,
    clearTokens,
    fetchMyDevPeople,
    allUsersToken,
    getStaleTokens,
}