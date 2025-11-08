

const admin = require('firebase-admin');
const db = admin.firestore();


const invitationMessage = `
🌟 Exclusive Invite to "Girlz" - From One Amazing Girl to Another! 👭💖

Hey there, Extraordinary Lady!

I'm inviting you to join me inside the "Girlz" app, a space specially designed for remarkable women like us! 🌸✨

Feeling a little lonely? Need a supportive community of incredible women? "Girlz" is your answer, and I've reserved a spot just for you.

📲 Click here to download the "Girlz" app and accept my invitation: https://linktr.ee/Girlzapp or search 'Girlz App' in playstore/appstore.

Let's embark on this empowering journey together and be part of the "Girlz" community, where we uplift and inspire each other.
`;
const onTwillioMessageCreate = async (snap, context) => {
    const messageData = snap.data();
    // if(messageData.body === "Generating invitation link"){
         db.collection('messages').add({
            to: messageData.to,
            body:  invitationMessage,
        }); 
    // }
   
}

module.exports = {
    onTwillioMessageCreate
}