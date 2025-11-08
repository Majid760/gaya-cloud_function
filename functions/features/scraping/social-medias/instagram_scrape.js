// const axios = require('axios');
// const cheerio = require('cheerio');
// const instaHeaders = { 
//   'User-Agent': 'Instagram 64.0.0.14.96', 
//   'Cookie': "sessionid=1563679440%3AeJQxROcRf2gDfU%3A13%3AAYf6zLgvdYYJMfbWZkgc5dbriAo4xr8Rm3uLP-cqfg;" 
//  };

// /**
//  * Scrapes an Instagram profile.
//  * 
//  * @param {string} profileURL 
//  * @returns {Promise<{username: string?, pictureURL: string?}?>}
//  */
// async function scrapeInstagramProfile(profileURL) {
//   if (!profileURL.includes('https://www.instagram.com/')) {
//     throw new Error('Invalid Instagram URL');
//   }

//   // Attempt to scrape the profile data from two sources.
//   let profileData = await _scrapeTryOne(profileURL)

//   if (!profileData) {
//     profileData = await _scrapeTryTwo(profileURL);
//     console.log("profileData (try two): " + profileData);
//   }

//   if (profileData) {
//     return profileData;
//   } else {
//     console.log('Failed to scrape data. The page structure may have changed.');
//     throw new Error('Failed to scrape data. The page structure may have changed.');
//   }
// }

// async function _scrapeTryOne(profileURL) {

//   const response = await axios.get(profileURL, {
//     // headers: instaHeaders
//   }).catch((e) => { console.log('Error in _scrapeTryOne(): ', e) });

//   const htmlContent = response.data;
//   const $ = cheerio.load(htmlContent);

//   // console.trace("htmlContent is: " + htmlContent); 
//   const username = $('meta[property="og:title"]').attr('content');
//   const profilePictureUrl = $('meta[property="og:image"]').attr('content');
//   console.log("username is: " + username + " profilePictureUrl is: " + profilePictureUrl);
//   if (username || profilePictureUrl) {
//     return {
//       'pictureURL': profilePictureUrl,
//       'username': ___modifyUserName(username),
//       'metadata': 't1'
//     }
//   }
// }

// async function _scrapeTryTwo(profileURL) {

//   const response = await axios.get(profileURL + '/?__a=1&__d=dis', {
//     headers: instaHeaders, 
//   },

//   ).catch((e) => { console.log('Error in _scrapeTryTwo(): ', e) });
//   if (!response || !response.data || !response.data.graphql || !response.data.graphql.user) return;

//   const userData = response.data.graphql.user;
//   const username = userData.full_name;
//   const profilePictureUrl = userData.profile_pic_url_hd;

//   if (username || profilePictureUrl) {
//     return {
//       'pictureURL': profilePictureUrl,
//       'username': username,
//       'metadata': 't2'
//     }
//   }
// }


// /**
//  * Extract the user's name from a raw username string.
//  *
//  * @param {string} rawUserName - The raw username string to extract the name from.
//  * @returns {string} The extracted user's name or the original raw username if no name is found.
//  */
// function ___modifyUserName(rawUserName) {
//   try {
//     // Regular expression to extract the name (text before the first opening parenthesis '(')
//     const regex = /^([^(@]+)/;
//     const match = rawUserName.match(regex);

//     if (match) {
//       // The captured group at index 1 contains the name
//       const name = match[1].trim();
//       return name;
//     } else {
//       // No match was found, return the original raw username
//       return rawUserName;
//     }
//   } catch (error) {
//     console.error("An error occurred: " + error);
//     // Return the original raw username in case of an error
//     return rawUserName;
//   }
// }







// module.exports = scrapeInstagramProfile;