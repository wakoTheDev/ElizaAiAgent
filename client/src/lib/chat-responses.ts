const greetings = ["hello", "hi", "hey", "greetings", "howdy"];
const farewells = ["bye", "goodbye", "see you", "farewell", "cya"];

export function generateResponse(message: string): string {
  const lowercaseMsg = message.toLowerCase();

  // Check for greetings
  if (greetings.some(g => lowercaseMsg.includes(g))) {
    return "Hello! How can I help you today? 😊";
  }

  // Check for farewells
  if (farewells.some(f => lowercaseMsg.includes(f))) {
    return "Goodbye! Have a great day! 👋";
  }

  // Default responses for other messages
  const defaultResponses = [
    "That's interesting! Tell me more about that.",
    "I understand. How does that make you feel?",
    "Could you elaborate on that?",
    "I see. What are your thoughts on this?",
    "That's a fascinating perspective. Why do you think that is?"
  ];

  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
}
