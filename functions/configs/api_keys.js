require('dotenv').config();

/// CONNECTY CUBE S-KEYS
const CC_APP_ID = process.env.CC_APP_ID;
const CC_AUTH_KEY = process.env.CC_AUTH_KEY;
const CC_AUTH_SECRET = process.env.CC_AUTH_SECRET;

/// CONNECTY CUBE S-KEYS
const CC_APP_ID_DEV = process.env.CC_APP_ID_DEV;
const CC_AUTH_KEY_DEV = process.env.CC_AUTH_KEY_DEV;
const CC_AUTH_SECRET_DEV = process.env.CC_AUTH_SECRET_DEV;

const CC_ADMIN_API_KEY = process.env.CC_ADMIN_API_KEY;

/// Location API
const IP_CONFIG_API_KEY = process.env.IP_CONFIG_API_KEY;

/// GPT API 
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// REST API Key
const REST_API_KEY = process.env.REST_API_KEY;

// Google API Key
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

// Backend credentials
const base_url_prod = process.env.BASE_URL_PROD;
const apiKeyProd1 = process.env.API_KEY_PROD1;

// Note: ADMIN_CREDENTIAL should be loaded from environment variables
// For security, service account credentials should be stored as JSON in an environment variable
// Example: ADMIN_CREDENTIAL_JSON = process.env.ADMIN_CREDENTIAL_JSON
const ADMIN_CREDENTIAL = process.env.ADMIN_CREDENTIAL_JSON ? JSON.parse(process.env.ADMIN_CREDENTIAL_JSON) : null;

module.exports = {
  CC_APP_ID,
  CC_AUTH_KEY,
  CC_AUTH_SECRET,
  CC_APP_ID_DEV,
  CC_AUTH_KEY_DEV,
  CC_AUTH_SECRET_DEV,
  CC_ADMIN_API_KEY,
  IP_CONFIG_API_KEY,
  OPENAI_API_KEY,
  REST_API_KEY,
  GOOGLE_API_KEY,
  base_url_prod,
  apiKeyProd1,
  ADMIN_CREDENTIAL
};