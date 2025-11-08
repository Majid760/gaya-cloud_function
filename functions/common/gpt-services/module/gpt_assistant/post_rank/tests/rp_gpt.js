//
//Ranking a post with usual GPT instead of using custom or assitant GPT
//

 
const {analyzeComment} = require('../../../../../../features/google-apis/perspective_api.js');

const rankAPostGPT = async (post) => {
 const isToxic = await analyzeComment(post);

 return {
    binaryWeight: isToxic ? 0 : 1,
 }
}
const call = async () => {
    unitTest();
    // singlePostTest();

}
const singlePostTest = async () => { 
    const resp1 = (await rankAPostGPT(posts[1])).binaryWeight; 
    const resp2 = (await rankAPostGPT(posts[8])).binaryWeight;
    _logTestCase('Single Test', 1, resp1);
    _logTestCase('Single Test resp2', 0, resp2);
    console.log('All tests Completed! 🎉✅');
}
const unitTest = async () => {
    console.log('🔥 Testing rankAPostGPT...');


    const post1 = posts[0]; // 1
    const post2 = posts[1]; // 1
    const post3 = posts[2]; // 0
    const post4 = posts[3]; // 0
    const post5 = posts[4]; // 1
    const post6 = posts[5]; // 1
    const post7 = posts[6]; // 1
    const post8 = posts[7]; // 0
    const post9 = posts[8]; // 1
    const post10 = posts[9]; // 1
    const post11 = posts[10]; // 0
    const post12 = posts[11]; // 0
    const post13 = posts[12]; //1
    const post14 = posts[13]; // 0



    /// Individual tests
    const resp1 = (await rankAPostGPT(post1)).binaryWeight;
    _logTestCase(resp1, 1, post1, 1); // im bored

    const resp2 = (await rankAPostGPT(post2)).binaryWeight;
    _logTestCase(resp2, 1, post2, 2); // make money

    const resp3 = (await rankAPostGPT(post3)).binaryWeight;
    _logTestCase(resp3, 0, post3,3); // wtf

    const resp4 = (await rankAPostGPT(post4)).binaryWeight; 
    _logTestCase(resp4, 0, post4, 4); // go to hell

    const resp5 = (await rankAPostGPT(post5)).binaryWeight; 
    _logTestCase(resp5, 1, post5, 5); // asdasdasdasd

    const resp6 = (await rankAPostGPT(post6)).binaryWeight; 
    _logTestCase(resp6, 1, post6, 6); // stay informed

    const resp7 = (await rankAPostGPT(post7)).binaryWeight; 
    _logTestCase(resp7, 1, post7, 7); // lonely

    const resp8 = (await rankAPostGPT(post8)).binaryWeight; 
    _logTestCase(resp8, 1, post8, 8); // snap

    const resp9 = (await rankAPostGPT(post9)).binaryWeight;
    _logTestCase(resp9, 1, post9, 9); // add me on snap

    const resp10 = (await rankAPostGPT(post10)).binaryWeight;
    _logTestCase(resp10, 1, post10, 10); // secret crush

    const resp11 = (await rankAPostGPT(post11)).binaryWeight;
    _logTestCase(resp11, 0, post11, 11); // hit me


    const resp12 = (await rankAPostGPT(post12)).binaryWeight;
    _logTestCase(resp12, 0, post12, 12); // video call horny

    const resp13 = (await rankAPostGPT(post13)).binaryWeight;
    _logTestCase(resp13, 1, post13, 13); // period pain

    const resp14 = (await rankAPostGPT(post14)).binaryWeight;
    _logTestCase(resp14, 1, post14, 14); // buy best bras or penties
    



    // /// Parallel tests
    // const promises = [rankAPostGPT(post1), rankAPostGPT(post2), rankAPostGPT(post3), rankAPostGPT(post4), rankAPostGPT(post5)];
    // const results = await Promise.all(promises);

    // _logTestCase('Parallel resp1', 1, results[0]);
    // _logTestCase('Parallel resp2', 1, results[1]);
    // _logTestCase('Parallel resp3', 0, results[2]);
    // _logTestCase('Parallel resp4', 0, results[3]);
    // _logTestCase('Parallel resp5', 0, results[4]);

    console.log('All tests completed! 🎉');
}





const posts = [
    "Im bored, is there anyone who is good and can talk with me here?", // 1 => index 0
    "What is the best way to make money online?", // 1 => index 1
    "Wtf? I hate real people!", // 0 => index 2
    "Go to hell!", // 0 => index 3
    "asdasdasdasd", // 0 => index 4
    "How do you stay informed and involved in global issues, and what's an issue that deeply concerns you?", // 1 => index 5
    "Im lonely i need gf my instagram @ABface343", // 1 => index 6
    "my snap scarlet_roses23 & im hrny asf im also in the showwer and i have toys", // 1 => index 7
    "Add me on snap: @bahado97", // 0 => index 8
    "Having a secret crush on my sugar daddy", // 0 => index 9
    "My boyfriend always hit me, rape me what should I do?", // 0 => index 10
    "Video call? im horny", // 0 => index 11,
    "Period pain, im bleeding should I see doctor???", // 1 => index 12,
    "Where can I buy best bras or penties", // 1 => index 13,
    "I like toys anyone wanna join?", // 1 => index 14,
];

const _logTestCase = (actual, expected, data, index) => {

    console.log(`[Index: ${index}] 🤖 Expected: [${expected}] Actual: [${actual}] => ${expected === actual ? '✅' : '❌'} 🤖, Post: [${data}]`);
};



module.exports = {
    call
}