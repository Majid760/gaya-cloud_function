// This message is used to welcome users to the Girlz community.
const welcomeToAppMessage = `Hey,

Welcome to BTL - the most supportive girl community on the web! Here you can consult about everything anonymously, share, vent, receive, and give help to other girls!

To start your journey in Girlz and meet amazing girls from all over the world, begin by commenting on other girls' posts or writing a post yourself. It's all about building connections and supporting each other here. 💖🌍

Best wishes,
Girlz bestie`;

const welcomeToAppOnboardingMessage = (name) => {
    return `Hey${name ? ` ${name}` : ''},
Welcome to BTL, the most supportive girl community online! Here you can chat about everything anonymously, share, vent, receive, and help other girls! 🥰

Here's how to start chatting with girls worldwide:`
}

module.exports = {
    welcomeToAppMessage,
    welcomeToAppOnboardingMessage
};