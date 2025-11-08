
/**
 * Get A Notification based on DateTime
 * 
 * @param {Date} date
 * @returns {Object} - notification {title, body}
 */
const getNotificationByTime = (date) => {
    const hour = date.getHours();
    console.log(`ℹ️ [getNotificationByTime] hour: ${hour}`);
    let notification = {};

    if ((hour >= 8 && hour <= 12)) {
        console.log(`8am - 12am`);
        notification = generateMorningNotification();
    } else if ((hour >= 14 && hour <= 18)) {
        /// 2pm - 6pm
        notification = generateAfternoonNotification();
    } else if ((hour >= 21 && hour <= 1)) {
        /// 9pm - 1am
        notification = bonusSayings();
    } else {
        notification = bonusSayings();
    }
    return notification;
};

/**
 * Generate a Morning Notification 
 * 
 * @description Morning (8-10am): 1 motivational "Mind Sharing" or "Helping Others"
 * @returns {string: title, string: body}
 */
const generateMorningNotification = () => {
    const sayings = mindSharingSayings.concat(seekingAdviceSayings);
    const saying = sayings[Math.floor(Math.random() * sayings.length)];
    return saying;
}


/**
 * Generate a  Midday Notification
 * 
 * @description Midday (12-2pm): 1 thought-provoking "Mind Sharing" or "Seeking Advice"
 * @returns {string: title, string: body}
 */
const generateMiddayNotification = () => {
    const sayings = mindSharingSayings.concat(seekingAdviceSayings);
    const saying = sayings[Math.floor(Math.random() * sayings.length)];
    return saying;
}


/**
 * Generate a Afternoon Notification
 * 
 * @description Afternoon (4-6pm): 1 connection-oriented "Meeting New Friends" or personalized "Bonus"
 * @returns {string: title, string: body}
 */
const generateAfternoonNotification = () => {
    const sayings = meetingNewFriendsSayings.concat(seekingAdviceSayings);
    const saying = sayings[Math.floor(Math.random() * sayings.length)];
    return saying;
}

/**
 * Generate a Evening Notification
 * 
 * @description Evening (7-9pm): 1 light and playful "Bonus" (optional)
 * @returns {string: title, string: body}
 */
const generateEveningNotification = () => {
    const sayings = bonusSayings;
    const saying = sayings[Math.floor(Math.random() * sayings.length)];
    return saying;
}

/**
 * Generate a Night Notification
 * 
 * @description Night (10pm-1am): 1 late-night "Mind Sharing" or "Seeking Advice" (for night owls)
 * @returns {string: title, string: body}
 */
const generateNightNotification = () => {
    const sayings = mindSharingSayings.concat(seekingAdviceSayings);
    const saying = sayings[Math.floor(Math.random() * sayings.length)];
    return saying;

}



const mindSharingSayings = [
    {
        'title': 'Share your thoughts. 🌸',
        'body': `Need to get something off your chest?`,
    },
    {
        'title': `Need to vent?`,
        'body': 'Write it all down on girlz. 🤫',
    },
    {
        'title': `Mind dump time!`,
        'body': 'Someone might resonate. 💖',
    }
];

const seekingAdviceSayings = [
    {
        'title': `Need to vent?`,
        'body': 'Write it all down on BTL 🤫',
    },
    {
        'title': `Need to vent?`,
        'body': 'Girls are online now and ready to help',
    },
    {
        'title': `Need advice?`,
        'body': `Help is just a click away`,
    },
    {
        'title': `Need different perspectives?`,
        'body': `Let's hear it! 💡`,
    },
    {
        'title': `What pissed you off today?`,
        'body': `We here to help `,
    },
    {
        'title': `Need to get something off your chest?`,
        'body': `Share your thoughts. 🌸`,
    },
    {
        'title': `Mind dump time!`,
        'body': `Someone might resonate. 💖`,
    }
]

const helpingOtherSayings = [
    {
        'title': 'Someone on BTL needs your help',
        'body': 'Help her now. ✨',
    },
    {
        'title': "Are you everyone's unofficial therapist?",
        'body': 'girls need you right now!',
    },
    {
        'title': 'Someone needs your help!💗',
        'body': "Here's a post we think you can help with",
    },
    {
        'title': 'Drama!',
        'body': "someone needs help",
    },
    {
        'title': 'Get a crown for helping someone 👑', 
    }
];

const meetingNewFriendsSayings = [
    {
        'title':'Find your tribe. 👭',
        'body':  'Girl gang expansion time!',
    },
    {
        'title':'Start a conversation. 👋', 
        'body': 'Say hello to someone new!',
    },
    {
        'title': 'Connect with amazing girls worldwide!🌎',
        'body': 'Join for global connections!'
    }
];

const bonusSayings = [
    {
        'title': 'Vibe check',
        'body': 'How are you feeling?',
    },
    {
        'title': `Bored?`,
        'body': 'Start a conversation. 👋',
    },
    {
        'title': `Reminder`,
        'body': "It's just a bad day - not a bad life💗",
    },
    {
        'title': `Reminder`,
        'body': "The world's girls are here for you 🌸",
    },
    {
        'title': `Reminder`,
        'body': "Be a light in this world ✨",
    },
    {
        'title': "Don't miss today's 999+ new posts!", 
    },
    {
        'title': 'A friend from your contact list has just joined BTL!',
    },
];


module.exports = {
    generateMorningNotification,
    generateMiddayNotification,
    generateAfternoonNotification,
    generateEveningNotification,
    generateNightNotification,

    getNotificationByTime
}