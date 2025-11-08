// /**
//  * LLM Service that uses the Facebook BART model (https://huggingface.co/facebook/bart-large-mnli).
//  */


// const fetch = require('node-fetch');

// /**
//  * 
//  * @param {string} prompt 
//  * @returns {Promose<boolean>} isRankable
//  */
// const queryLLMBart = async (prompt) => {
//     let isRankable = true;
//     try{
//         const response = await query(prompt); 
//          isRankable = isPostRankAble(response); 
//     }catch(_){
//         console.error("Error querying the model", _);
//         isRankable = false;

//     }

//     return isRankable;

// }



// /**
//  * Query the model with a prompt.
//  * @param {string} prompt The prompt to query the model with.
//  */
// async function query(prompt) {
//     const body = {
//         "inputs": prompt,
//         "parameters": {
//             // Max 10 labels
//             "candidate_labels": [
//                 "boring", "prompt response", "toxic", "promotion"
//             ],
//         }
//     };

//     const response = await fetch(
//         "https://wvchhko4wbb62ss7.us-east-1.aws.endpoints.huggingface.cloud",
//         {
//             method: "POST",
//             headers: {
//                 Authorization: "Bearer [HUGGING_FACE_TOKEN]",
//                 "Content-Type": "application/json"
//             },
//             body: JSON.stringify(body),
//         }
//     );

//     const result = await response.json(); 
//     console.log("BART API result: ", result);
//     return sortResponse(result);
// }

// /**
//  * Sort the response by label scores.
//  * @param response The response from the model.
//  * @returns {Array<{label: string, score: number}>} Sorted response.
//  */
// function sortResponse(response) {
//     // Combine labels and scores into an array of objects
//     const labeledScores = response.labels.map((label, index) => ({
//         label,
//         score: response.scores[index]
//     }));

//     // Sort the labeledScores array based on scores in descending order
//     labeledScores.sort((a, b) => b.score - a.score);
//     return labeledScores;
// } 
// /**
//  * 
//  * @param {*} response 
//  * @returns {boolean} isRankable
//  */
// const isPostRankAble = (response) => {

//     let isRankable = true;
//     response.forEach((res) => {
//         if (res.label === "boring" && res.score > 0.5) {
//              isRankable = false;
//         } else if (res.label === "promotion" && res.score > 0.8) {
//              isRankable = false;
//         } else if (res.label === "sexual" && res.score > 0.8) {
//              isRankable = false;
//         }
//         else if (res.label === "prompt response" && res.score < 0.6) {
//              isRankable = false;
//         }
//     });

//     return isRankable; 
// }
// module.exports = {
//     queryLLMBart
// }