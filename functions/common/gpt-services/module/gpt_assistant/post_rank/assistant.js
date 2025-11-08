const { OpenAI } = require('openai');
const { AssistantPostRanker, AssistantPostRankerDescrption } = require('./consts.js');




/**
 * 
 * @param {OpenAI} openai 
 * @returns {Promise<OpenAI.Beta.Assistants.Assistant>?} - Returns the assistant if it exists, otherwise null.
 */
const getAssistant = async (openai) => { 

    let assistant;
    // Step 1.1: Check if the assistant exists
    const assistants = await openai.beta.assistants.list();
    if (assistants && assistants.data) {
        assistant = assistants.data.find(assistant => assistant.name === AssistantPostRanker);
    }
    if (assistant) return assistant;

    // Step 1.2: Create the assistant
    assistant = await openai.beta.assistants.create({
        name: AssistantPostRanker,
        instructions: AssistantPostRankerDescrption,
        tools: [{ type: "code_interpreter" }],
        model: "gpt-4-1106-preview"
    });

    return assistant;
}


module.exports = {
    getAssistant
}
