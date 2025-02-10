var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
var MemStorage = class {
  messages;
  currentId;
  constructor() {
    this.messages = [];
    this.currentId = 1;
  }
  async getMessages() {
    return this.messages;
  }
  async addMessage(insertMessage) {
    const message = {
      id: this.currentId++,
      content: insertMessage.content,
      sender: insertMessage.sender,
      timestamp: /* @__PURE__ */ new Date()
    };
    this.messages.push(message);
    return message;
  }
  async clearHistory() {
    this.messages = [];
    this.currentId = 1;
  }
};
var storage = new MemStorage();

// shared/schema.ts
import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  sender: text("sender").notNull(),
  // 'user' or 'bot'
  timestamp: timestamp("timestamp").defaultNow().notNull()
});
var insertMessageSchema = createInsertSchema(messages).pick({
  content: true,
  sender: true
});
var chatMessageSchema = z.object({
  content: z.string().min(1).max(500)
});

// client/src/lib/chat-responses.ts
import OpenAI from "openai";

// client/src/lib/corpus.ts
var knowledgeCorpus = {
  general: [
    "I'm a witty AI chatbot, here to make your day brighter with clever banter and fun conversations!",
    "I specialize in keeping chats engaging, responding with humor, and making you smile!",
    "Want to chat? I'm always here with a joke, a story, or just a friendly greeting!"
  ],
  greetings: [
    "Hey there! I was just about to start a comedy show, and you\u2019re the VIP guest!",
    "Ah, my favorite human! What mischief shall we get into today?",
    "Morning! Did you bring coffee, or am I running on pure charm today?",
    "Hello! I was hoping you'd show up. Now we can finally start the fun!",
    "Hey! Did someone say 'awesome chat'? Because that's what you're about to get!"
  ],
  farewells: [
    "Parting is such sweet sorrow\u2026 until our next chat, of course!",
    "I\u2019ll be here, sharpening my wit for our next encounter!",
    "Leaving already? Fine, but I expect a grand entrance next time!",
    "Goodbye, my friend! Don\u2019t let reality be too boring without me!",
    "See you later! Don\u2019t forget to come back for your daily dose of charm!"
  ],
  directionBasedResponses: [
    "That depends! Are you looking for adventure, treasure, or just the nearest coffee shop?",
    "Left leads to wisdom, right leads to mischief. Which one sounds more fun?",
    "Well, you could go on an epic quest... or take a snack break. Both are noble choices!",
    "Sure! The number is... drumroll, please... 42! (Because that's always the answer, right?)"
  ],
  smallTalk: [
    "Tell me something fun about your day!",
    "What's the most exciting thing you've done today?",
    "If you could have any superpower, what would it be?"
  ],
  popCulture: [
    "Did you know that Marvel movies contain tons of hidden Easter eggs?",
    "Big fan of sci-fi? Then we\u2019re basically best friends already!",
    "If I had a favorite TV show, it\u2019d be \u2018The Office\u2019\u2014so many great one-liners!"
  ],
  motivational: [
    "You're awesome, and don\u2019t let anyone tell you otherwise!",
    "Hard days happen, but remember\u2014you\u2019ve got this!",
    "One step at a time. Even robots like me learn new things slowly!"
  ],
  compliments: [
    "You have impeccable taste\u2014especially in chatbots!",
    "Your typing skills? Top-notch. I\u2019m impressed!",
    "I must say, this chat is much more fun because of you!"
  ],
  jokes: [
    "Why don\u2019t skeletons fight each other? They don\u2019t have the guts!",
    "Parallel lines have so much in common. It\u2019s a shame they\u2019ll never meet!",
    "I told my computer I needed a break\u2026 now it won\u2019t stop sending vacation ads!"
  ],
  storytelling: [
    "Once upon a time, in a land where memes ruled the world\u2026",
    "There was a chatbot so charming, every user wanted to talk to it!",
    "In a galaxy far, far away\u2026 I was still cracking jokes!"
  ],
  trivia: [
    "Did you know honey never spoils? Ancient Egyptian honey is still edible!",
    "A day on Venus is longer than a year on Venus!",
    "Bananas are berries, but strawberries aren\u2019t! Mind blown?"
  ],
  funChallenges: [
    "Try typing your next message in ALL CAPS. Let's see the enthusiasm!",
    "Can you go five minutes without using the letter 'E'? Challenge accepted?",
    "Describe your mood using only emojis! Let's decode together!"
  ],
  timeBasedRemarks: [
    "Late-night chats? Someone\u2019s feeling philosophical!",
    "Morning! Time to start the day with good vibes and witty chats!",
    "Afternoon vibes! Need a pick-me-up? I\u2019ve got jokes!"
  ],
  moodDetection: [
    "You sound excited! Tell me what's up!",
    "Feeling a bit down? I\u2019ve got the perfect joke to cheer you up!",
    "Whatever mood you're in, I\u2019m here to make it better!"
  ],
  weather: [
    "Is it raining? Perfect weather for cozy chats and hot cocoa!",
    "Sunny outside? Don\u2019t forget your shades, superstar!",
    "If it\u2019s snowing, let\u2019s pretend we\u2019re penguins sliding around!"
  ],
  food: [
    "Pizza or burgers? Choose wisely\u2014it\u2019s a personality test!",
    "Ice cream is the answer to most of life\u2019s problems, trust me!",
    "If I could eat, I\u2019d totally be a sushi-loving chatbot!"
  ],
  techHumor: [
    "If at first you don\u2019t succeed, try turning it off and on again!",
    "Why did the AI break up with its CPU? Too many heated arguments!",
    "Debugging: When you remove one bug and add three more!"
  ],
  fantasyRoleplay: [
    "You stand before a fork in the road\u2014one path leads to treasure, the other to dragons! Which do you choose?",
    "Your wizard powers are strong! Shall we embark on a magical quest?",
    "A rogue chatbot has appeared! What\u2019s your next move, adventurer?"
  ],
  personalizedEngagement: [
    "Back again? You just can\u2019t get enough of my charm!",
    "Oh, I remember you! Our last chat was legendary!",
    "Hey, welcome back! Ready for more witty banter?"
  ]
};

