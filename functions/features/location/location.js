const KEY = require('./../../configs/api_keys.js').IP_CONFIG_API_KEY;
const axios = require("axios");


/**
 * Fetches Callable's location and returns country code
 * 
 * @returns {Object} - {countryISO: <The 2 letter ISO 3166-1 alpha-2 code associated with this IP>}
 * */
const getLocation = async (_, __) => { 
    const URL = `https://api.ipregistry.co?key=${KEY}`;
    const response = await axios.get(URL);

    /// if response is not present then return default country
    const payload = { statusCode: 200, countryISO: 'US', response: {}};


    console.log(response.data.location.region.name);
    /// validate response and return country code
    if (response && response.data && response.data.location.region && response.data.location.region.name) {
        payload.region = response.data.location.region.name ?? 'US';
        payload.response = response.data.location;
    }

    return payload; 
};

module.exports = getLocation