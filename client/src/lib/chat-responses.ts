import OpenAI from "openai";

// Conversation types
type ConversationMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

// Maintain conversation state
let conversationHistory: Array<{ role: string; content: string }> = [];
const MAX_HISTORY = 6; // Keep last 6 messages for context

// Helper function to manage conversation history
function addToHistory(role: string, content: string) {
  conversationHistory.push({ role, content });
  if (conversationHistory.length > MAX_HISTORY) {
    // Remove older messages but keep the system prompt
    const systemMessage = conversationHistory[0];
    conversationHistory = [systemMessage, ...conversationHistory.slice(-MAX_HISTORY + 1)];
  }
}

// Main response generation function
export async function generateResponse(message: string): Promise<string> {
  try {
    // Initialize conversation if it's empty
    if (conversationHistory.length === 0) {
      addToHistory("system", `You are a helpful and engaging chatbot assistant. Your responses should be:
- Natural and conversational, showing understanding of context
- Concise but informative (1-3 sentences maximum)
- Include occasional follow-up questions to maintain conversation flow
- Reference previous messages when relevant
- Avoid generic responses, be specific to the conversation

Remember:
1. Stay on topic and build upon previous exchanges
2. Ask relevant follow-up questions
3. Keep responses brief but meaningful
4. Show you remember earlier parts of the conversation`);
    }

    // Add user message to history
    addToHistory("user", message);

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: conversationHistory,
        temperature: 0.7,
        max_tokens: 150,
        presence_penalty: 0.6,  // Encourage new content
        frequency_penalty: 0.8  // Reduce repetition
      });

      const botResponse = response.choices[0].message.content || "I'm not sure how to respond to that.";
      addToHistory("assistant", botResponse);
      return botResponse;

    } catch (error) {
      console.error('OpenAI API error:', error);
      // Simple fallback responses based on conversation length
      if (conversationHistory.length <= 3) {
        return "Hi! I'm here to chat. What would you like to discuss?";
      } else {
        return "I'd love to hear more about your thoughts on this. Could you elaborate?";
      }
    }

  } catch (error) {
    console.error('Error in generate response:', error);
    return "I'm having trouble processing that right now. Could you try rephrasing?";
  }
}