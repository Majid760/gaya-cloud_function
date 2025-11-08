const {getStaleTokens, clearTokens} = require('./../../common/notification_services.js');



/**
 * Remove stale tokens from the database - tokens that have not been updated for 30 days.
 * 
 * @returns {Promise<void>}
 */
exports.clearStaleFCMTokens = async function removeStaleTokens() { 
    /// get stale tokens
    const staleTokens = await getStaleTokens(); 

    /// clear tokens
    await clearTokens(staleTokens); 

}