const admin = require('firebase-admin');
const db = admin.firestore();
const { FieldValue } = require("firebase-admin/firestore");

/**
 *  Disable a user by uid
 * @param {string} userId  - The user id to be disabled
 * @returns 
 */
async function disableAUserByUserId(userId, disabledReason = 'User disabled by admin') {
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
            disabledReason,
        },
        { merge: true },
    );
    return { message: `User ${userId} is disabled` };
};


/**
 *  Enable a user by uid
 * @param {string} userId  - The user id to be enabled
 * @returns 
 */
async function enableAUserByUserId(userId) {
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
    disableAUserByUserId,
    enableAUserByUserId
}