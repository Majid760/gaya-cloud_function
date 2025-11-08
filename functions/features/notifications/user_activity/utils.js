const utils = require('../../../utils/helpers.js');
const enumActivityType = {
    HIGH_ACTIVITY: 'HIGH_ACTIVITY',
    MEDIUM_ACTIVITY: 'MEDIUM_ACTIVITY',
    LOW_ACTIVITY: 'LOW_ACTIVITY',
}

/**
 * 
 * @param {Object} type 
 * @returns {enumActivityType} - type
 */
const transformActivityType = (type) => {
    if(!type) throw new Error(`Invalid activity type: ${type}`);

    if(typeof type !== 'number') type = parseInt(type);
    console.log(`transformActivityType: ${type}, type: ${typeof type}`);
    if(type > 10) return enumActivityType.HIGH_ACTIVITY;
    if(type >=3 && type <= 10) return enumActivityType.MEDIUM_ACTIVITY;
    if(type < 3) return enumActivityType.LOW_ACTIVITY; 
}

 
/**
/**
 * Returns a randomized task list with specified length.
 * Each task in the list is an object containing properties:
 * - hourRange: An array representing the range of hours for the task.
 * - messageCategory: A string indicating the category of the message.
 * 
 * @param {Number} desiredLength - The desired length of the task list.
 * @returns {Array} - A randomized task list with the specified length.
 * 
 * @example
  {
    const taskList = getRandomizedTaskList(3);
    console.log(taskList);
    /// [
    ///     { hourRange: [ 4, 6 ], messageCategory: 'Motivational' },
    ///     { hourRange: [ 12, 14 ], messageCategory: 'ThoughtProvoking' },
    ///     { hourRange: [ 16, 18 ], messageCategory: 'Motivational' }
    /// ]
  
  }
 */
const getRandomizedTaskList = (desiredLength) => {
    const taskList = [
        { hourRange: [4, 6], messageCategory: 'Motivational' },
        { hourRange: [12, 14], messageCategory: 'ThoughtProvoking' },
        { hourRange: [16, 18], messageCategory: 'Motivational' },
        { hourRange: [19, 21], messageCategory: 'ThoughtProvoking' },
        { hourRange: [22, 24], messageCategory: 'Motivational' },
    ];

    // Shuffle the taskList array to randomize the order
    for (let i = taskList.length - 1; i > 0; i--) {
        const j = utils.getRandomInt(0, i + 1);
        [taskList[i], taskList[j]] = [taskList[j], taskList[i]];
    }

    /// Return a sliced array with the 
    /// desired length (Making sure not to exceed the length of the original array)
    return taskList.slice(0, Math.min(desiredLength, taskList.length));
};

const getFixTaskList = ()=> {
    return [
        /// 8am - 12pm
        { hourRange: [8, 12], messageCategory: 'Random' },
        /// 2pm - 6pm
        { hourRange: [14, 18], messageCategory: 'SeekingAdvice' },
        /// 9pm - 1am
        { hourRange: [21, 1], messageCategory: 'HelpingOthers' }, 
    ];
}

module.exports = {
    transformActivityType,
    enumActivityType,
    getRandomizedTaskList,
    getFixTaskList
}