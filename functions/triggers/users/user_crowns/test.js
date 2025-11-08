const { Timestamp } = require("firebase-admin/firestore");
const {onCrownCreate} = require("./user_crown_functions.js");


const call = async ()=> {
    await testMockCrownCreate();
}

const testMockCrownCreate = async () => {
    try{
        const snap = {
            data: () => {
                return {
                    postId: "10092",
                    senderId: "Ny8YaSxRL1bTTUCiRuK1PGJVzQl1",
                    createdAt: Timestamp.now(),
                }
            }
        }
        const context = {
            params: {
                userId: "O9ntjktGj6XvrrcWjP6ElQ05eXe2"
            }
        }
    const result = await onCrownCreate(snap, context);

    console.log("Test passed", result);
    }catch(e){
        console.error(e);
    }

}


module.exports = {
    call
}