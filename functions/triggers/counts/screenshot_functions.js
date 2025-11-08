const admin = require("firebase-admin");
const db = admin.firestore();
const functions = require("firebase-functions");
const { updateAiPost } = require("../../common/btl-ai-services/btl_ai_services");

/**
 * 
 * @param {functions.firestore.QueryDocumentSnapshot} snap
 * @param {functions.EventContext} context
 */
const onScreenshotCreate = async (snap, context) => {
    const screenshotData = snap.data();
    const postId = screenshotData.postId;

    // get total screenshot count of current post
    const screenshotCount = await getScreenshotCount(postId);

    // if(screenshotCount === 0 || screenshotCount < 0) return;
    // api python
    const payload = {
        "post_id": postId,
        "post_payload": {
            "share_count": screenshotCount 
        }
    }
    await updateAiPost(payload);


}


/**
 * 
 * @param {string} postId 
 * @returns {Promoise<number>} - {count: number}
 */
async function getScreenshotCount(postId) {
    const count = await db.collection('screenshots').where('postId', '==', postId).count().get();
    return count.data().count;

}


module.exports = {
    onScreenshotCreate
}