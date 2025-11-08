

const admin = require('firebase-admin');
const db = admin.firestore();
const moment = require('moment');


/**
 * Sends a daily notification to all users on the 'all' topic (5PM (Server time))
 * 
 * @returns {Promise<boolean>} True if the notification was sent successfully
 */
async function sendDailyTagNotification(_) {
    {
        try {  
            // Get the tag of the day
            const tag = await __getTodayTag();

            if(!tag) {
                console.log('No tag found today.');
                return null;
            }

            // Send the broadcast notification to all users
            const response = await admin.messaging().sendToTopic(
                "all",
                {
                    "notification": {
                        "title": `New flips on "${tag}"`,
                        "body": "Check them out!",
                    }
                },
                {
                    "contentAvailable": true,
                    "timeToLive": 60 * 60 * 24, ///Keep the notification for 24 hours
                }

            );
            console.log('Notification sent:', JSON.stringify(response));

            return true;
        } catch (error) {
            console.error('Error sending daily notification:', JSON.stringify(error));
            return false;
        }
    }
}

/**
 * Get the tag of the day
 * 
 * @returns {Promise<string?>} The tag of the day
 */
async function __getTodayTag(){
    const currentDate = moment();
    const startOfDay = currentDate.startOf('day').toDate();
    const endOfDay = currentDate.endOf('day').toDate();

    // Query posts created on the same day
    const postQuerySnapshot = await db.collection('posts')
        .where('createdAt', '>=', startOfDay)
        .where('createdAt', '<=', endOfDay)
        .limit(1)
        .get();

    if (postQuerySnapshot.empty) {
        console.log('No posts created today.');
        return null;
    }

    const postDoc = postQuerySnapshot.docs[0];
    const tags = postDoc.get('tags');

    if (!tags || tags.length === 0) {
        console.log('No tags found in the post.');
        return null;
    }

    // Use the first tag as the '${tag}' variable in the notification message
    const tag = tags[0];
    return tag;
}

module.exports = {
    sendDailyTagNotification
}