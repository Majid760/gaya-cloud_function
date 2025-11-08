///
/// Generates a new user profile data
///

const utils = require('../../../../utils/helpers.js')
const generator = require('./data.js');
const admin = require('firebase-admin');
const db = admin.firestore();
const timeStamp = admin.firestore.Timestamp;
/**
 * Generate Profile for Female 
 * @param {Boolean} interests - true if interests are to be generated 
 */
const generateFemaleProfile = ( interests = true ) => {
    const user = { 
        'interests': interests ? [_generateRandomInterest(), _generateRandomInterest()] : null,
        'name': _getFemaleNameEN(), 
        'profilePic': '',   
        'updatedAt':  utils.getCurrentDateTime(),
        'createdAt': utils.getCurrentDateTime(),
        'dob': _generateAge(), 
        'isBot': true,
    }

    return user;
}
 

/**
 * Generate Profile for Male
 * @param {Boolean} bio - true if bio is to be generated
 * @param {Boolean} interests - true if interests are to be generated
 * @param {Boolean} avatar - true if avatar is to be generated 
 */
const generateNBProfile = (bio = true, interests = true, avatar = true) => {
    const user = {
        'interests': interests ? [_generateRandomInterest(), _generateRandomInterest(), _generateRandomInterest(), _generateRandomInterest(), _generateRandomInterest()] : null,
        'name': _getMaleNameEN(),
        'bio': bio ? _getRandomAbout() : '',
        'profilePic': avatar ? _getRandomNBAvatar() : generator.DEFAULT_USER_AVATAR,
        'coverphoto': '',
        'admin': false,
        'phoneNumber': '',
        'userCreatedOn': utils.getCurrentDateTime(),
        'dob': _generateAge(),
        'fm_token': '',
        'isActive': false,
        'isBot': true,
    }

    return user;
}




const _generateRandomInterest = () => {
    const interests = generator.INTEREST_TOPICS;
    const interest = ___randGenerate(interests);
    return interest;
}

const _getFemaleName = () => {
    const first = generator.FEMALE_FIRSTNAME;
    const last = generator.FEMALE_LASTNAME;
    const firstName = ___randGenerate(first);
    const lastName = ___randGenerate(last);
    return `${firstName} ${lastName}`;
}

const _getMaleName = () => {
    const first = generator.MALE_FIRSTNAME;
    const last = generator.MALE_LASTNAME;
    const firstName = ___randGenerate(first);
    const lastName = ___randGenerate(last);
    return `${firstName} ${lastName}`;
}

const _getFemaleNameEN = () => {
    const first = generator.FEMALE_FIRSTNAME_EN;
    const last = generator.MALE_LASTNAME_EN;
    const firstName = ___randGenerate(first);
    const lastName = ___randGenerate(last);
    return `${firstName} ${lastName}`;
}

const _getMaleNameEN = () => {
    const first = generator.MALE_FIRSTNAME_EN;
    const last = generator.MALE_LASTNAME_EN;
    const firstName = ___randGenerate(first);
    const lastName = ___randGenerate(last);
    return `${firstName} ${lastName}`;
}

const _getRandomAbout = () => {
    const abouts = generator.ABOUTS;
    const about = ___randGenerate(abouts);
    return about;
}

const _getRandomFemaleAvatar = () => {
    const avatars = generator.FEMALE_AVATARS;
    console.log("avatars: ", avatars)
    const avatar = ___randGenerate(avatars);
    return avatar;
}

const _getRandomNBAvatar = () => {
    const avatars = generator.NB_AVATARS;
    const avatar = ___randGenerate(avatars);
    return avatar;
}

const _getRandomMaleAvatar = () => {
    const avatars = generator.MALE_AVATARS;

    const avatar = ___randGenerate(avatars);
    /// remove the URL from Male Avatars
    return avatar;
}

const _generateAge = () => {
    const ages = generator.AGE_LIMITS;
    const ageLimit = ___randGenerate(ages);
    return 17;
}



/**
 * 
 * @param {Array} arr 
 * @returns  random element from array
 */
const ___randGenerate = (arr) => {
    return arr[Math.floor(Math.random() * arr.length)];
}


 

module.exports = {
    generateFemaleProfile, 
    generateNBProfile,
}


