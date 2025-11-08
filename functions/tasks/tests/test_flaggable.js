
const {containsInappropriateWord} = require("../post_tasks.js");

const call = async () => {
    const title = "MUTUALS";
    const body= "PLEASE LIKE AND COMMENT ON MY TIKTOK- paiton_017682618 💕💕 I'm";
    const titleBody = `${title} - ${body}`;
    const isFlaggable = containsInappropriateWord(titleBody);
    console.log("isFlaggable:", isFlaggable);
}

module.exports = {call,}