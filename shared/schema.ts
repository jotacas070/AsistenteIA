import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, timestamp, jsonb, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const appConfig = pgTable("app_config", {
  id: serial("id").primaryKey(),
  appTitle: text("app_title").notNull().default("Asistente IA - Compras Públicas"),
  subtitle: text("subtitle").notNull().default("Armada de Chile"),
  primaryColor: text("primary_color").notNull().default("#1e3a8a"),
  fontSize: text("font_size").notNull().default("medium"),
  apiUrl: text("api_url").notNull(),
  apiKey: text("api_key").notNull(),
  requireUserPassword: boolean("require_user_password").notNull().default(false),
  userPassword: text("user_password"),
  adminPassword: text("admin_password").notNull(),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  content: text("content").notNull(),
  sender: text("sender").notNull(), // 'user' or 'ai'
  attachments: jsonb("attachments"), // Array of file info
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const uploadedFiles = pgTable("uploaded_files", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  mimeType: text("mime_type").notNull(),
  size: text("size").notNull(),
  storageUrl: text("storage_url").notNull(),
  uploadedAt: timestamp("uploaded_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertConfigSchema = createInsertSchema(appConfig).omit({
  id: true,
  updatedAt: true,
}).partial().extend({
  appTitle: z.string().optional(),
  subtitle: z.string().optional(),
  primaryColor: z.string().optional(),
  fontSize: z.string().optional(),
  apiUrl: z.string().optional(),
  apiKey: z.string().optional(),
  requireUserPassword: z.boolean().optional(),
  userPassword: z.string().nullable().optional(),
  adminPassword: z.string().optional(),
});

export const insertMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export const insertFileSchema = createInsertSchema(uploadedFiles).omit({
  id: true,
  uploadedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type AppConfig = typeof appConfig.$inferSelect;
export type InsertConfig = z.infer<typeof insertConfigSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type UploadedFile = typeof uploadedFiles.$inferSelect;
export type InsertFile = z.infer<typeof insertFileSchema>;
