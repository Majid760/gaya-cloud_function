const axios = require('axios');

/**
 * 
 * @param {Object} postPayload 
 * Must have:
   {
    post_id: <string | int>,
    post_payload : {
        ALL AVAILABLE FIELDS IN POST OBJECT OF QDRANT
     }
 }
 * @returns 
 */
 const updateAiPost = async (postPayload) => {
    const baseURL = process.env.BTL_AI_BASE_URL || 'https://btl-ai-pysan3qssq-uc.a.run.app';
    let headers = { 'Content-Type': 'application/json' };

    try {
        const payload = JSON.stringify(postPayload);
        console.log("Payload For Update: ", payload)
        const response = await axios.patch(`${baseURL}/post`, payload, {
            headers: headers,
        });

        console.log("Response From Update: ", response.data);
        return response.data;
    } catch (error) {
        throw new Error(`Error while updating AI post: ${error.message}`);
    }
}


module.exports = {
    updateAiPost
}