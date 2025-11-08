/**
 * 
 * @param {String} content - Title of the post 
 * @returns {String} - User prompt to be fed into the chat-gpt-api
 */
function generateTagPrompt(content) {

    return `Given a brief topic, please provide tags or keywords that are relevant to it atleast 10. These tags will help categorize and organize the content.
  
    "${content}". Output should be in the format "topics = ['', '',]"`;
  
  }; 


  module.exports = {
    generateTagPrompt,

  }