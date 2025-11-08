const httpPostServices = require('./rest-api-services/analytics_http_services.js')

///
/// HTTP REQUESTS Get Daily Active Users Count
///  
/**
 * Get Daily Active Users Count
 */
const getDailyActiveUsersHTTP = async () => {
    return await httpPostServices.getDailyActiveUsersCount();
}


module.exports = {
    getDailyActiveUsersHTTP
}



