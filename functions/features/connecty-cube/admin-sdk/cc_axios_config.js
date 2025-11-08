const axios = require('axios');
const {CC_ADMIN_API_KEY} = require('./../../../configs/api_keys.js');
const instance = axios.create({
  baseURL: 'https://api.connectycube.com',
  headers: {
    'CB-Administration-API-Key': CC_ADMIN_API_KEY,
  },
});

module.exports = instance;