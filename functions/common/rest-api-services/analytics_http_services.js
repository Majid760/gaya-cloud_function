const { REST_API_KEY } = require('../../configs/api_keys.js');
const axios = require('axios');
const baseURL = 'https://api-prod-ws7ku6426a-nw.a.run.app/api/analytics/dau';

/**
 * Get Daily Active Users Count
 */
const getDailyActiveUsersCount = async () => {
    try {
        const response = await axios.get(`${baseURL}?apiKey=${REST_API_KEY}`);
        return response.data;
    } catch (error) {
        console.error('Error getting post by Id:', error.message);
        throw error;
    }
};



module.exports = {
    getDailyActiveUsersCount
};