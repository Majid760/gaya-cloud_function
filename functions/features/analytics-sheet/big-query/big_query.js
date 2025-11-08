// Create a BigQuery client explicitly using service account credentials.
// by specifying the private key file.
const { BigQuery } = require('@google-cloud/bigquery');
const {ADMIN_CREDENTIAL} = require('../../../configs/api_keys.js');

const options = {
    //TODO:Badar: Remove when deploying to production
    // keyFilename: '/Volumes/dumb/girl-z-cloudfunctions/functions/girlz-dev-3233fb523984.json',
    projectId: 'girlz-dev',
};
const TABLE_NAME = '\`girlz-dev.analytics_404477080.events_*\`' 
const bigquery = new BigQuery({
    projectId: options.projectId,
    credentials: ADMIN_CREDENTIAL
});

/**
 * A helper function to run a query against BigQuery.
 * 
 * @param {String} query - The SQL query to run against BigQuery
 * @returns {Promise<Array>} rows - The rows returned from the query
 */
const runBigQuery = async (query) => {
    // Run the query
    const options = {
        query: query,
    };

    const [job] = await bigquery.createQueryJob(options);
    const [rows] = await job.getQueryResults();

    console.log(`\nQuery Results: ${rows.length}`);
    return rows;
};

module.exports = {
    runBigQuery,
    TABLE_NAME
}