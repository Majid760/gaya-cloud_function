const { GOOGLE_API_KEY } = require('./../../configs/api_keys.js');
const { google } = require('googleapis');

const DISCOVERY_URL = 'https://commentanalyzer.googleapis.com/$discovery/rest?version=v1alpha1';
const TOXICITY_THRESHOLD = 0.8;
const SEXUALLY_EXPLICIT_THRESHOLD = 0.8;

/**
 * Analyzes a comment for toxicity and sexual explicitness.
 * @param {String} comment - Comment to analyze
 * @returns {Promise<Boolean>} - True if comment is inappropriate
 */
const analyzeComment = async (comment) => {

    try {
        const response = await _analyzePerspectiveCall(comment); 

        const isToxic = _getToxicityScore(response) > TOXICITY_THRESHOLD;
        const isSexuallyExplicit = _getSexuallyExplicitScore(response) > SEXUALLY_EXPLICIT_THRESHOLD;


        /// If any of the scores are above the threshold, mark the comment as inappropriate
        return isToxic || isSexuallyExplicit;

    } catch (error) {
        console.error('Error analyzing comment:', error.message);
        return false;
    }
};

/**
 * Client for the Perspective API. 
 * 
 * @param {String} comment - Comment to analyze
 * @returns {Promise<Object>} - True if comment is inappropriate 
 */
const _analyzePerspectiveCall = async (comment) => {
    const client = await google.discoverAPI(DISCOVERY_URL);
    const analyzeRequest = {
        comment: { text: comment },
        requestedAttributes: { TOXICITY: {}, SEXUALLY_EXPLICIT: {} },
        doNotStore: true,
    };

    return await client.comments.analyze({
        key: GOOGLE_API_KEY,
        resource: analyzeRequest,
    });
};

/**
 * Extracts the toxicity score from the Perspective API response.
 * @param {Object} response - Perspective API response
 * @returns {number} - Toxicity score
 */
const _getToxicityScore = (response) => response.data.attributeScores.TOXICITY.summaryScore.value;

/**
 * Extracts the sexually explicit score from the Perspective API response.
 * @param {Object} response - Perspective API response
 * @returns {number} - Sexually explicit score
 */
const _getSexuallyExplicitScore = (response) => response.data.attributeScores.SEXUALLY_EXPLICIT.summaryScore.value;


module.exports = {
    analyzeComment,
};