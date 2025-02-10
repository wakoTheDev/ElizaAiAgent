import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { chatMessageSchema } from "@shared/schema";
import { generateResponse } from "../client/src/lib/chat-responses";

export function registerRoutes(app: Express): Server {
  app.get("/api/messages", async (_req, res) => {
    const messages = await storage.getMessages();
    res.json(messages);
  });

  app.post("/api/messages", async (req, res) => {
    try {
      const result = chatMessageSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid message format" });
      }

      // Save user message
      const userMessage = await storage.addMessage({
        content: result.data.content,
        sender: "user"
      });

      // Generate and save bot response
      const botResponse = await generateResponse(result.data.content);
      const botMessage = await storage.addMessage({
        content: botResponse,
        sender: "bot"
      });

      res.json({ userMessage, botMessage });
    } catch (error) {
      console.error('Error processing message:', error);
      res.status(500).json({ error: "Failed to process message" });
    }
  });

  app.post("/api/clear", async (_req, res) => {
    await storage.clearHistory();
    res.json({ success: true });
  });

  const httpServer = createServer(app);
  return httpServer;
}