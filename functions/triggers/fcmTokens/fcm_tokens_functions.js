
const utils = require("../../utils/validators/user_validators.js")
const admin = require("firebase-admin");
const db = admin.firestore();
const { FieldValue } = require('@google-cloud/firestore');

const onUserFcmCollectionUpdate = async (snap, context) => {
    const beforeData = snap.before.data();
    const afterData = snap.after.data();
    const afterVisit = afterData.allVisitsToApp || [];
    const beforeVisit = beforeData.allVisitsToApp || [];
    const userId = snap.after.id;

    console.log(`userId = ${userId}`);
    if (afterVisit.length !== beforeVisit.length) {
        console.log(`Changed allVisitsToApp trigger`);
        console.log(`${beforeData.allVisitsToApp} - ${afterData.allVisitsToApp}`)
        return;

    } else {

        const isUpdatedAtChanged = beforeData.updatedAt !== afterData.updatedAt;
       
        if (isUpdatedAtChanged) {
            console.log(`Changed updatedAt occured`);
            // get user fcm "token" field and set to "tokens" array
            const updatedAt = afterData.updatedAt;
            if (!updatedAt) {
                console.log(`No updatedAt field`);
                return "No updatedAt field";
            }
            // set tokens array in firestore fcmTokens collection
            await db.collection("fcmTokens").doc(userId).set({
                allVisitsToApp: FieldValue.arrayUnion(updatedAt),
            }, { merge: true }
            );
            console.log(`Wrote sucessfully`);
            return;

        }


    }




    // const isVisitsChanged = afterData.allVisitsToApp != beforeData.allVisitsToApp;
    // const isUpdatedAtChanged = beforeData.updatedAt != afterData.updatedAt;

    // /// ignoring call if allVisitsToApp is the only field that changed
    // if (isVisitsChanged) {
    //     console.log(`No change in allVisitsToApp`);
    //     return "No change in allVisitsToApp";
    // }

    // const userId = snap.after.id;
    // if (isUpdatedAtChanged) {
    //     // get user fcm "token" field and set to "tokens" array
    //     const updatedAt = afterData.updatedAt;
    //     if (!updatedAt) {
    //         console.log(`No updatedAt field`);
    //         return "No updatedAt field";
    //     }

    //     // set tokens array in firestore fcmTokens collection
    //     await db.collection("fcmTokens").doc(userId).set({
    //         allVisitsToApp: FieldValue.arrayUnion(updatedAt),
    //     }, { merge: true }
    //     );

    // }

    console.log(`onUserFcmCollectionUpdate executed succesfully`);
    return "Executed Succesfully!";
};

module.exports = {
    onUserFcmCollectionUpdate
}