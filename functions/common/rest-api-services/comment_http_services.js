const { REST_API_KEY } = require('../../configs/api_keys.js');
const axios = require('axios');
const baseURL = 'https://api-prod-ws7ku6426a-nw.a.run.app';
const DevBaseURL = 'https://api-dev-ws7ku6426a-nw.a.run.app';

const endPoint = "/api/comments"


// data: {
//     "postId": postId,
//     "content": comment,
//     "author": {
//       "dob": appUser.dob?.toIso8601String().substring(0, 10) ?? "",
//       "cubeId": appUser.cubeId,
//       "uid": appUser.uId,
//     }
//   },
/**
 * Insert comment for a post.
 * 
 * Crown object structure:
 *  {
      postId: string,
      content: string,
      author: {
            dob: string,
            cubeId: string,
            uid: string,
        }
    }
 * 
 * @param {Object} commentData - Comment data containing postId, content, and author.
 */
const insertAComment = async (commentData) => {
    try {
        const response = await axios.post(`${baseURL+endPoint}?apiKey=${REST_API_KEY}`, commentData);
        return response.data;
    } catch (error) {
        console.error('Error inserting crowns:', error.message);
        throw error;
    }
};





module.exports = {
    insertAComment
}