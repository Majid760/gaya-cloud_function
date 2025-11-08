const admin = require("firebase-admin");
const db = admin.firestore();
const { FieldValue } = require("firebase-admin/firestore");
const { flaggedPosts, fcmTokens } = require("./collection_consts.js");
/**
 * Is Flagged limit reached
 * 
 * @param {String} userId
 * 
 * @returns {Promise<Boolean>} isLimitReached
 */
const isFlaggedLimitReached = async (userId) => {
    const maxFlaggedPosts = 15;
    const totalFlaggedPosts = await getFlaggedPostsCountByUser(userId);
    return totalFlaggedPosts >= maxFlaggedPosts;
}


/**
 * Check how many times a post has been flagged of a user
 * 
 * @param {String} userId
 * 
 * @returns {Promise<Number>} count
 */
const getFlaggedPostsCountByUser = async (userId) => {
    try {
        const totalEntries = await db.collection(flaggedPosts).where('userId', '==', userId).count().get();
        return totalEntries.data().count;
    } catch (error) {
        console.error(error);
        return 0;
    }
}

/**
 * flag a post
 * 
 * @param {String} postId - post id
 * @param {String} userId - user id
 * @param {String} reason - reason for flagging
 */
const flagAPost = async (postId, userId, reason) => {
    try {
        const docRef = db.collection(flaggedPosts).doc(postId);
        await docRef.set({
            postId,
            userId,
            reason,
            createdAt: FieldValue.serverTimestamp()
        });
    } catch (error) {
        console.error(error);
    }
}



module.exports = { 
    flagAPost,
    isFlaggedLimitReached
}