const functions = require("firebase-functions");
const crownService = require("../../../common/rest-api-services/crown_http_services.js");
const { convertToMySQLDate } = require("../../../utils/helpers.js");

/**
 * Triggered when a crown is created for a user.
 * path: /users/{userId}/crowns/{crownId}
 * 
 * @param {functions.firestore.QueryDocumentSnapshot} snap
 * @param {functions.EventContext} context 
 */
const onCrownCreate = async (snap, context) => {
    const userId = context.params.userId;
    const crownData = snap.data();

    const { postId, senderId, createdAt } = crownData;
    const payload = {
        userId: userId, // user that received the crown
        createdAt: convertToMySQLDate(createdAt.toDate()), // date the crown was sent
        crownedBy: senderId, // user that sent the crown
        postId: parseInt(postId), // post that the crown was sent to
    };
    /// Send to REST API
    return await crownService.insertUserCrown(payload);

};





module.exports = {
    onCrownCreate, 
}