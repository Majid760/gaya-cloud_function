const { OpenAI } = require("openai")
const apiKey = require("./../configs/api_keys.js").OPENAI_API_KEY;
const openai = new OpenAI({ apiKey: apiKey });
const admin = require("firebase-admin");
const firebaseStorage = admin.storage();
const os = require('os');
const fs = require('fs')


/**
 * Generate speech file using OpenAI Text to Speech API
 * @param {string} postId - ID of the post
 * @param {string} text - Text to convert into speech
 * @returns {Promise<string>} - Path to the generated speech file
 */
const generateSpeechFile = async (postId, text) => {
    const path = os.tmpdir();
    const speechFilePath = `${path}/${postId}.mp3`;
    try {
        const mp3 = await openai.audio.speech.create({
            model: "tts-1",
            voice: "nova",
            input: text,
        });
        const buffer = Buffer.from(await mp3.arrayBuffer());
        fs.writeFileSync(speechFilePath, buffer);
        return speechFilePath;
    } catch (error) {
        console.error("Error generating speech file:", error);
        throw error;
    }
};

/**
 * Generate transcript using OpenAI Audio API
 * @param {string} postId - ID of the post
 * @param {string} audioFile - Path to the audio file
 * @returns {Promise<OpenAI.Audio.Transcriptions.Transcription>} - The transcription object
 */
const generateTranscript = async (postId, audioFilePath) => {
    try {
        const transcription = await openai.audio.transcriptions.create({
            file: fs.createReadStream(audioFilePath),
            model: "whisper-1",
            response_format: "verbose_json",
            timestamp_granularities: ["segment"],

        });
        return transcription;
    } catch (error) {
        console.error("Error generating transcript:", error);
        throw error;
    }
};

/**
 * Write speech file to Firebase Storage
 * @param {string} postId - ID of the post
 * @param {string} filePath - Path to the file to be uploaded
 * @returns {Promise<string>} - The URL of the uploaded audio file
 */
const writeToStorage = async (postId, filePath) => {
    const bucket = firebaseStorage.bucket();
    const toPath = `posts/${postId}/tts.mp3`;

    try {
        let file = await bucket.upload(filePath, { destination: toPath, predefinedAcl: 'publicRead' });
        console.log("File uploaded to storage:", file);
        return file[0].metadata.mediaLink;
        // const trimUrl = file[0].metadata 
    } catch (error) {
        console.error("Error uploading file to storage:", error);
        throw error;
    }
};

/**
 * Main function to generate speech, transcript, and upload audio to storage
 * @param {string} postId - ID of the post
 * @param {string} text - Text to convert into speech
 * @returns {Promise<{ audioUrl: string, transcript: any }>} - Audio URL and transcript
 */
const tts = async (postId, text) => {
    try {
        const speechFile = await generateSpeechFile(postId, text);
        const transcript = await generateTranscript(postId, speechFile);
        const audioUrl = await writeToStorage(postId, speechFile);

        return {
            audioUrl: audioUrl,
            transcript: transcript.segments
        };
    } catch (error) {
        console.error("Error in TTS function:", error);
        throw error;
    }
};

module.exports = tts;