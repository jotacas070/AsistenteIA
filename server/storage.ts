import { type User, type InsertUser, type AppConfig, type InsertConfig, type ChatMessage, type InsertMessage, type UploadedFile, type InsertFile } from "@shared/schema";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { db } from "./lib/supabase";
import { users, appConfig, chatMessages, uploadedFiles } from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Config methods
  getConfig(): Promise<AppConfig | undefined>;
  updateConfig(config: Partial<InsertConfig>): Promise<AppConfig>;
  
  // Message methods
  getMessages(): Promise<ChatMessage[]>;
  createMessage(message: InsertMessage): Promise<ChatMessage>;
  clearMessages(): Promise<void>;
  
  // File methods
  createFile(file: InsertFile): Promise<UploadedFile>;
  getFiles(): Promise<UploadedFile[]>;
  deleteFile(id: string): Promise<void>;
}

export class DbStorage implements IStorage {
  private fallbackConfig: AppConfig;

  constructor() {
    this.fallbackConfig = {
      id: 1,
      appTitle: "Asistente IA - Compras Públicas",
      subtitle: "Armada de Chile",
      primaryColor: "#1e3a8a",
      fontSize: "medium",
      apiUrl: "https://flowiseai-railway-production-eb75.up.railway.app/api/v1/prediction/04648966-309e-4165-90ff-7c6c1ad83315",
      apiKey: "O3KCVc2jLESbFDaplHU_PgaayV652Rz6WJjELk8jFD4",
      requireUserPassword: false,
      userPassword: null,
      adminPassword: "admin123",
      updatedAt: new Date(),
    };
    this.initializeConfig();
  }

  private async initializeConfig() {
    try {
      const existingConfig = await db.select().from(appConfig).limit(1);
      
      if (existingConfig.length === 0) {
        // Create default config if none exists
        await db.insert(appConfig).values({
          appTitle: "Asistente IA - Compras Públicas",
          subtitle: "Armada de Chile",
          primaryColor: "#1e3a8a",
          fontSize: "medium",
          apiUrl: "https://flowiseai-railway-production-eb75.up.railway.app/api/v1/prediction/04648966-309e-4165-90ff-7c6c1ad83315",
          apiKey: "O3KCVc2jLESbFDaplHU_PgaayV652Rz6WJjELk8jFD4",
          requireUserPassword: false,
          userPassword: null,
          adminPassword: "admin123",
        });
      }
    } catch (error) {
      console.log("Database not ready yet, using fallback config");
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async getConfig(): Promise<AppConfig | undefined> {
    try {
      const result = await db.select().from(appConfig).limit(1);
      if (result.length === 0) {
        // Initialize default config if none exists
        await this.initializeConfig();
        const newResult = await db.select().from(appConfig).limit(1);
        return newResult[0];
      }
      return result[0];
    } catch (error) {
      console.log("Database error, using fallback config:", error instanceof Error ? error.message : String(error));
      return this.fallbackConfig;
    }
  }

  async updateConfig(configUpdate: Partial<InsertConfig>): Promise<AppConfig> {
    try {
      const existingConfig = await this.getConfig();
      if (!existingConfig) {
        throw new Error("Config not found");
      }

      const result = await db
        .update(appConfig)
        .set({ ...configUpdate, updatedAt: new Date() })
        .where(eq(appConfig.id, existingConfig.id))
        .returning();
      
      return result[0];
    } catch (error) {
      console.log("Database error updating config, using fallback:", error instanceof Error ? error.message : String(error));
      this.fallbackConfig = { ...this.fallbackConfig, ...configUpdate, updatedAt: new Date() };
      return this.fallbackConfig;
    }
  }

  async getMessages(): Promise<ChatMessage[]> {
    try {
      const result = await db.select().from(chatMessages).orderBy(chatMessages.createdAt);
      return result;
    } catch (error) {
      console.log("Database error getting messages:", error instanceof Error ? error.message : String(error));
      return [];
    }
  }

  async createMessage(insertMessage: InsertMessage): Promise<ChatMessage> {
    try {
      const result = await db.insert(chatMessages).values(insertMessage).returning();
      return result[0];
    } catch (error) {
      console.log("Database error creating message:", error instanceof Error ? error.message : String(error));
      // Return a mock message with ID for fallback
      return {
        id: randomUUID(),
        ...insertMessage,
        attachments: insertMessage.attachments || null,
        createdAt: new Date(),
      };
    }
  }

  async clearMessages(): Promise<void> {
    try {
      await db.delete(chatMessages);
    } catch (error) {
      console.log("Database error clearing messages:", error instanceof Error ? error.message : String(error));
    }
  }

  async createFile(insertFile: InsertFile): Promise<UploadedFile> {
    try {
      const result = await db.insert(uploadedFiles).values(insertFile).returning();
      return result[0];
    } catch (error) {
      console.log("Database error creating file:", error instanceof Error ? error.message : String(error));
      // Return a mock file with ID for fallback
      return {
        id: randomUUID(),
        ...insertFile,
        uploadedAt: new Date(),
      };
    }
  }

  async getFiles(): Promise<UploadedFile[]> {
    try {
      const result = await db.select().from(uploadedFiles).orderBy(uploadedFiles.uploadedAt);
      return result.reverse(); // Most recent first
    } catch (error) {
      console.log("Database error getting files:", error instanceof Error ? error.message : String(error));
      return [];
    }
  }

  async deleteFile(id: string): Promise<void> {
    try {
      await db.delete(uploadedFiles).where(eq(uploadedFiles.id, id));
    } catch (error) {
      console.log("Database error deleting file:", error instanceof Error ? error.message : String(error));
    }
  }
}

export const storage = new DbStorage();
