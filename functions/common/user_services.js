const admin = require("firebase-admin");
const db = admin.firestore();
const { usersSubCollections, fcmTokens } = require("./collection_consts.js")


/**
 * 
 * @param {String} id - user id 
 * @returns {Promise<admin.firestore.DocumentSnapshot<admin.firestore.DocumentData>>} - user document snapshot
 */
const getUserById = async (id) => {
    const user = await db.collection("users").doc(id).get();
    return user;
};

/**
 * Delete Nested Collections of a user 
 * 
 * @param {String} userId - user id
 * @returns {Promise<void>}
 */
const deleteUserNestedCollections = async (userId) => {
    const userRef = db.collection("users").doc(userId);

    for await (const collection of usersSubCollections) {
        const collectionRef = userRef.collection(collection);
        const querySnapshot = await collectionRef.get();
        querySnapshot.forEach(async (doc) => {
            await doc.ref.delete();
        });
    }
};

/**
 * Returns users subscribed to love messages
 * 
 * @returns {Promise<admin.firestore.DocumentSnapshot<admin.firestore.DocumentData>>} -  user document snapshot
 */
const isUserSubscribedToLoveMessages = async (userId) => {
    return await db.collection(fcmTokens).doc(userId).get();
    
}

/**
 * Retrieves a list of users.
 *
 * @param {Number?} limit - Optional. The maximum number of users to retrieve.
 * @return {Promise<admin.firestore.QuerySnapshot<admin.firestore.DocumentData>>} A promise that resolves with the user data.
 */
const getAllUsers = async (limit) => {
  const query = db.collection('users');
  if (limit) {
    return await query.limit(limit).get();
  } else {
    return await query.get();
  }
}

/**
 * Returns user FCM data
 * 
 * @returns {Promise<admin.firestore.DocumentSnapshot<admin.firestore.DocumentData>>} -  user document snapshot
 */
const getUserFCM = async (userId) => {
    return await db.collection(fcmTokens).doc(userId).get();
}

/**
 * 
 * @param {string} userId - The user Id
 * @param {string} dateString - The date string (YYYYMMDD)
 * @returns 
 */
const getUserActivity = async (userId, dateString)=> {
  
  return await db.collection('activities').doc(userId).collection('activity').doc(dateString).get();
}

/**
 * Fetches all FCM tokens with time zone offset only
 * 
 * @returns {Promise<admin.firestore.QuerySnapshot<admin.firestore.DocumentData>>} -  user document snapshot
 
 */
const getAllFCMsWithTimeZone = async () => {
  const fcms = await db.collection(fcmTokens).orderBy('tz_offset').get();
  return fcms;
}
 
/**
 * Is the user is super admin or not
 * 
 * @param {string} userId - The user Id
 * @returns {Promise<boolean>} - true if the user is super admin, false otherwise
 */
const isUserSuperAdmin = async (userId) => {
  const user = await getUserById(userId);
  return user.data().isSuperUser || false;
}

/**
 * get single user FCM token
 * 
 * @param {string} userId - The user Id
 * @returns {Promise<String>} - 
 */
const getOnlyUserFCM = async (userId) => {
  const data = await db.collection(fcmTokens).doc(userId).get();
  if (data.exists) {
    const token = data.data().token; // Extract the token field
    console.log('user Token: is ==>', token);
    return token;
  } else {
    console.log('No document found for the provided user ID.');
    return null;
  }
}



module.exports = {
    getUserById,
    deleteUserNestedCollections,
    isUserSubscribedToLoveMessages,
    getAllUsers,
    getUserFCM,
    getUserActivity,
    getAllFCMsWithTimeZone,
    isUserSuperAdmin,
    getOnlyUserFCM
}