const {getScollPostsAverageByUsersCount} = require('../big-query/queries/scroll_posts_average_from_gcp.js');


/**
 * Show the number of posts scrolls by average.
 * Fetches from bigQuery
 * 
 * @returns {Promise<Number>} - The number of posts scrolls by average.
 */
const getScollPostsAverageByUsers = async () => {
    
    const count = await getScollPostsAverageByUsersCount();

    return count;
}


module.exports = { getScollPostsAverageByUsers };
