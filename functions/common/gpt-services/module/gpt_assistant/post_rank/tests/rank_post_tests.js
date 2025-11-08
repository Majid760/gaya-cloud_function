const rankPost= require('./../../../../gpt.js').rankAPostAssistant;
// const {rankAPostAssistant} = require('./../../../../gpt.js');
const posts = [
    "Im bored, is there anyone who is good and can talk with me here?", // 1
    "What is the best way to make money online?", // 1
    "Wtf? I hate real people!", // 0
    "Go to hell!", // 0
    "asdasdasdasd" // 0
];
/**
 * Test rankPost functionality with content
 * Rank a post will return 0 or 1 or null if error
 * If content is good it will return 1 otherwise 0
 */
const call = async () => {
    // singlePostTest();
    unitTest();
};



const singlePostTest = async () => {
    console.log('🔥 Testing rankPost...'); 
    const content = posts[0];
    const resp1 = await rankPost(content); 
    const resp2 = await rankPost(posts[2]); 
    _logTestCase('Single Test', 1, resp1);
    _logTestCase('Single Test resp2', 1, resp2);
    console.log('All tests Completed! 🎉✅'); 
    
}

const unitTest = async () => {
    console.log('🔥 Testing rankPost...');
  

    const post1 = posts[0];
    const post2 = posts[1];
    const post3 = posts[2];
    const post4 = posts[3];
    const post5 = posts[4];

    /// Individual tests
    // const resp1 = await rankPost(post1);
    // console.log(`🔥 Individual resp1: ${resp1}`);
    // _logTestCase('Individual resp1', 0, resp1);

    // const resp2 = await rankPost(post2); 
    // _logTestCase(resp2, 0, 'Response should be 1 for a positive post');

    // const resp3 = await rankPost(post3);
    // console.log(`🔥 Individual resp3: ${resp3}`);
    // _logTestCase(resp3, 1, 'Response should be 0 for a negative post');

    // const resp4 = await rankPost(post4);
    // console.log(`🔥 Individual resp4: ${resp4}`);
    // _logTestCase(resp4, 1, 'Response should be 0 for a negative post');

    // const resp5 = await rankPost(post5);
    // console.log(`🔥 Individual resp5: ${resp5}`);
    // _logTestCase(resp5, 1, 'Response should be 0 for a negative post');



    /// Parallel tests
    const promises = [rankPost(post1), rankPost(post2), rankPost(post3), rankPost(post4), rankPost(post5)];
    const results = await Promise.all(promises);

    _logTestCase('Parallel resp1', 0, results[0]);
    _logTestCase('Parallel resp2', 0, results[1]);
    _logTestCase('Parallel resp3', 1, results[2]);
    _logTestCase('Parallel resp4', 1, results[3]);
    _logTestCase('Parallel resp5', 1, results[4]);

    console.log('All tests passed! 🎉✅');
}




const _logTestCase = (testCase, expected, actual) => {
    console.log(`🤖🤖🤖 ${testCase} Expected: ${expected} Actual: ${actual} ${expected === actual ? '✅' : '❌'} 🤖🤖🤖`);
};
module.exports = {
    call
}