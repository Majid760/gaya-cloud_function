const { REST_API_KEY } = require('../../configs/api_keys.js');
const axios = require('axios');
const baseURL = 'https://api-prod-ws7ku6426a-nw.a.run.app/api/tts';


/**
 * create TTS data
 * 
 * @param {String} - audioURL
 * @param {Object} - transcript
 * 
 */
const createTTSForPostById = async (postId, audioURL, transcript) => {
    const payload = {
        audioURL: audioURL,
        audioTranscript: transcript
    };
    console.log("createTTSForPostById", payload);
    console.log(`${baseURL}/${postId}?apiKey=${REST_API_KEY}`);
    const response = await axios.post(`${baseURL}/${postId}?apiKey=${REST_API_KEY}`, payload);
    return response.data; 
}


module.exports = {
    createTTSForPostById
}