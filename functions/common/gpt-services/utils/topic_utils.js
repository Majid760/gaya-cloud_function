/**
 * 
 * @param {String} content - Title of the post 
 * @returns {String} - User prompt to be fed into the chat-gpt-api
 */
function generateUserPrompt(content) {

    return `Given a brief topic, please provide tags or keywords that are relevant to it atleast 10. These tags will help categorize and organize the content.

  "${content}". Output should be in the format "topics = ['', '',]"`;

};

/**
 * 
 * @param {String} inputString - String to extract an array from
 * @returns {Array} - Array extracted from the input string
 */
function extractAnArrayFromString(inputString) {
    let array = [];
    // Extract the topics array using string manipulation
    const startIndex = inputString.indexOf("['");
    const endIndex = inputString.lastIndexOf("']");
    if (startIndex !== -1 && endIndex !== -1) {
        const topicsString = inputString.substring(startIndex + 2, endIndex);
        const topics = topicsString.split("', '");
        array = topics;
    }
    return array;
}

module.exports = {
    generateUserPrompt,
    extractAnArrayFromString
}