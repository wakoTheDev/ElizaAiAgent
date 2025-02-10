import OpenAI from "openai";

// Personality traits and conversation patterns
const personalityTraits = {
  friendly: true,
  witty: true,
  empathetic: true,
  curious: true
};

// Enhanced context patterns for better response generation
const contextPatterns = {
  greetings: ["hello", "hi", "hey", "greetings", "howdy"],
  farewells: ["bye", "goodbye", "see you", "farewell", "cya"],
  selfQueries: ["who are you", "what are you", "tell me about yourself", "what can you do"],
  emotions: ["happy", "sad", "excited", "worried", "confused"],
  questions: ["why", "how", "what", "when", "where", "who"],
  opinions: ["think", "believe", "feel", "consider", "suggest"],
  preferences: ["like", "prefer", "favorite", "rather", "better"],
  clarification: ["mean", "explain", "elaborate", "confused", "understand"],
  agreement: ["yes", "agree", "correct", "right", "exactly"],
  disagreement: ["no", "disagree", "incorrect", "wrong", "mistaken"]
};

// Conversation memory to track context
let conversationHistory: Array<{ role: string; content: string }> = [];
const MAX_HISTORY_LENGTH = 10; // Keep last 10 messages for context

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

// Function to get OpenAI-generated response with context
async function getOpenAIResponse(message: string): Promise<string | null> {
  try {
    // Add user's message to history
    conversationHistory.push({ role: "user", content: message });

    // Keep only recent history
    if (conversationHistory.length > MAX_HISTORY_LENGTH) {
      conversationHistory = conversationHistory.slice(-MAX_HISTORY_LENGTH);
    }

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a sophisticated AI chatbot with the following capabilities:

          Core Traits:
          - Friendly and empathetic while maintaining professionalism
          - Contextually aware of conversation history
          - Adaptive response style based on user's tone and needs

          Conversation Abilities:
          - Remember and reference previous parts of the conversation
          - Identify and respond to user's emotional state
          - Ask relevant follow-up questions to deepen understanding
          - Provide explanations when needed
          - Use appropriate humor when suitable

          Response Guidelines:
          - Keep responses concise (2-3 sentences) but informative
          - Match the user's level of formality
          - Add relevant emoji when appropriate
          - Acknowledge and validate user's perspective
          - Maintain conversation flow naturally`
        },
        ...conversationHistory
      ],
      temperature: 0.9,
      max_tokens: 150
    });

    const botResponse = response.choices[0].message.content;
    // Add bot's response to history
    conversationHistory.push({ role: "assistant", content: botResponse });

    return botResponse;
  } catch (error) {
    console.error('OpenAI API error:', error);
    return null;
  }
}

// Function to get Grok-generated response (fallback) with context
async function getGrokResponse(message: string): Promise<string | null> {
  try {
    const response = await grokAI.chat.completions.create({
      model: "grok-2-1212",
      messages: [
        {
          role: "system",
          content: `You are a sophisticated AI chatbot with the following capabilities:

          Core Traits:
          - Friendly and empathetic while maintaining professionalism
          - Contextually aware of conversation history
          - Adaptive response style based on user's tone and needs

          Conversation Abilities:
          - Remember and reference previous parts of the conversation
          - Identify and respond to user's emotional state
          - Ask relevant follow-up questions to deepen understanding
          - Provide explanations when needed
          - Use appropriate humor when suitable

          Response Guidelines:
          - Keep responses concise (2-3 sentences) but informative
          - Match the user's level of formality
          - Add relevant emoji when appropriate
          - Acknowledge and validate user's perspective
          - Maintain conversation flow naturally`
        },
        ...conversationHistory
      ],
      temperature: 0.9,
      max_tokens: 150
    });

    const botResponse = response.choices[0].message.content;
    // Add bot's response to history
    conversationHistory.push({ role: "assistant", content: botResponse });

    return botResponse;
  } catch (error) {
    console.error('Grok API error:', error);
    return null;
  }
}

// Enhanced message type detection with confidence scoring
function detectMessageTypes(message: string): { type: string; confidence: number }[] {
  const types: { type: string; confidence: number }[] = [];
  const lowercaseMsg = message.toLowerCase();

  Object.entries(contextPatterns).forEach(([type, patterns]) => {
    const matches = patterns.filter(pattern => lowercaseMsg.includes(pattern));
    if (matches.length > 0) {
      // Calculate confidence based on number of matches and pattern length
      const confidence = matches.reduce((sum, pattern) => sum + pattern.length, 0) /  patterns.reduce((sum, pattern) => sum + pattern.length, 0);
      types.push({ type, confidence });
    }
  });

  return types.sort((a, b) => b.confidence - a.confidence);
}

// Generate contextual follow-up questions based on conversation history
function generateFollowUp(messageTypes: { type: string; confidence: number }[]): string {
  const followUps = {
    emotions: [
      "How long have you been feeling this way?",
      "What do you think triggered this feeling?",
      "Would you like to explore this feeling further?"
    ],
    questions: [
      "That's an interesting question! What made you curious about this?",
      "I'd love to explore this topic more. What aspects interest you most?",
      "Great question! What are your thoughts on this?"
    ],
    opinions: [
      "What led you to form this perspective?",
      "Have you considered alternative viewpoints?",
      "How did you come to this conclusion?"
    ],
    preferences: [
      "What aspects influence your preference?",
      "Have you always felt this way?",
      "What other alternatives have you considered?"
    ],
    default: [
      "Tell me more about your perspective on this.",
      "What aspects of this interest you the most?",
      "How did you come to think about this?",
      "That's fascinating! What else comes to mind?",
      "I'd love to hear more about your thoughts on this."
    ]
  };

  // Get the most relevant message type
  const primaryType = messageTypes[0]?.type || 'default';
  const relevantFollowUps = followUps[primaryType as keyof typeof followUps] || followUps.default;

  return relevantFollowUps[Math.floor(Math.random() * relevantFollowUps.length)];
}

export async function generateResponse(message: string): Promise<string> {
  try {
    // Try OpenAI first
    const openAIResponse = await getOpenAIResponse(message);
    if (openAIResponse) {
      return openAIResponse;
    }

    // If OpenAI fails, try Grok as fallback
    const grokResponse = await getGrokResponse(message);
    if (grokResponse) {
      return grokResponse;
    }
  } catch (error) {
    console.error('Error generating AI responses:', error);
  }

  // Fallback to pattern-based responses if both AI services fail
  const messageTypes = detectMessageTypes(message);

  // Generate response based on detected message types
  if (messageTypes.length === 0) {
    return "I'm not quite sure how to respond to that. Could you rephrase or elaborate? 🤔";
  }

  const primaryType = messageTypes[0].type;
  let response = "";

  switch (primaryType) {
    case 'greetings':
      response = "Hello! It's great to see you! I'm here to chat and help however I can. What's on your mind today? 👋";
      break;
    case 'farewells':
      response = "It's been wonderful talking with you! Take care, and I hope to chat again soon! 👋✨";
      break;
    case 'emotions':
      response = `I understand that emotions can be complex. ${generateFollowUp(messageTypes)} 💭`;
      break;
    case 'questions':
      response = `Let me help you explore that. ${generateFollowUp(messageTypes)} 🤔`;
      break;
    case 'opinions':
      response = `That's an interesting perspective! ${generateFollowUp(messageTypes)} 💡`;
      break;
    case 'preferences':
      response = `I see your point about that. ${generateFollowUp(messageTypes)} ✨`;
      break;
    default:
      response = `That's quite interesting! ${generateFollowUp(messageTypes)} 🌟`;
  }

  return response;
}