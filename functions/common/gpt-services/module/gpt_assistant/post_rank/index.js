
const { getAssistant } = require('./assistant');
const { getThread, runAThread, addMessageToThread } = require('./thread');
const { OpenAI } = require('openai'); 

/**
 * Ranks a post as binary (0 or 1) using the OpenAI API.
 * 
 * @param {OpenAI} openai - An instance of the OpenAI class.
 * @param {string} message - The message to be processed.
 * 
 * @returns {Promise<number?>} binaryWeight - The binary weight of the post. 1 is yes, 0 is no.
 */
const rankPost = async (openai, message) => {
    try {
        if(!openai) throw new Error('OpenAI not found in rankPost');
        if(!message) throw new Error('Message not found in rankPost');
        console.log('Hitting rankPost');
        // Step 1: Get the assistant
        const assistant = await getAssistant(openai);

        // Step 2: Get the thread
        const thread = await getThread(openai);

        // Step 3: Add a message to the thread
        const threadMessage = await addMessageToThread(openai, thread, message);

        // Step 4: Run the assistant
        const run = await runAThread(openai, assistant, thread);

        // Step 5: Retry logic for checking if the Run is Completed
        let maxRetries = 10; // 10 retries * 2 seconds = 20 seconds max wait time for the run to complete 
        let completedRun;
        do {
            console.log('🔥 Checking run status...');
            if (maxRetries <= 0) throw new Error("Run failed after 10 retries");
            await new Promise(resolve => setTimeout(resolve, 2000));
            maxRetries--;
            completedRun = await openai.beta.threads.runs.retrieve(
                thread.id,
                run.id
            );
            console.log('⚠️ completedRun:', completedRun.status)
            if (completedRun.status === "failed") {
                throw new Error("Run failed");
            }
        } while (completedRun.status !== "completed");

        // Step 6: Retrieve the Assistant's Response
        const messages = await openai.beta.threads.messages.list(thread.id);
        const assistantResponse = messages.data.find(msg => msg.run_id === run.id);
        console.log('🔥 assistantResponse:', assistantResponse.content[0].text.value)

        // Extract the binary weight (0 or 1) from the response
        const binaryWeight = assistantResponse ? parseInt(assistantResponse.content[0].text.value) : null;

        // Return the binary weight
        return binaryWeight;

    } catch (error) {
        console.error('Error:', error.message);
        return null; // or handle the error as needed
    }
}

module.exports = {
    rankPost
}








// 
// OLDER Version of rankPost
//

/**

// * Ranks a post as binary (0 or 1) using the OpenAI API.
const postRankWeighager = async (content) => {
    try { 
        console.log('🔥 content:', content);
        // Step 1: Create an Assistant
        const assistant = await openai.beta.assistants.create({
            name: "Determines if a social media post should be shown or not.",
            instructions: "Determine if this post is not useful, or not interesting. Return 1 as yes or 0 for no only",
            tools: [{ type: "code_interpreter" }],
            model: "gpt-4-1106-preview"
        });
        // Assistant ID: asst_QCHcw7Tz5WJPiVF3oG5QC6PC

        // Step 2: Create a Thread
        const thread = await openai.beta.threads.create(); 

        // Step 3: Add a Message to a Thread
        const userMessage = await openai.beta.threads.messages.create(
            thread.id,
            {
                role: "user",
                content: content
            }
        );

        // Step 4: Run the Assistant
        const run = await openai.beta.threads.runs.create(
            thread.id,
            {
                assistant_id: assistant.id,
                instructions: "Determine if this post is not useful, or not interesting. Return 1 as yes or 0 for no only",
            }
        ); 

        // Step 5: Check if the Run is Completed
        let completedRun;
        do {
            console.log('🔥 Checking run status...');
            await new Promise(resolve => setTimeout(resolve, 2000));
            completedRun = await openai.beta.threads.runs.retrieve(
                thread.id,
                run.id
            );
            console.log('⚠️ completedRun:', completedRun.status)
            if (completedRun.status === "failed") {
                throw new Error("Run failed");
            }
        } while (completedRun.status !== "completed");

        // Step 6: Retrieve the Assistant's Response
        const messages = await openai.beta.threads.messages.list(thread.id); 
        const assistantResponse = messages.data.find(msg => msg.run_id === run.id); 
        console.log('🔥 assistantResponse:', assistantResponse.content[0].text.value)

        // Extract the binary weight (0 or 1) from the response
        const binaryWeight = assistantResponse ? parseInt(assistantResponse.content[0].text.value) : null;

        // Return the binary weight
        return binaryWeight;
    } catch (error) {
        console.error('Error:', error.message);
        return null; // return null or an appropriate error message in case of failure
    }
}

*/