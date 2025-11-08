const fs = require('fs');

/**
 * Convert and return message in decrypted format
 * @param {Object} message
 * @returns {Object} message
 */
function decryptMessage(message) {
    let currentMessage = message;
    try{
        let currentMessage = message;
        const messageContent = currentMessage.content;
        const decryptedMessage = JSON.parse(messageContent);
        currentMessage.content = decryptedMessage;
    }
    catch(_){
        console.log("Error occured at decryptMessage(): " + _);
    }
    return currentMessage;
}

const loadFile = (fileName) => {
    const data = fs.readFileSync(fileName, 'utf8');
    console.log(`${fileName} file loaded successfully :tada:`);
    return JSON.parse(data);
}

const makeFile = (fileName, data) => {
    fs.writeFile(fileName, JSON.stringify(data, null, 2), function (err) {
        if (err) return console.log(err);
        console.log(`${fileName} file created successfully :tada:`);
    }
    );
}

function convertFirebaseDateToJSDate(firebaseDate) {
    if (firebaseDate) {
        const date = firebaseDate.toDate();
        return date;
    }
    return null;
}

function getAgeFromDOB(dob) {
    const dobDate = convertFirebaseDateToJSDate(dob);
    if (dobDate) {
        const today = new Date();
        const birthDate = dobDate;
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();

        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }
    return null;
}

/**
 * Fetches current datetime
 * @returns {Date} current datetime
 */
function getCurrentDateTime(isTimestamp = false) {
    const currentTime = new Date();
    if (isTimestamp) {
        return currentTime.getTime() / 1000;
    }
    return currentTime;
}

/**
 * Converts Large array into smaller chunks of arrays
 *
 * @param {Array} array - Large array
 * @param {Number} chunkSize - Size of each chunk
 * @returns {Array} - Array of arrays
 *
 * @example
    {
       const array = [1,2,3,4,5,6,7,8,9,10];
         const chunkSize = 3;
         const result = chunkArray(array, chunkSize);
         console.log(result);
         /// [[1,2,3], [4,5,6], [7,8,9], [10]];
    }
 */
function chunkArray(array, chunkSize = 500) {
    const results = [];
    while (array.length) {
        results.push(array.splice(0, chunkSize));
    }
    return results;
}

const replaceAnonymousGirlWithGirl = (text) => {
    return text.replace(/Anonymous girl/g, 'girl');

}

/**
 * Get start and end times for the current day for use in a Firebase query.
 *
 * `Important Note`: This function is designed for bottom lines. It accounts for BigQuery's one-day lag.
 *
 * @param {boolean} isTimestamp - If true, returns the start and end times as Unix timestamps.
 *                               If false, returns them as Date objects.
 * @returns {{ start: Date | number, end: Date | number }} An object with 'start' and 'end' properties
 *  containing the start and end times of the current day.
 */
const getCurrentDayStartAndEndTime = (isTimestamp = false) => {
    const currentTime = getCurrentDateTime();
    /// Doing it bcs bigQuery is 1 day behind
    currentTime.setDate(currentTime.getDate() - 1); //// Revert to 1 day

    const currentDayStartTime = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate(), 0, 0, 0);
    const currentDayEndTime = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate(), 23, 59, 59);

    if (isTimestamp) {
        return { start: currentDayStartTime.getTime() / 1000, end: currentDayEndTime.getTime() / 1000 };
    }
    return { start: currentDayStartTime, end: currentDayEndTime };
}

/**
 * Get start and end times for the date send as parm for use in a Firebase query.
 *
 * `Important Note`: This function is designed for bottom lines. It accounts for BigQuery's one-day lag.
 * @param {Date} givenDate
 * @param {boolean} isTimestamp - If true, returns the start and end times as Unix timestamps.
 *                               If false, returns them as Date objects.
 * @returns {{ start: Date | number, end: Date | number }} An object with 'start' and 'end' properties
 *  containing the start and end times of the current day.
 */
const getStartAndEndTimeForGivenDate = (givenDate, isTimestamp = false, ) => {
    
    let currentTime = givenDate;

    const currentDayStartTime = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate(), 0, 0, 0);
    const currentDayEndTime = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate(), 23, 59, 59);

    if (isTimestamp) {
        return { start: currentDayStartTime.getTime() / 1000, end: currentDayEndTime.getTime() / 1000 };
    }
    return { start: currentDayStartTime, end: currentDayEndTime };
}

/**
 * Fetch current week from now to 7 days ago
 *
 * @returns {{ start: Date, end: Date }} An object with properties 'start' and 'end' containing the start and end times of the current week.
 */

const getCurrentWeekStartAndEndTime = (isTimestamp = false) => {
    const currentTime = getCurrentDateTime();
    const currentWeekStartTime = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate() - 7, 0, 0, 0);
    const currentWeekEndTime = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate(), 23, 59, 59);

    if (isTimestamp) {
        return { start: currentWeekStartTime.getTime() / 1000, end: currentWeekEndTime.getTime() / 1000 };
    }
    return { start: currentWeekStartTime, end: currentWeekEndTime };
}





const getCurrentDateYYYYMMDD = () => {
    const now = getCurrentDateTime();
    const year = now.getFullYear(); // Get the current year
    const month = (now.getMonth() + 1).toString().padStart(2, '0'); // Get the current month (add 1 because months are zero-indexed)
    const day = now.getDate().toString().padStart(2, '0'); // Get the current day of the month

    const YYYYMMDD = `${year}${month}${day}`;

    return YYYYMMDD;
};


const getDifferenceInSecondsFromNow = (date) => {
    const now = new Date();
    const diffInMilliseconds = date.getTime() - now.getTime();
    const diffInSeconds = diffInMilliseconds / 1000;
    return diffInSeconds;
};

/**
 * 
 * @returns {Date} - local time
 */
function getCurrentTimeWithOffset(tzOffsetSeconds) {
    // Get the current time in UTC
    const currentTimeUTC = new Date();

    // Calculate the local time by adding the timezone offset
    const localTime = new Date(currentTimeUTC.getTime() + tzOffsetSeconds * 1000);

    // Return the timestamp in milliseconds
    return localTime;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;

}

function convertToMySQLDate(date) {
    return date.toISOString().slice(0, 19).replace('T', ' ');
}

module.exports = {
    convertFirebaseDateToJSDate,
    getAgeFromDOB,
    getCurrentDateTime,
    chunkArray,
    replaceAnonymousGirlWithGirl,
    getCurrentDayStartAndEndTime,
    getCurrentWeekStartAndEndTime,
    loadFile,
    makeFile,
    getCurrentTimeWithOffset,
    getCurrentDateYYYYMMDD,
    getDifferenceInSecondsFromNow,
    getRandomInt,
    decryptMessage,
    getStartAndEndTimeForGivenDate,
    convertToMySQLDate
}