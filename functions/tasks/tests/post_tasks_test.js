const postTasks = require("../post_tasks.js");


const call = async () => {
    const postId = "123";
    const post = {
        title: "Do you have shein 🌸🌸🌸🌸👛👛👛👛🩷🩷🩷🩷",
        content: "",
    }
    _testBartModel(post);

};

const _testInappropriateWord = async (post) => {

    const isFlagged = postTasks.containsInappropriateWord(post.title + " " + post.content);

    console.log(`isFlagged: ${isFlagged}`);
};

const _testBartModel = async ()=> {
    const prompt = "I love you";
    const isRankable = await postTasks._queryLLMBart(prompt);
    console.log(`isRankable: ${isRankable}`);
}

module.exports = {
    call
}