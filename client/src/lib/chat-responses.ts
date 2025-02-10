import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

// Initialize xAI client (Grok) as fallback
const grokAI = new OpenAI({
  baseURL: "https://api.x.ai/v1",
  apiKey: process.env.XAI_API_KEY,
  dangerouslyAllowBrowser: true
});

// Conversation memory with proper typing
type ConversationMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

let conversationHistory: ConversationMessage[] = [];
const MAX_HISTORY_LENGTH = 10;

// System prompt for AI models
const SYSTEM_PROMPT = `You are a helpful and engaging AI assistant. Your responses should be:
- Natural and conversational
- Concise but informative (1-3 sentences)
- Include follow-up questions when appropriate
- Show understanding of context from previous messages
- Use emojis sparingly and naturally

Keep the conversation flowing naturally while being helpful and friendly.`;

// Function to get OpenAI response
async function getOpenAIResponse(message: string): Promise<string | null> {
  try {
    // Add user message to history
    conversationHistory.push({ role: "user", content: message });

    // Maintain history length
    if (conversationHistory.length > MAX_HISTORY_LENGTH) {
      conversationHistory = conversationHistory.slice(-MAX_HISTORY_LENGTH);
    }

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...conversationHistory
      ],
      temperature: 0.7,
      max_tokens: 150
    });

    const botResponse = response.choices[0].message.content || "";
    conversationHistory.push({ role: "assistant", content: botResponse });

    return botResponse;
  } catch (error) {
    console.error('OpenAI API error:', error);
    return null;
  }
}

// Function to get Grok response
async function getGrokResponse(message: string): Promise<string | null> {
  try {
    const response = await grokAI.chat.completions.create({
      model: "grok-2-1212",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...conversationHistory
      ],
      temperature: 0.7,
      max_tokens: 150
    });

    const botResponse = response.choices[0].message.content || "";
    conversationHistory.push({ role: "assistant", content: botResponse });

    return botResponse;
  } catch (error) {
    console.error('Grok API error:', error);
    return null;
  }
}

// Simple pattern matching for fallback responses
const patterns = {
  greetings: ["hello", "hi", "hey", "greetings"],
  questions: ["what", "why", "how", "when", "where", "who"],
  thanks: ["thank", "thanks", "appreciate"],
  goodbye: ["bye", "goodbye", "see you", "farewell"]
};

function matchPattern(message: string): string {
  const lowercaseMsg = message.toLowerCase();

  if (patterns.greetings.some(word => lowercaseMsg.includes(word))) {
    return "greetings";
  }
  if (patterns.questions.some(word => lowercaseMsg.includes(word))) {
    return "questions";
  }
  if (patterns.thanks.some(word => lowercaseMsg.includes(word))) {
    return "thanks";
  }
  if (patterns.goodbye.some(word => lowercaseMsg.includes(word))) {
    return "goodbye";
  }
  return "general";
}

// Generate fallback response
function getFallbackResponse(message: string): string {
  const type = matchPattern(message);

  const responses = {
    greetings: [
      "Hello! How can I help you today? 👋",
      "Hi there! What's on your mind?",
      "Hey! I'm here to help - what would you like to discuss?"
    ],
    questions: [
      "That's an interesting question. Let me help you explore that.",
      "I'd be happy to help you find an answer. Could you tell me more?",
      "Great question! Let's work through this together."
    ],
    thanks: [
      "You're welcome! Is there anything else you'd like to discuss?",
      "Glad I could help! Let me know if you need anything else.",
      "It's my pleasure! Feel free to ask if you have more questions."
    ],
    goodbye: [
      "Goodbye! Have a great day! 👋",
      "Take care! Come back anytime you'd like to chat.",
      "See you later! It was nice talking with you!"
    ],
    general: [
      "I'm listening! Tell me more about that.",
      "That's interesting! Would you like to elaborate?",
      "I'm here to help. What else would you like to discuss?"
    ]
  };

  const options = responses[type as keyof typeof responses];
  return options[Math.floor(Math.random() * options.length)];
}

// Main response generation function
export async function generateResponse(message: string): Promise<string> {
  try {
    // Try OpenAI first
    const openAIResponse = await getOpenAIResponse(message);
    if (openAIResponse) {
      return openAIResponse;
    }

    // If OpenAI fails, try Grok
    const grokResponse = await getGrokResponse(message);
    if (grokResponse) {
      return grokResponse;
    }
  } catch (error) {
    console.error('Error generating AI responses:', error);
  }

  // If both AI services fail, use fallback response
  return getFallbackResponse(message);
}