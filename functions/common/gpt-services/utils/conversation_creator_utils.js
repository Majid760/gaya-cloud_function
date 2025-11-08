
const topics = ['Ask question', 'recommendations', 'tips', 'thoughts', 'advice', 'girly problem', 'dress']
const generateConversationCreatorPromp = () => {
    return `Idea for a post as girl for ${topics[Math.floor(Math.random() * topics.length)]}: 
    Title: [Title Here]
    Description: [Description Here] 
    `;
}

function separateTitleAndDescription(text) {
    const lines = text.split('\n');
    let title = '';
    let description = '';

    for (const line of lines) {
        if (line.startsWith('Title: ')) {
            title = line.replace('Title: ', '').trim();
        } else if (line.startsWith('Description: ')) {
            description = line.replace('Description: ', '').trim();
        }
    }

    console.log('Title: ', title);
    console.log('Description: ', description);
    return { title, description };
}

module.exports = {
    generateConversationCreatorPromp,
    separateTitleAndDescription
}