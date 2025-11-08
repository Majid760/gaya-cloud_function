const { on } = require("connectycube/lib/cubeConfig");
const { onScreenshotCreate } = require("../screenshot_functions.js");
const { onSharePostCreate } = require("../share_post_functions.js");    


const call = ()=> {
    console.log('Hello World');
    testScreenshotCount();
}


const testScreenshotCount = async () => {
    const postId = '37785';


    // create payload for functions.firestore.QueryDocumentSnapshot 
    const snap = {
        data: () => {
            return {
                postId: postId
            }
        }
    }

    onScreenshotCreate(snap);
}


module.exports = {
    call
}