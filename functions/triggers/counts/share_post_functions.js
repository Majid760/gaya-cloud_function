const admin = require("firebase-admin");
const db = admin.firestore();
const functions = require("firebase-functions");
const { updateAiPost } = require("../../common/btl-ai-services/btl_ai_services.js");

/**
 * We are using `link_open_count` as a key to update the AI post for whenever a post being shared.
 * 
 * @param {functions.firestore.QueryDocumentSnapshot} snap
 * @param {functions.EventContext} context
 */
const onSharePostCreate = async (snap, context) => {
    const screenshotData = snap.data();
    const postId = screenshotData.postId;

    // get share total count of current post
    const totalShareCount = await getSharePostCount(postId);

    if (totalShareCount === 0 || totalShareCount < 0) return;
    // api python
    const payload = {
        "post_id": postId,
        "post_payload": {
            "link_open_count": totalShareCount
        }
    }
    await updateAiPost(payload);
}


/**
 * 
 * @param {string} postId 
 * @returns {Promoise<number>} - {count: number}
 */
async function getSharePostCount(postId) {
    const count = await db.collection('sharedPosts').where('postId', '==', postId).count().get();
    return count.data().count;

}


module.exports = {
    onSharePostCreate
}