const admin = require("firebase-admin");
const db = admin.firestore();
const { posts } = require("./collection_consts.js")
const httpPostServices = require('./rest-api-services/posts_http_services.js')
const httpCommentServices = require('./rest-api-services/comment_http_services.js')

/**
 * Get Post By Id 
 * @returns {Promise<admin.firestore.DocumentSnapshot<admin.firestore.DocumentData>>} - post document snapshot
 * @param {String} postId - post id
 */
const getPostById = async (postId) => {
    return await db.collection(posts).doc(postId).get();
}

/**
 * Get All Posts By LIMIT
 * 
 * @param {Number?} limit - limit the number of posts to be returned
 * @returns {Promise<admin.firestore.QuerySnapshot<admin.firestore.DocumentData>>} - query snapshot
 */

const getAllPosts = async (limit) => {
    let query = db.collection(posts);
    if (limit) query = query.limit(limit);
    return await query.get();
}


/**
 * Add ai answers to a post 
 * @param {string} postId - post id
 * @param {array} answers - answers list

 */
const addAiAnswersToPost = async (postId, answers) => {
    await db.collection(posts).doc(postId).set({
        'answerTags': answers,
    }, { merge: true });

    addAiAnswersToPostHTTP(postId, answers);
}

//[HTTP] 
const addAiAnswersToPostHTTP = async (postId, answers) => {
    try {
        await updatePostByIdHTTP(postId, { answerTags: answers });
    } catch (_) { 
        console.log(`Error [addAiAnswersToPostHTTP]: ${_}`);
    }

}



/**
 * 
 * @param {string} postId - post id
 * @param {Number} number - either 0 or 1 [0 = not ranked, 1 = ranked]
 */
const rankAPostByNumber = async (postId, number) => {  

    try{
        rankAPostByNumberHTTP(postId, number);
    }catch(_){}

}
///
/// HTTP REQUESTS Post
///  
/**
 * Get Post By Id
 */
const getPostByIdHTTP = async (postId) => {
    return await httpPostServices.get(postId);
}
///
/// HTTP REQUESTS Post
///  
/**
 * Get Post By Id
 */
const getPostByIdHTTPDev = async (postId) => {
    return await httpPostServices.getDev(postId);
}

/**
 * //[HTTP] 
 * Update Post By Id
 */
const updatePostByIdHTTP = async (postId, post) => {
    return await httpPostServices.update(postId, post);
}

/**
 * //[HTTP]
 * RANK A POST BY NUMBER
 */
const rankAPostByNumberHTTP = async (postId, number) => {
    try {
        return await httpPostServices.update(postId, { isRanked: number }, true);

    } catch (_) {
        console.log(`Error [rankAPostByNumberHTTP]: ${_}`);
    }
}

/**
 * //[HTTP] 
 * Create A Post
 */
const createPostHTTP = async (post) => {
    return await httpPostServices.create(post);
}

/**
 * Get total un answered count of post
 * 
 * @param {String} postID
 * @returns {Promise<Number>} result
 */
const getUnAnsweredCountByPostId = async (postID) => {
    try {
        const response = await httpPostServices.getUnAnsweredCountByPostId(postID)
        return response.data || 0;
    } catch (error) {
        console.error('Error getting unanswered count by post id:', error.message);
        return 0;
    }
}


/**
 * Insert a comment for a post.
 * 
 * Comment object structure:
   {
        postId: string,
        content: string,
        author: {
            dob: string,
            cubeId: string,
            uid: string,
        }
   }
 */
const insertAComment = async (commentData) => {
    try {
        return await httpCommentServices.insertAComment(commentData);
    } catch (error) {
        console.error('Error inserting comment:', error.message);
        throw error;
    }

}


module.exports = {
    getPostById,
    getAllPosts,
    addAiAnswersToPost,
    rankAPostByNumber,
    updatePostByIdHTTP,
    getPostByIdHTTP,
    createPostHTTP,
    addAiAnswersToPostHTTP,
    rankAPostByNumberHTTP,
    getUnAnsweredCountByPostId,
    insertAComment,
    getPostByIdHTTPDev
}



