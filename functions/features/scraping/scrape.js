// const scrapeInstagramProfile = require('./social-medias/instagram_scrape.js');
// const scrapeSnapchatProfile = require('./social-medias/snapchat_scrap.js');
// const functions = require("firebase-functions");
// const IG_URL = 'https://www.instagram.com/';
// const SC_URL = 'https://www.snapchat.com/add/';

// /**
//  * 
//  * @param {functions.https.Request} req 
//  * @param {functions.Response} res
//  */
// const scrapeProfileHTTPs = async (req, res) => {
//     try {
//         ///pick from queryParam
//         // const type = req.query.type;
//         const data = req.query;
//         console.log('data: ', data);

//         /// Validate input data & Scrape the profile.
//         const response = await scrapeProfile(data);
//         console.log('response: ', response);

//         res.status(200).send(response);
//     } catch (error) {
//         console.log("Error in scrapeProfileHTTPs(): " + error);
//         res.send({
//             error: error.message, 
//         });
//     }

// }


// /**
//  * Scrape a social media profile.
//  *
//  * @param {object} data - An object with 'type' and 'username' keys.
//  * @param {string} data.type - 'instagram' or 'snapchat'.
//  * @param {string} data.username - The profile's username.
//  *
//  * @returns {Promise<{username: string?, pictureURL: string?}?>} 
//  *
//  * @throws {Error} If 'type' is not 'instagram' or 'snapchat'. 
//  * 
//  * Example:
//  * 
//  * const data = {
//  *   type: 'instagram',
//  *   username: 'example_username'
//  * };
//  * 
//  * scrapeProfile(data)
//  *   .then(result => {
//  *     console.log('Scraped Data:', result);
//  *   })
//  *   .catch(error => {
//  *     console.error('Error:', error.message);
//  *   });
//  */
// async function scrapeProfile(data) {
//     const { type, username } = data;

//     if (!type || !username) throw new Error('Invalid input data');

//     if (type === 'instagram') {
//         const url = IG_URL + username;
//         return await scrapeInstagramProfile(url);
//     } else if (type === 'snapchat') {
//         const url = SC_URL + username;
//         return await scrapeSnapchatProfile(url);
//     } else {
//         throw new Error(`Invalid type: ${type}`);
//     }
// }


// module.exports = { scrapeProfile, scrapeProfileHTTPs }