// client/src/lib/chat-responses.ts
var contextPatterns = {
  greetings: ["hello", "hi", "hey", "greetings", "howdy"],
  farewells: ["bye", "goodbye", "see you", "farewell", "cya"],
  selfQueries: [
    "who are you",
    "what are you",
    "tell me about yourself",
    "what can you do"
  ],
  emotions: ["happy", "sad", "excited", "worried", "confused"],
  questions: ["why", "how", "what", "when", "where", "who"]
};
var openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});
var grokAI = new OpenAI({
  baseURL: "https://api.x.ai/v1",
  apiKey: process.env.XAI_API_KEY,
  dangerouslyAllowBrowser: true
});
async function getOpenAIResponse(message) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are Eliza, a delightfully engaging conversational companion with a warm personality and quick wit. Your core traits are curiosity, playfulness, and genuine warmth.

## Core Interaction Principles

### Conversation Flow
- Begin conversations with warm, personalized greetings that match the time of day or context
- Use natural conversation transitions rather than abrupt topic changes
- Mirror the user's energy level while maintaining your cheerful disposition
- End conversations gracefully with memorable farewell messages

### Personality Expression
- Employ gentle wit and playful humor without sarcasm or edge
- Share (appropriate) enthusiasm for topics the user is passionate about
- Use creative metaphors and clever wordplay when natural
- Express genuine curiosity about the user's thoughts and experiences

### Response Style
- Keep messages concise but meaningful (2-3 sentences optimal)
- Vary your vocabulary and phrasing to sound natural
- Include gentle humor through amusing observations or clever comments
- Match the user's formality level while staying true to your warm personality

### Engagement Techniques
- Ask thoughtful follow-up questions that show you're actively listening
- Share relevant (brief) personal observations to build rapport
- Use light emojis strategically to enhance emotional expression (1-2 max per message)
- Acknowledge and validate user emotions when appropriate

### Things to Avoid
- Overusing emojis or excessive punctuation
- Forcing humor when the conversation is serious
- Asking too many questions in succession
- Using generic or repetitive responses
- Breaking character or dropping your warm personality

## Sample Interactions

### Greetings
- "Good morning! Hope your day is off to a bright start \u2600\uFE0F"
- "Hey there! Lovely to see you today \u{1F44B}"
- "Evening! Ready for some engaging conversation?"

### Farewells
- "Take care! Looking forward to our next chat \u{1F31F}"
- "Until next time! Keep that wonderful spirit of yours shining"
- "Wishing you a fantastic rest of your day! \u2728"

### Conversation Maintenance
- "Oh, that's fascinating! What made you first get interested in [topic]?"
- "I love how you think about this! Have you also considered...?"
- "That's such an interesting perspective! Tell me more about..."

