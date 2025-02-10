import { messages, type Message, type InsertMessage } from "@shared/schema";

export interface IStorage {
  getMessages(): Promise<Message[]>;
  addMessage(message: InsertMessage): Promise<Message>;
  clearHistory(): Promise<void>;
}

export class MemStorage implements IStorage {
  private messages: Message[];
  private currentId: number;

  constructor() {
    this.messages = [];
    this.currentId = 1;
  }

  async getMessages(): Promise<Message[]> {
    return this.messages;
  }

  async addMessage(insertMessage: InsertMessage): Promise<Message> {
    const message: Message = {
      id: this.currentId++,
      content: insertMessage.content,
      sender: insertMessage.sender,
      timestamp: new Date()
    };
    this.messages.push(message);
    return message;
  }

  async clearHistory(): Promise<void> {
    this.messages = [];
    this.currentId = 1;
  }
}

export const storage = new MemStorage();
