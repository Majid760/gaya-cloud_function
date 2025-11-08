const { OpenAI } = require('openai');
const admin = require('firebase-admin');
const db = admin.firestore();

/**
 * Check if a thread exists, if not create one.
 * @param {OpenAI} openai 
 * @returns {Promise<OpenAI.Beta.Threads.Thread?>} thread
 */
const getThread = async (openai) => { 

    let thread;

    // Step 1.1: Check if any threads exist
    const threadId = await _getAThreadFirestore();
    if (threadId) {
        thread = await _getAThreadOpenAI(openai, threadId);
        if (thread) return thread;
    }


    // Step 1.2: Create a new thread if none exists
    thread = await openai.beta.threads.create();
    if (!thread) throw new Error('Thread not created');
    console.log('🔥 Thread created: ', thread);

    // Step 1.3: Save the thread to firestore for later use
    _saveAThreadFirestore(thread);

    return thread;
};

/**
 * @param {OpenAI.Beta.Assistants.Assistant} assistant
 * @param {OpenAI.Beta.Threads.Thread} thread
 * 
 * @returns {Promise<OpenAI.Beta.Threads.Run?>} run
 */
const runAThread = async (openai, assistant, thread) => {
    if (!assistant) throw new Error('Assistant not found');
    if (!thread) throw new Error('Thread not found');

    const run = await openai.beta.threads.runs.create(
        thread.id,
        {
            assistant_id: assistant.id,
            instructions: assistant.instructions,
        }
    );

    if (!run) throw new Error('Run not created');

    return run;
}

/**
 * Add a message to a thread
 * @param {OpenAI} openai 
 * @param {OpenAI.Beta.Threads.Thread} thread
 * @param {string} message - The message to be added to the thread
 * 
 * @returns {Promise<OpenAI.Beta.Threads.Message?>} threadMessage
 */
const addMessageToThread = async (openai, thread, message) => {

    if (!thread) throw new Error('Thread not found');
    if (!message) throw new Error('Message not found');

    /// Step 3: Add a message to the thread
    const threadMessage = await openai.beta.threads.messages.create(
        thread.id,
        {
            role: "user",
            content: message
        }
    );

    if (!threadMessage) throw new Error('Message not created');
    return threadMessage;
}






/******************************************************************************
 *                      Helper functions for getThread - BELOW
 ******************************************************************************/

const _getAThreadFirestore = async () => {
    const thread = await db.collection('openAI').doc('threads').get();
    return thread;

};

const _saveAThreadFirestore = (thread) => {
    if (!thread) throw new Error('Could not save thread to firestore because thread is null');
    return db.collection('openAI').doc('threads').set(thread);
}

/** 
 * @param {*} openAI  
 * @returns {Promise<OpenAI.Beta.Threads.Thread?>} thread 
 */
const _getAThreadOpenAI = async (openai, threadId) => { 

    try{
        let thread;

        // Step 1.1: Check if any threads exist
        thread = await openai.beta.threads.retrieve(threadId);
    
        return thread;
    } catch (error) {}
  
}


module.exports = {
    getThread,
    runAThread,
    addMessageToThread
}