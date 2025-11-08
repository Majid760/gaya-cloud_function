const { REST_API_KEY } = require('../../configs/api_keys.js');
const axios = require('axios');
const baseURL = 'https://api-prod-ws7ku6426a-nw.a.run.app';
const DevBaseURL = 'https://api-dev-ws7ku6426a-nw.a.run.app';

const endPoint = "/api/crowns/user"



/**
 * Insert crowns for a user.
 * 
 * Crown object structure:
 * {
 *     userId: string,
 *     createdAt: string,
 *     crownedBy: string,
 *     postId: int
 * }
 * 
 * @param {Object} crownData - Crown data containing userId, createdAt, crownedBy, and postId.
 */
const insertUserCrown = async (crownData) => {
    try {
        const response = await axios.post(`${baseURL+endPoint}/${crownData.userId}?apiKey=${REST_API_KEY}`, crownData);
        return response.data;
    } catch (error) {
        console.error('Error inserting crowns:', error.message);
        throw error;
    }
};





module.exports = {
    insertUserCrown
}