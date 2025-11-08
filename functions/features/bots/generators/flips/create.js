

const { FLIPS } = require('./data.js')
let bots = [];
const createFlips = async () => {
    await ___fetchAllBots();

    for await (const flip of FLIPS) {
        const bot = await _fetchRandomBot();
        if(!bot) continue;
        flip.author = _convertBotToAuthor(bot);
        await db.collection('flips').add(flip)
    }

}

async function ___fetchAllBots() {
    const _bots = await db.collection('users').where('isBot', '==', true).get()
    bots = _bots.docs.map(doc => doc.data())
}

async function _fetchRandomBot() {
    /// Fetch all bots if not already fetched
    if (bots.length === 0) bots = await ___fetchAllBots();

    /// Return a random bot
    return bots[Math.floor(Math.random() * bots.length)]
}

function _convertBotToAuthor(bot) {
    if (bot.cubeId) {
        return {
            "name": bot.name,
            "dob": bot.dob,
            "uid": bot.uid,
            "cubeId": bot.cubeId,
            "isBot": true,
        }
    }

}

module.exports  = {
    createFlips
}