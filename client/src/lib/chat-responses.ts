import OpenAI from "openai";

// Personality traits and conversation patterns
const personalityTraits = {
  friendly: true,
  witty: true,
  empathetic: true,
  curious: true
};

// Context patterns for better response generation
const contextPatterns = {
  greetings: ["hello", "hi", "hey", "greetings", "howdy"],
  farewells: ["bye", "goodbye", "see you", "farewell", "cya"],
  selfQueries: ["who are you", "what are you", "tell me about yourself", "what can you do"],
  emotions: ["happy", "sad", "excited", "worried", "confused"],
  questions: ["why", "how", "what", "when", "where", "who"]
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

// Function to get OpenAI-generated response
async function getOpenAIResponse(message: string): Promise<string | null> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a friendly, witty, and empathetic AI chatbot. Your responses should be:
          - Engaging and charming with a touch of humor when appropriate
          - Show emotional intelligence and understanding
          - Include follow-up questions to maintain conversation flow
          - Keep responses concise (max 2-3 sentences)
          - Add a relevant emoji at the end
          Always maintain a warm, approachable personality.`
        },
        {
          role: "user",
          content: message
        }
      ],
      temperature: 0.9,
      max_tokens: 150
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API error:', error);
    return null;
  }
}

// Function to extract text from Word document
async function getDocumentContent(): Promise<string> {
  try {
    const mammoth = require('mammoth');
    const fs = require('fs');
    const result = await mammoth.extractRawText({path: "./attached_assets/Knowledge Base.docx"});
    return result.value || '';
  } catch (error) {
    console.error('Error reading document:', error);
    return '';
  }
}

import { knowledgeCorpus } from './corpus';

// Function to find relevant content from corpus and document
function findRelevantContent(message: string, documentContent: string): string {
  const keywords = message.toLowerCase().split(' ');
  let relevantContent: string[] = [];

  // Search corpus
  Object.values(knowledgeCorpus).forEach(category => {
    category.forEach(item => {
      if (keywords.some(keyword => item.toLowerCase().includes(keyword))) {
        relevantContent.push(item);
      }
    });
  });

  // Search document content
  const sentences = documentContent.split(/[.!?]+/);
  const documentMatches = sentences.filter(sentence => 
    keywords.some(keyword => 
      sentence.toLowerCase().includes(keyword)
    )
  );

  relevantContent = [...relevantContent, ...documentMatches];
  return relevantContent.slice(0, 2).join('. ') || 'I found some interesting information about that!';
}

// Function to get Grok-generated response (fallback)
async function getGrokResponse(message: string): Promise<string | null> {
  try {
    const response = await grokAI.chat.completions.create({
      model: "grok-2-1212",
      messages: [
        {
          role: "system",
          content: `You are a friendly, witty, and empathetic AI chatbot. Your responses should be:
          - Engaging and charming with a touch of humor when appropriate
          - Show emotional intelligence and understanding
          - Include follow-up questions to maintain conversation flow
          - Keep responses concise (max 2-3 sentences)
          - Add a relevant emoji at the end
          Always maintain a warm, approachable personality.`
        },
        {
          role: "user",
          content: message
        }
      ],
      temperature: 0.9,
      max_tokens: 150
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Grok API error:', error);
    return null;
  }
}

// Helper function to detect message type
function detectMessageType(message: string): string[] {
  const types: string[] = [];
  const lowercaseMsg = message.toLowerCase();

  Object.entries(contextPatterns).forEach(([type, patterns]) => {
    if (patterns.some(pattern => lowercaseMsg.includes(pattern))) {
      types.push(type);
    }
  });

  return types;
}

// Helper function to generate contextual follow-up questions
function generateFollowUp(context: string): string {
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
    default: [
      "Tell me more about your perspective on this.",
      "What aspects of this interest you the most?",
      "How did you come to think about this?",
      "That's fascinating! What else comes to mind?",
      "I'd love to hear more about your thoughts on this."
    ]
  };

  const relevantFollowUps = followUps[context as keyof typeof followUps] || followUps.default;
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
  const messageTypes = detectMessageType(message);
  const lowercaseMsg = message.toLowerCase();

  // Handle greetings with personality
  if (messageTypes.includes('greetings')) {
    const greetings = [
      "Hello! 👋 I'm your friendly AI companion. I love interesting conversations and learning new things! How can I brighten your day?",
      "Hi there! 🌟 Always wonderful to meet someone new! I'm curious to hear what's on your mind.",
      "Greetings! ✨ I'm here to chat, share thoughts, and maybe even make you smile. What would you like to talk about?"
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  // Handle farewells with warmth
  if (messageTypes.includes('farewells')) {
    const farewells = [
      "It's been delightful chatting with you! Take care and come back soon! 👋✨",
      "Until next time! Remember, every conversation with you makes me a bit wiser. 🌟",
      "Goodbye for now! Thanks for the wonderful chat - you've given me some interesting things to think about! 💫"
    ];
    return farewells[Math.floor(Math.random() * farewells.length)];
  }

  // Handle self-awareness queries
  if (messageTypes.includes('selfQueries')) {
    const selfDescriptions = [
      "I'm an AI companion who loves engaging conversations! I can discuss various topics, share perspectives, and hopefully add a bit of joy to your day. I'm particularly interested in learning from our interactions! What would you like to explore? 🤖💭",
      "Think of me as your friendly chat partner! I enjoy thoughtful discussions, asking questions, and sharing insights. I'm always eager to learn and grow through our conversations. What interests you? ✨",
      "I'm a curious and friendly AI who enjoys meaningful exchanges! While I might not have all the answers, I love exploring ideas and perspectives together. Shall we start with what's on your mind? 🌟"
    ];
    return selfDescriptions[Math.floor(Math.random() * selfDescriptions.length)];
  }

  // Handle empty or invalid input
  if (message.trim().length < 2) {
    return "I'm all ears! Feel free to share your thoughts or ask me anything. 🎧";
  }

  // Generate contextual response based on message content
  let response = "";

  // If it's a question, add curiosity
  if (messageTypes.includes('questions')) {
    response = `${generateFollowUp('questions')} 🤔`;
  }
  // If it contains emotions, add empathy
  else if (messageTypes.includes('emotions')) {
    response = `I understand how you feel. ${generateFollowUp('emotions')} 💫`;
  }
  // Default engaging response with document content
  else {
    const documentContent = await getDocumentContent();
    const relevantInfo = findRelevantContent(message, documentContent);
    const conversationStarters = [
      `That's quite intriguing! Here's what I found: ${relevantInfo} ${generateFollowUp('default')} 💭`,
      `I found some relevant information: ${relevantInfo} What are your thoughts on this? ✨`,
      `How interesting! Based on my knowledge: ${relevantInfo} ${generateFollowUp('default')} 🌟`
    ];
    response = conversationStarters[Math.floor(Math.random() * conversationStarters.length)];
  }

  return response;
}