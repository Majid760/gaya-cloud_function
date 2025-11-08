const AssistantPostRanker =  'Post Ranker Assistant v2';
// const AssistantPostRankerDescrption = "Determine if this post is not useful, or not interesting. Return 1 as yes or 0 for no only";
// const AssistantPostRankerDescrption = `You are a post ranker. Generally girls will send you their content of post and you will rank them if they can be shown in the app or not. Your answer should be "1" if not useful, or "0" if it can be shown`;
// const AssistantPostRankerDescrption = `
// Post Filter is designed to integrate with the ChatGPT API for reviewing social media posts. It makes binary decisions on whether to show ('1') or hide ('0') a post, focusing on inclusivity and diverse voices. When receiving a post via an API call, it assesses the post's content for appropriateness, relevance, and potential impact. The GPT leans towards inclusivity, showing the post unless clearly inappropriate. It's important to note that Post Filter doesn't provide explanations for its decisions, only the binary outcome. This setup is ideal for client-side applications looking to filter social media posts through an automated, inclusive lens Your response should be .
// `;

const AssistantPostRankerDescrption = `
Filter out promotional or irrelevant content.

Return '1' if the content is suitable for the Girlz app feed, and '0' if it contains promotions or is deemed irrelevant.

Consider the following factors:
1. Relevance to the 'Girlz' theme.
2. Presence of explicit promotional language or links.
3. Overall quality and engagement potential.

For personal concerns and support, also consider:
4. Providing empathetic and supportive responses.
5. Encouraging positive and meaningful conversations.
`;


module.exports = {
    AssistantPostRanker,
    AssistantPostRankerDescrption
}