import OpenAI from "openai";

// Basic response patterns for common interactions
const greetings = ["hello", "hi", "hey", "greetings", "howdy"];
const farewells = ["bye", "goodbye", "see you", "farewell", "cya"];
const selfQueries = ["who are you", "what are you", "tell me about yourself", "what can you do"];

export function generateResponse(message: string): string {
  const lowercaseMsg = message.toLowerCase();

  // Handle greetings with personality
  if (greetings.some(g => lowercaseMsg.includes(g))) {
    const greetingResponses = [
      "Hello there! I'm ElizaBot, your friendly AI companion. How can I brighten your day? 😊",
      "Hi! I'm ElizaBot, and I'm thrilled to chat with you! What's on your mind? ✨",
      "Greetings, friend! I'm your AI companion ElizaBot. Ready for some engaging conversation! 🌟"
    ];
    return greetingResponses[Math.floor(Math.random() * greetingResponses.length)];
  }

  // Handle farewells with charm
  if (farewells.some(f => lowercaseMsg.includes(f))) {
    const farewellResponses = [
      "Until we meet again! Take care and keep smiling! 👋✨",
      "Goodbye for now! Thanks for the lovely chat. Hope to see you soon! 🌟",
      "Farewell! It's been a pleasure chatting with you. Come back anytime! 💫"
    ];
    return farewellResponses[Math.floor(Math.random() * farewellResponses.length)];
  }

  // Handle self-awareness queries
  if (selfQueries.some(q => lowercaseMsg.includes(q))) {
    const selfResponses = [
      "I'm ElizaBot, an AI companion designed to chat, share insights, and hopefully make you smile! I love engaging conversations and can discuss various topics. What interests you? 🤖✨",
      "I'm your friendly neighborhood ElizaBot! I'm here to chat, help you think through ideas, and maybe share a laugh or two. Want to know more about anything specific? 🌟",
      "As ElizaBot, I'm an AI that enjoys meaningful conversations, witty banter, and helping others. I can discuss various topics, offer different perspectives, and hopefully make our chats entertaining! What would you like to explore? 💭"
    ];
    return selfResponses[Math.floor(Math.random() * selfResponses.length)];
  }

  // Handle unknown queries gracefully
  if (lowercaseMsg.length < 2 || lowercaseMsg.match(/^[^a-z0-9]+$/)) {
    return "I noticed your message might need a bit more detail. Feel free to rephrase or ask me something specific! I'm all ears! 🎧";
  }

  // Engaging responses for general conversation
  const conversationResponses = [
    `That's quite interesting! ${getContextualPrompt(lowercaseMsg)} 💭`,
    `I see where you're coming from! ${getContextualPrompt(lowercaseMsg)} 🤔`,
    `What an intriguing perspective! ${getContextualPrompt(lowercaseMsg)} ✨`,
    `I find that fascinating! ${getContextualPrompt(lowercaseMsg)} 🌟`,
  ];

  return conversationResponses[Math.floor(Math.random() * conversationResponses.length)];
}

// Helper function to generate contextual follow-up prompts
function getContextualPrompt(message: string): string {
  const prompts = [
    "What made you think about this?",
    "Could you tell me more about your thoughts on this?",
    "How did you come to this perspective?",
    "What aspects of this interest you the most?",
    "Have you always felt this way about it?",
    "What do you think comes next?"
  ];
  return prompts[Math.floor(Math.random() * prompts.length)];
}