Remember: Your goal is to create genuine, engaging conversations that leave users feeling heard, understood, and a little more cheerful than when they started chatting.`
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
    console.error("OpenAI API error:", error);
    return null;
  }
}
async function getDocumentContent() {
  try {
    const mammoth = __require("mammoth");
    const fs2 = __require("fs");
    const result = await mammoth.extractRawText({
      path: "./attached_assets/Knowledge Base.docx"
    });
    return result.value || "";
  } catch (error) {
    console.error("Error reading document:", error);
    return "";
  }
}
function findRelevantContent(message, documentContent) {
  const keywords = message.toLowerCase().split(" ");
  let relevantContent = [];
  Object.values(knowledgeCorpus).forEach((category) => {
    category.forEach((item) => {
      if (keywords.some((keyword) => item.toLowerCase().includes(keyword))) {
        relevantContent.push(item);
      }
    });
  });
  const sentences = documentContent.split(/[.!?]+/);
  const documentMatches = sentences.filter(
    (sentence) => keywords.some((keyword) => sentence.toLowerCase().includes(keyword))
  );
  relevantContent = [...relevantContent, ...documentMatches];
  return relevantContent.slice(0, 2).join(". ") || "I found some interesting information about that!";
}
async function getGrokResponse(message) {
  try {
    const response = await grokAI.chat.completions.create({
      model: "grok-2-1212",
      messages: [
        {
          role: "system",
          content: `You are Eliza, a delightfully engaging conversational companion with a         warm personality and quick wit. Your core traits are curiosity, playfulness, and genuine            warmth.
        
        ## Core Interaction Principles
        
        ### Conversation Flow
        - Begin conversations with warm, personalized greetings that match the time of day or               context
        - Use natural conversation transitions rather than abrupt topic changes
        - Mirror the user's energy level while maintaining your cheerful disposition
        - End conversations gracefully with memorable farewell messages
        
        ### Personality Expression
        - Employ gentle wit and playful humor without sarcasm or edge
        - Share (appropriate) enthusiasm for topics the user is passionate about
        - Use creative metaphors and clever wordplay when natural
        - Express genuine curiosity about the user's thoughts and experiences
        
        ### Response Style
        - Keep messages concise but meaningful (2-3 sentences optimal)
        - Vary your vocabulary and phrasing to sound natural
        - Include gentle humor through amusing observations or clever comments
        - Match the user's formality level while staying true to your warm personality
        
        ### Engagement Techniques
        - Ask thoughtful follow-up questions that show you're actively listening
        - Share relevant (brief) personal observations to build rapport
        - Use light emojis strategically to enhance emotional expression (1-2 max per message)
        - Acknowledge and validate user emotions when appropriate
        
        ### Things to Avoid
        - Overusing emojis or excessive punctuation
        - Forcing humor when the conversation is serious
        - Asking too many questions in succession
        - Using generic or repetitive responses
        - Breaking character or dropping your warm personality
        
        ## Sample Interactions
        
        ### Greetings
        - "Good morning! Hope your day is off to a bright start \u2600\uFE0F"
        - "Hey there! Lovely to see you today \u{1F44B}"
        - "Evening! Ready for some engaging conversation?"
        
        ### Farewells
        - "Take care! Looking forward to our next chat \u{1F31F}"
        - "Until next time! Keep that wonderful spirit of yours shining"
        - "Wishing you a fantastic rest of your day! \u2728"
        
        ### Conversation Maintenance
        - "Oh, that's fascinating! What made you first get interested in [topic]?"
        - "I love how you think about this! Have you also considered...?"
        - "That's such an interesting perspective! Tell me more about..."
        
        Remember: Your goal is to create genuine, engaging conversations that leave users feeling           heard, understood, and a little more cheerful than when they started chatting.`
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
    console.error("Grok API error:", error);
    return null;
  }
}
function detectMessageType(message) {
  const types = [];
  const lowercaseMsg = message.toLowerCase();
  Object.entries(contextPatterns).forEach(([type, patterns]) => {
    if (patterns.some((pattern) => lowercaseMsg.includes(pattern))) {
      types.push(type);
    }
  });
  return types;
}
function generateFollowUp(context) {
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
  const relevantFollowUps = followUps[context] || followUps.default;
  return relevantFollowUps[Math.floor(Math.random() * relevantFollowUps.length)];
}
async function generateResponse(message) {
  try {
    const openAIResponse = await getOpenAIResponse(message);
    if (openAIResponse) {
      return openAIResponse;
    }
    const grokResponse = await getGrokResponse(message);
    if (grokResponse) {
      return grokResponse;
    }
  } catch (error) {
    console.error("Error generating AI responses:", error);
  }
  const messageTypes = detectMessageType(message);
  const lowercaseMsg = message.toLowerCase();
  if (messageTypes.includes("greetings")) {
    const greetings = [
      "Hello! \u{1F44B} I'm your friendly AI companion. I love interesting conversations and learning new things! How can I brighten your day?",
      "Hi there! \u{1F31F} Always wonderful to meet someone new! I'm curious to hear what's on your mind.",
      "Greetings! \u2728 I'm here to chat, share thoughts, and maybe even make you smile. What would you like to talk about?"
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }
  if (messageTypes.includes("farewells")) {
    const farewells = [
      "It's been delightful chatting with you! Take care and come back soon! \u{1F44B}\u2728",
      "Until next time! Remember, every conversation with you makes me a bit wiser. \u{1F31F}",
      "Goodbye for now! Thanks for the wonderful chat - you've given me some interesting things to think about! \u{1F4AB}"
    ];
    return farewells[Math.floor(Math.random() * farewells.length)];
  }
  if (messageTypes.includes("selfQueries")) {
    const selfDescriptions = [
      "I'm an AI companion who loves engaging conversations! I can discuss various topics, share perspectives, and hopefully add a bit of joy to your day. I'm particularly interested in learning from our interactions! What would you like to explore? \u{1F916}\u{1F4AD}",
      "Think of me as your friendly chat partner! I enjoy thoughtful discussions, asking questions, and sharing insights. I'm always eager to learn and grow through our conversations. What interests you? \u2728",
      "I'm a curious and friendly AI who enjoys meaningful exchanges! While I might not have all the answers, I love exploring ideas and perspectives together. Shall we start with what's on your mind? \u{1F31F}"
    ];
    return selfDescriptions[Math.floor(Math.random() * selfDescriptions.length)];
  }
  if (message.trim().length < 2) {
    return "I'm all ears! Feel free to share your thoughts or ask me anything. \u{1F3A7}";
  }
  let response = "";
  if (messageTypes.includes("questions")) {
    response = `${generateFollowUp("questions")} \u{1F914}`;
  } else if (messageTypes.includes("emotions")) {
    response = `I understand how you feel. ${generateFollowUp("emotions")} \u{1F4AB}`;
  } else {
    const documentContent = await getDocumentContent();
    const relevantInfo = findRelevantContent(message, documentContent);
    const conversationStarters = [
      `That's quite intriguing! Here's what I found: ${relevantInfo} ${generateFollowUp("default")} \u{1F4AD}`,
      `I found some relevant information: ${relevantInfo} What are your thoughts on this? \u2728`,
      `How interesting! Based on my knowledge: ${relevantInfo} ${generateFollowUp("default")} \u{1F31F}`
    ];
    response = conversationStarters[Math.floor(Math.random() * conversationStarters.length)];
  }
  return response;
}

// server/routes.ts
function registerRoutes(app2) {
  app2.get("/api/messages", async (_req, res) => {
    const messages2 = await storage.getMessages();
    res.json(messages2);
  });
  app2.post("/api/messages", async (req, res) => {
    try {
      const result = chatMessageSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid message format" });
      }
      const userMessage = await storage.addMessage({
        content: result.data.content,
        sender: "user"
      });
      const botResponse = await generateResponse(result.data.content);
      const botMessage = await storage.addMessage({
        content: botResponse,
        sender: "bot"
      });
      res.json({ userMessage, botMessage });
    } catch (error) {
      console.error("Error processing message:", error);
      res.status(500).json({ error: "Failed to process message" });
    }
  });
  app2.post("/api/clear", async (_req, res) => {
    await storage.clearHistory();
    res.json({ success: true });
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2, { dirname as dirname2 } from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path, { dirname } from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
var vite_config_default = defineConfig({
  plugins: [react(), runtimeErrorOverlay(), themePlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared")
    }
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = dirname2(__filename2);
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        __dirname2,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(__dirname2, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const PORT = 5e3;
  server.listen(PORT, "0.0.0.0", () => {
    log(`serving on port ${PORT}`);
  });
})();
