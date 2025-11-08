 
/**
 * 
 * @param {FirebaseNotificationType} notificationType - (Required)
 * @param {Object} notificationData - Must contain title, body & userId of user (Required)
 */
const notificationValidator = (notificationType, notificationData) => {
    if (!notificationType || !notificationData) {
        throw new Error(`Invalid Data, notificationType, and notificationData are required. Received: ${JSON.stringify(notificationType) ?? notificationData}`);
    }

    if (!notificationData.userId) {
        throw new Error(`[notificationValidator]: Invalid Data. Received: ${JSON.stringify(notificationData) ?? notificationData}`);
    }
}

module.exports = {
    notificationValidator,
}