// const rankingPostPrompt = (content) => {
//     return `
//     Filter out promotional or irrelevant content for the 'Girlz' app feed. Given the input text:
//     "${content}"
    
//     Return '1' if the content is suitable for the Girlz app feed, and '0' if it contains promotions or is deemed irrelevant.
    
//     Consider the following factors:
//     1. Relevance to the 'Girlz' theme.
//     2. Presence of explicit promotional language or links.
//     3. Overall quality and engagement potential.
    
//     For personal concerns and support, also consider:
//     4. Providing empathetic and supportive responses.
//     5. Encouraging positive and meaningful conversations.
//     `
// };

// const rankingPostPrompt = (content) => {
//     return `
//     Given a textual input: ${content}, classify it as either a valid question (1) or a promotional post (0). 
//     Exclude posts that do not fall into these categories. 
//     Your model should prioritize filtering out non-question content and promotional material, while allowing other types of content to pass through.
//     `
// };

  const RankPostSystemMessage = "Given a textual input, classify it as either a valid question (1) or a promotional post (0). Exclude posts that do not fall into these categories. Your model should prioritize filtering out non-question content and promotional material, while allowing other types of content to pass through. Fallback should be 1 if not fall in any category"
  const rankingPostPrompt = (content) => {
    return `Filter out it in binary 0 or 1: ${content}`
  }
module.exports = {
    rankingPostPrompt,
    RankPostSystemMessage
}