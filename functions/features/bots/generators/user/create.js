///
/// Create Bots In Firebase
///

const generators = require('./generator.js');
const admin = require('firebase-admin');
const auth = admin.auth();


const generateProfiles = async () => {
    for (let i = 0; i < 1; i++) {
        const email = `bot${i}@girlz.app`;
        const password = `bot${i}girlz!`;
        var userData = await ___createUserWithEmailAndPass(email, password, true); 
        console.log(`Created Bot: ${i} - ${userData.uid}`);
        admin.firestore().collection('users').doc(userData.uid).set(userData, { merge: true });
    }
}


/**
 * Generates random profile data and creates a user with email and password
 * and stores it into firestore + auth
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<admin.auth.UserRecord>} authUser
 */
async function ___createUserWithEmailAndPass(email, password, hasInterests) {

    let user = {};
    user = generators.generateFemaleProfile(hasInterests);

    user.email = email;
    user.password = password;
    user.region = 'US';
    user.emailVerified = true;
    user.createdAt = new Date().getTime();
    user.dob = new Date(new Date().setFullYear(new Date().getFullYear() - 13)).getTime();
    await fakeDelay(500);
     const authUser =  await auth.createUser(user);
     return {
            uid: authUser.uid,
            ...user
     }
};

const fakeDelay = (ms) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, ms)
    })
}

module.exports = {
    generateProfiles
}