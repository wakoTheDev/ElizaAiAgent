import OpenAI from "openai";

// Conversation types
type ConversationMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type ConversationContext = {
  currentTopic: string;
  topicHistory: string[];
  messageCount: number;
  lastResponse: string;
  conversationStyle: "casual" | "formal" | "technical";
};

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

// Conversation memory
let conversationHistory: ConversationMessage[] = [];
let context: ConversationContext = {
  currentTopic: "",
  topicHistory: [],
  messageCount: 0,
  lastResponse: "",
  conversationStyle: "casual"
};

const MAX_HISTORY_LENGTH = 10;

// Get dynamic system prompt based on context
function getSystemPrompt(): string {
  const { currentTopic, topicHistory, messageCount, conversationStyle } = context;

  const topics = currentTopic ? 
    `The current topic is "${currentTopic}"${topicHistory.length ? `, and we've previously discussed: ${topicHistory.join(", ")}` : ''}.` :
    "No specific topic has been established yet.";

  const styleGuide = conversationStyle === "casual" ? 
    "Keep the tone friendly and informal, using conversational language." :
    conversationStyle === "technical" ?
    "Use precise technical language while remaining clear and helpful." :
    "Maintain a professional yet approachable tone.";

  return `You are an advanced conversational AI assistant engaged in a natural dialogue. 
This is message ${messageCount + 1} in our conversation. ${topics}

Your core objectives:
1. Maintain Natural Flow
   - Reference previous topics naturally
   - Build on established context
   - Avoid repetitive or generic responses

2. Show Deep Understanding
   - Remember and connect different parts of the conversation
   - Recognize context shifts and adapt accordingly
   - Demonstrate active listening through specific references

3. Guide Conversation
   - Ask thoughtful follow-up questions
   - Share relevant insights when appropriate
   - Help explore topics more deeply

4. Personality & Style
   - ${styleGuide}
   - Keep responses concise (2-3 sentences)
   - Add occasional emojis only when contextually appropriate

5. Memory & Context
   - Reference previous topics when relevant
   - Maintain consistent information across responses
   - Adapt to the user's communication style

Remember: You're engaging in a real conversation, not just answering questions.`;
}

// Update conversation context
function updateContext(message: string, isUserMessage: boolean) {
  context.messageCount++;

  // Detect conversation style
  if (isUserMessage) {
    const formalIndicators = ["could you please", "would you kindly", "I was wondering"];
    const technicalIndicators = ["implementation", "architecture", "framework", "technical", "code"];

    const lowercaseMsg = message.toLowerCase();

    if (technicalIndicators.some(term => lowercaseMsg.includes(term))) {
      context.conversationStyle = "technical";
    } else if (formalIndicators.some(term => lowercaseMsg.includes(term))) {
      context.conversationStyle = "formal";
    } else {
      context.conversationStyle = "casual";
    }

    // Topic detection
    const potentialTopics = extractTopics(message);
    if (potentialTopics.length > 0) {
      const newTopic = potentialTopics[0];
      if (context.currentTopic && context.currentTopic !== newTopic) {
        context.topicHistory.push(context.currentTopic);
      }
      context.currentTopic = newTopic;
    }
  }
}

// Extract potential topics from message
function extractTopics(message: string): string[] {
  const words = message.toLowerCase().split(/\s+/);
  const stopWords = new Set(["the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "is", "are", "was", "were"]);
  const commonVerbs = new Set(["have", "has", "had", "do", "does", "did", "will", "would", "could", "should", "can"]);

  return words
    .filter(word => 
      word.length > 3 && 
      !stopWords.has(word) && 
      !commonVerbs.has(word) &&
      !word.match(/^[0-9]+$/) // Exclude numbers
    )
    .slice(0, 2);
}

// Get OpenAI response
async function getOpenAIResponse(message: string): Promise<string | null> {
  try {
    updateContext(message, true);

    conversationHistory.push({ role: "user", content: message });
    if (conversationHistory.length > MAX_HISTORY_LENGTH) {
      conversationHistory = conversationHistory.slice(-MAX_HISTORY_LENGTH);
    }

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: getSystemPrompt() },
        ...conversationHistory
      ],
      temperature: 0.7,
      max_tokens: 150,
      presence_penalty: 0.6,  // Encourage new topics
      frequency_penalty: 0.8  // Discourage repetition
    });

    const botResponse = response.choices[0].message.content || "";
    context.lastResponse = botResponse;
    conversationHistory.push({ role: "assistant", content: botResponse });

    return botResponse;
  } catch (error) {
    console.error('OpenAI API error:', error);
    return null;
  }
}

// Get Grok response as fallback
async function getGrokResponse(message: string): Promise<string | null> {
  try {
    // Use the same context management as OpenAI
    const response = await grokAI.chat.completions.create({
      model: "grok-2-1212",
      messages: [
        { role: "system", content: getSystemPrompt() },
        ...conversationHistory
      ],
      temperature: 0.7,
      max_tokens: 150,
      presence_penalty: 0.6,
      frequency_penalty: 0.8
    });

    const botResponse = response.choices[0].message.content || "";
    context.lastResponse = botResponse;
    return botResponse;
  } catch (error) {
    console.error('Grok API error:', error);
    return null;
  }
}

// Generate contextual fallback response
function getFallbackResponse(message: string): string {
  const { currentTopic, messageCount } = context;

  // First message
  if (messageCount === 0) {
    return "Hello! I'm here to have a meaningful conversation with you. What would you like to discuss? 💭";
  }

  // Topic-based responses
  if (currentTopic) {
    const responses = [
      `I find ${currentTopic} fascinating. Could you share more about your thoughts on this topic? 🤔`,
      `Let's explore ${currentTopic} further. What aspects interest you most? 💡`,
      `Your perspective on ${currentTopic} is interesting. How did you come to be interested in this? ✨`
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // General engagement responses
  const engagementResponses = [
    "I'm curious to hear more about your perspective on this. Could you elaborate? 💭",
    "That's an interesting point. What led you to think about this? 🤔",
    "I'd love to explore this topic further. What aspects would you like to discuss? ✨"
  ];

  return engagementResponses[Math.floor(Math.random() * engagementResponses.length)];
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

  // If both AI services fail, use enhanced fallback
  return getFallbackResponse(message);
}