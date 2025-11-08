const sendLoveMessageToSubscribedUsers = require('../love_message_sender.js')
const postServices = require('./../../../../common/post_services.js');
const utils = require('./../../../../utils/helpers.js')

const call = async ()=> {  
    
 
    let post = await postServices.getPostById('0MkAJkWAd23tmwsFbdWT'); 
    const author = {
        cubeId: 11028790, // Zariana cube id
        uid: `UEtPU8EJ1xe3wA3ZnJaP4Y5l6LY2`,
        name: 'Anonymous girl - 13'
    };


    // const title = 'Hi need advice';
    // const content = 'My boyfriend has a birthday today and he has very down lately - he doesnt event want to celebrate 🥲 how can I make him happy';
    // post.data().author.cubeId = author.cubeId;
    // post.data().author.uid = author.uid;
    // post.data().title = title;
    // post.data().content = content;
    // const mockPost = {
    //     data: ()=> {
    //         return {
    //             author: author,
    //             title: title,
    //             content: content
    //         }
    //     }
    // };
     sendLoveMessageToSubscribedUsers(post);
} 
module.exports = {
    call
}