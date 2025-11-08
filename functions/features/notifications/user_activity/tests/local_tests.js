const utils = require('../../../../utils/helpers.js');

const generateNotificationAccordingToTime = () => {
    const {getNotificationByTime} = require('../notification_generator.js');
    const now = new Date(); 
    const {title, body } = getNotificationByTime(now);
}
 



module.exports = {
    generateNotificationAccordingToTime
}