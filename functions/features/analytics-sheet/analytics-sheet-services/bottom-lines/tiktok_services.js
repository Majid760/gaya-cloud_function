const tiktokService = require('../../../../common/tiktok-api-services/tiktok_services.js');
const analyticsService = require('../analytics_sheet_services.js');
const DEFAULT_SHEET_ID = '11cXM4DM_eL6q_nOhlD-Rtna0OOm1xdxH6Rr8cJgnGPs';
const NEW_SHEET_ID = '14YVUuK9tG_sCuiDqVfID_2HLx9WYVn5X3uRtTmv_jrk';


/**
 * Get and write tiktok stats to google sheet.
 * Fetches from TikTok Reporting Api.
 */
const runDailtTiktokStats = async () => {

    // Step 1: Get User Auth Code
    let userAuthCode = await tiktokService.getUserAuthCodeHTTP();
    if (!userAuthCode) return;
    
    // Step 2: Get User Access Token
    let userAccessToken = await tiktokService.getUserAccessTokenHTTP(userAuthCode);
    if (!userAccessToken) return;

    // const userAccessToken = "4f99cb81f6d70e0367f409f78c64bf460361d0de";

    // Step 3: Get Daily Tiktok Stats
    let dailyTiktokStats = await tiktokService.getDailyTiktokStatsHTTP(userAccessToken);
    if (!dailyTiktokStats) return;

    // Step 4: Get Raw Data for Google Sheet
    let tiktokGoogleSheetRawData = [];
    tiktokGoogleSheetRawData = await getTiktokGoogleSheetRawData(dailyTiktokStats);
    if (!tiktokGoogleSheetRawData) return;

    const sheetName = 'TikTok Stats'; // 'cohort - Weekly Users and Their Messages';
    const sheetId = DEFAULT_SHEET_ID;

    // Step 5: Write Daily Tiktok Stats to Google Sheet
    await analyticsService.writeRawDataIntoGoogleSheet(tiktokGoogleSheetRawData, sheetName, sheetId, 'A5');

}


/**
 * Get Raw data for google sheet.
 * @param {array} dailyStats
 * @returns {Promise<array>} - daily tiktok stats
 */
const getTiktokGoogleSheetRawData = async (dailyStats) => {

    try {

        let impressions = 0;
        let clicks = 0;
        let conversion = 0;

        for (let i = 0; i < dailyStats.data.list.length; i++) {
            let item = dailyStats.data.list[i].metrics;
            console.log("item: ", item);

            if (item.impressions) {
                impressions += parseInt(item.impressions);
            }

            if (item.clicks) {
                clicks += parseInt(item.clicks); 
            }

            if (item.conversion) {
                conversion += parseInt(item.conversion);
            }
        }

        let dailyTiktokStats = {
            impressions,
            clicks,
            conversion,
             
            ctr: ((clicks / impressions) * 100).toFixed(2),
            // fix to 2 decimal places
            overallConversionPercentage: ((conversion / impressions) * 100).toFixed(2)
        }

        console.log("dailyTiktokStats: ", dailyTiktokStats);

        let finalList = [];

        // Add a header row
        const headerRow = [
            `TikTok Stats (${new Date().toISOString().split('T')[0]})`,
            'Impressions',
            'Clicks',
            'Conversions',
            'CTR (Impressions Clicks Rate)',
            'Overall Conversion Percentage',
        ];

        finalList.push(headerRow);

        let bodyRow = [];

        if (dailyTiktokStats) {
            let imperessions = dailyTiktokStats.impressions;
            let clicks = dailyTiktokStats.clicks;
            let conversion = dailyTiktokStats.conversion;
            let ctr = dailyTiktokStats.ctr;

            // if imression and conversion is valid then calculate overall conversion percentage 
            let overallConversionPercentage = dailyTiktokStats.overallConversionPercentage;

            bodyRow.push('');
            bodyRow.push(imperessions);
            bodyRow.push(clicks);
            bodyRow.push(conversion);
            bodyRow.push(`${ctr || 0}%`);
            bodyRow.push(`${overallConversionPercentage || 0}%` || `0%`);

            finalList.push(bodyRow);
        }

        if (finalList.length > 0) return finalList;

    } catch (error) {
        console.log("erroroccured in getTiktokGoogleSheetRawData(): " + error)
    }
}



module.exports = {
    runDailtTiktokStats
}

