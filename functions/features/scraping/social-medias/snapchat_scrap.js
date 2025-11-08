// const axios = require('axios');
// const cheerio = require('cheerio');


// /**
//  * Scrapes an Snapchat profile.
//  * 
//  * @param {string} profileURL 
//  * @returns {Promise<{username: string?, pictureURL: string?}?>}
//  */
// async function scrapeSnapchatProfile(profileURL) {

//     if (!profileURL.includes('https://www.snapchat.com/')) throw new Error('Snapchat URL is not valid');

//     const response = await axios.get(profileURL);
//     const htmlContent = response.data;
//     const $ = cheerio.load(htmlContent);

//     const username = $('meta[property="og:title"]').attr('content');
//     const profilePictureUrl = $('meta[property="og:image"]').attr('content');

//     if (username || profilePictureUrl) {
//         return {
//             'pictureURL': profilePictureUrl,
//             'username': ___modifyUserName(username),
//         }
//     } else {

//         console.log('Failed to scrape data. The page structure may have changed.');
//         throw new Error('Failed to scrape data. The page structure may have changed.');
//     }

// }

// /**
//  * Extract the user's name from a raw username string.
//  *
//  * @param {string} rawUserName - The raw username string to extract the name from.
//  * @returns {string} The extracted user's name or the original raw username if no name is found.
//  */
// function ___modifyUserName(rawUserName) {
//     return rawUserName.replace(/ on Snapchat$/, '') || rawUserName;
//   }
  
  
// module.exports = scrapeSnapchatProfile;