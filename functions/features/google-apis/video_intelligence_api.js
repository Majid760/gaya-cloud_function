const functions = require('firebase-functions');
const axios = require('axios');
const productionServiceAccFile = require("../../girlz-dev-3233fb523984.json")
// Imports the Google Cloud Video Intelligence library
// Imports the Videointelligence library
const { VideoIntelligenceServiceClient } = require('@google-cloud/video-intelligence').v1;
const analyzeVideo = async (videoUri) => {
    try {
        console.log("trying...")
        const videointelligenceClient = new VideoIntelligenceServiceClient(
            {
                projectId: 'girlz-dev',
                keyFilename: "./girlz-dev-3233fb523984.json"
            }
        );
        // https://firebasestorage.googleapis.com/v0/b/girlz-dev.appspot.com/o/posts%2Fvideos%2FiDeNZ18KAaMTBdxN2PIJWQ8mRZn2%2F32dbdea7-9c9a-4159-9d89-2b979ff69bfc?alt=media&token=47e55c3b-e82f-474f-9a71-4e44bec44693
        // The GCS uri of the video to analyze
        var gcsUri = convertFirebaseUrlToGcsUrl(videoUri);
        const request = {
            inputUri: gcsUri,
            features: ['EXPLICIT_CONTENT_DETECTION'],
        };
        // Execute request
        const [operation] = await videointelligenceClient.annotateVideo(request);
        console.log(
            'Waiting for operation to complete... (this may take a few minutes)'
        );
        const [operationResult] = await operation.promise();
        // Gets annotations for video
        const annotations = operationResult.annotationResults[0];
        // Gets labels for video from its annotations
        const explicitResult = annotations.explicitAnnotation;
        const result = containsNudity(explicitResult);
        console.log('Explicit annotation results:', result);
        return {
            isFlagged:result
        }
    } catch (error) {
        console.error('Error calling Video Intelligence API:', JSON.stringify(error));
        return {
            isFlagged:false
        }
    }
};
function convertFirebaseUrlToGcsUrl(firebaseUrl) {
    // var gcsUri = 'gs://girlz-dev.appspot.com/posts/videos/iDeNZ18KAaMTBdxN2PIJWQ8mRZn2/32dbdea7-9c9a-4159-9d89-2b979ff69bfc';
    // Parse the URL to extract the domain, bucket, and path
    const urlRegex = /https:\/\/firebasestorage\.googleapis\.com\/v0\/b\/([^/]+)\/o\/([^?]+)\?/;
    const match = firebaseUrl.match(urlRegex);
    if (!match || match.length < 3) {
        throw new Error('Invalid Firebase URL');
    }
    // Decode the URI component for paths that may include encoded characters (like spaces, etc.)
    const bucketName = match[1];
    const filePath = decodeURIComponent(match[2]);
    // Construct the Google Cloud Storage URL
    return `gs://${bucketName}/${filePath}`;
}
function containsNudity(videoAnalysisResults) {
    const likelihoods = [
        'UNKNOWN',
        'VERY_UNLIKELY',
        'UNLIKELY',
        'POSSIBLE',
        'LIKELY',
        'VERY_LIKELY',
      ];
    var isNude = false; // Default assumption
    const frames = videoAnalysisResults.frames;

    // Check if any frame has a pornography likelihood of "LIKELY" or "VERY_LIKELY"
    for (const frame of frames) {
        console.log(JSON.stringify(frame));
        const likelihood = frame.pornographyLikelihood;
        const result = likelihoods[likelihood]

        if (result === 'LIKELY' || result === 'VERY_LIKELY') {
            isNude = true; // Nudity detected
            break;
        }
    }
    return isNude; // Return the result based on analysis
}

module.exports = {
    analyzeVideo,
};