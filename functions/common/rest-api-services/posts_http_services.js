const { REST_API_KEY } = require('../../configs/api_keys.js');
const axios = require('axios');
const baseURL = 'https://api-prod-ws7ku6426a-nw.a.run.app/api/posts';
const devBaseURL = "https://api-dev-ws7ku6426a-nw.a.run.app/api/posts";

/**
 * Get Post By Id
 * @param {string} postId - post id
 * @returns {Object}
 */
const get = async (postId) => {
    try {
        const response = await axios.get(`${baseURL}?id=${postId}&apiKey=${REST_API_KEY}`);
        return response.data;
    } catch (error) {
        console.error('Error getting post by Id:', error.message);
        throw error;
    }
};

/**
 * Get Post By Id
 * @param {string} postId - post id
 * @returns {Object}
 */
const getDev = async (postId) => {
    try {
        const response = await axios.get(`${devBaseURL}?id=${postId}&apiKey=${REST_API_KEY}`);
        return response.data;
    } catch (error) {
        console.error('Error getting post by Id:', error.message);
        throw error;
    }
};

/**
 * Update Post By Id
 * @param {string} postId - post id
 * @param {Object} post - post object
 * @param {boolean} isRankWeightage - is rank weightage
 * @returns {Object}
 */
const update = async (postId, post, isRankWeightage = false) => {
    try {
        const response = await axios.put(`${baseURL}/${postId}?apiKey=${REST_API_KEY}&isRankWeightage=${isRankWeightage}`, post);
        return response.data;
    } catch (error) {
        console.error('Error updating post by Id:', error.message);
        throw error;
    }
};

/**
 * Create A Post
 * 
 * @param {Object} post - post object
 * @returns {Object}
 */
const create = async (firebasePost) => {
    try { 
        const formattedDOB = formatDateToYYYYMMDD(firebasePost.author?.dob?.toDate());
        delete firebasePost.createdAt;
        delete firebasePost.updatedAt;
        firebasePost.author.dob = formattedDOB;  
        const payload = {
            'title': firebasePost.title,
            'content': firebasePost.content,
            'author': firebasePost.author,
            'backgroundImgURL' : firebasePost.backgroundImgURL,
            'region' : firebasePost.region,
            'group' : firebasePost.group,
            'tags' : firebasePost.tags,
            'answerTags' : firebasePost.chatGptGeneratedAnswers,
            'poll' : firebasePost.postPollData,
             'pollBy' : firebasePost.postPollBy, 
             "photoAuthorProfileURL" : firebasePost.photoAuthorProfileURL,
             "photoAuthor" : firebasePost.photoAuthor,
             "oldPostId" : firebasePost.oldPostId,


        }
        console.log(`Create Post Payload: ${JSON.stringify(payload)}`);
        const response = await axios.post(`${baseURL}?apiKey=${REST_API_KEY}`, payload);
        return response.data;
    } catch (error) {

        console.error('Error creating post:', error?.response?.data || error?.message || error); 
    }
}


/**
 * Get total unanswered count by postID  
 * 
 * @param {String} postID
 */
const getUnAnsweredCountByPostId = async (postID) => {
    try {
        const response = await axios.get(`${postAnswerURL}/${postID}?apiKey=${REST_API_KEY}`);
        return response.data;
    } catch (error) {
        console.error('Error getting post by Id:', error.message);
        throw error;
    }

}

const deleteAllPostsOfUser = async (userId) => {
    try {
        const response = await axios.delete(`${baseURL}/deleteAllPostsOfUser/${userId}?apiKey=${REST_API_KEY}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting all posts of user:', error.message);
        throw error;
    }
}

module.exports = {
    get, 
    update,
    create,
    getUnAnsweredCountByPostId,
    getDev
};

function formatDateToYYYYMMDD(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}
