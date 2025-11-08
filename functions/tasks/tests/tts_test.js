const tts = require("../tts");


const call = async (postId, text) => {
    const id = postId ?? "123";
    const content = text?? "This is a test text, which is to be converted into speech. how are you doing today?";
    return await tts(id, content);
}
 

module.exports = {
    call
}