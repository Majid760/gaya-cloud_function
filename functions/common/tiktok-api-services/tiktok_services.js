const { TIKTOK_APP_ID, TIKTOK_SECRET_KEY, BASE_URL, V_2, V_3, AUTHORIZARION_URL} = require('./const.js');
const axios = require('axios');

/**
 * Get User Auth Code
 */
const getUserAuthCodeHTTP = async () => {
    try {

        const response = await axios.get(AUTHORIZARION_URL);

        console.log('response is:', response.headers);
    
        // Assuming the 'auth_code' is in the response headers
        const authCode = response.headers['auth_code']; // Note: header names are lowercase in axios response
    
        console.log('Auth Code:', authCode);

        return authCode;

    } catch (error) {
        console.error('Error getUserAuthCodeHTTP :', error);
        // throw error;
    }
};


/**
 * Get User Access token by auth code
 * @param {string} authCode - auth code
 * @returns {string} 
 */
const getUserAccessTokenHTTP = async (authCode) => {
    try {
        const config = {
            headers: {
              'app_id': TIKTOK_APP_ID, 
              'secret': TIKTOK_SECRET_KEY,
              'auth_code': authCode
            }
          };

        const response = await axios.get(`${BASE_URL}/${V_2}/oauth2/access_token/`, config);

        console.log('Response Data:', response.data);

        return response.data.access_token;
    } catch (error) {
        console.error('Error getting post by Id:', error.message);
        throw error;
    }
};

/**
 * Get Tiktok Stats
 * @param {string} accessToken - user access token
 * @returns {Object}
 */
const getDailyTiktokStatsHTTP = async (accessToken) => {
    try {

        let date = new Date();
        // new date set to januarry 16 20224
        date.setFullYear(2024, 1, 15);

        
        
        // save date as string like this: '2021-08-01'
        let startDate = date.toISOString().split('T')[0];
        let endDate = date.toISOString().split('T')[0];

        console.log('startDate:', startDate + ' endDate:', endDate);

        const dimensionsArray = ["ad_type"];
        const metricsArray = ["clicks","impressions", "conversion","ctr"];

        const config = {
            headers: {
              'Access-Token': accessToken
            }
            // ,
            // params: {
            //     'advertiser_id': '7322173778199412738',
            //     'page': '1',
            //     'data_level': 'AUCTION_AD',
            //     'report_type': 'BASIC',
            //     'start_date': startDate,
            //     'end_date': endDate,
            //     'metrics': metricsArray,
            //     'dimensions': dimensionsArray,
                
            // }
          };

        //   const response = await axios.get(`${BASE_URL}/${V_3}/report/integrated/get/`, config);
          const response = await axios.get(`https://business-api.tiktok.com/open_api/v1.3/report/integrated/get/?page=1&data_level=AUCTION_AD&report_type=BASIC&dimensions=["ad_type"]&metrics=["clicks","impressions", "conversion","ctr"]&start_date=2024-02-15&end_date=2024-02-15&advertiser_id=7322173778199412738` , config);

          console.log('Response Data:', response.data);

        return response.data;
    } catch (error) {
        console.error('Error in getDailyTiktokStatsHTTP() is: ', error);
        // throw error;
    }
};



module.exports = {
    getUserAuthCodeHTTP,
    getUserAccessTokenHTTP,
    getDailyTiktokStatsHTTP
};

// function formatDateToYYYYMMDD(date) {
//     const year = date.getFullYear();
//     const month = String(date.getMonth() + 1).padStart(2, '0');
//     const day = String(date.getDate()).padStart(2, '0');

//     return `${year}-${month}-${day}`;
// }
