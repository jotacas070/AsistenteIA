import type { Express, Request } from "express";
import express from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import { storage } from "./storage";
import { insertConfigSchema, insertMessageSchema, insertFileSchema } from "@shared/schema";
import { sendToFlowise } from "./lib/flowise";

const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req: any, file: any, cb: any) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/gif',
      'text/plain',
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get app configuration
  app.get("/api/config", async (req, res) => {
    try {
      const config = await storage.getConfig();
      if (!config) {
        return res.status(404).json({ error: "Configuration not found" });
      }
      
      // Don't send sensitive data to client
      const { adminPassword, apiKey, ...safeConfig } = config;
      res.json(safeConfig);
    } catch (error) {
      console.error("Error getting config:", error);
      res.status(500).json({ error: "Failed to get configuration" });
    }
  });

  // Update app configuration (admin only)
  app.put("/api/config", async (req, res) => {
    try {
      const validation = insertConfigSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid configuration data" });
      }

      const updatedConfig = await storage.updateConfig(validation.data);
      const { adminPassword, apiKey, ...safeConfig } = updatedConfig;
      res.json(safeConfig);
    } catch (error) {
      console.error("Error updating config:", error);
      res.status(500).json({ error: "Failed to update configuration" });
    }
  });

  // Admin authentication
  app.post("/api/auth/admin", async (req, res) => {
    try {
      const { password } = req.body;
      const config = await storage.getConfig();
      
      if (!config || config.adminPassword !== password) {
        return res.status(401).json({ error: "Invalid admin password" });
      }
      
      res.json({ success: true, apiKey: config.apiKey });
    } catch (error) {
      console.error("Error authenticating admin:", error);
      res.status(500).json({ error: "Authentication failed" });
    }
  });

  // User authentication
  app.post("/api/auth/user", async (req, res) => {
    try {
      const { password } = req.body;
      const config = await storage.getConfig();
      
      if (!config) {
        return res.status(500).json({ error: "Configuration not found" });
      }
      
      if (!config.requireUserPassword) {
        return res.json({ success: true });
      }
      
      if (config.userPassword !== password) {
        return res.status(401).json({ error: "Invalid user password" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error authenticating user:", error);
      res.status(500).json({ error: "Authentication failed" });
    }
  });

  // Get chat messages
  app.get("/api/messages", async (req, res) => {
    try {
      const messages = await storage.getMessages();
      res.json(messages);
    } catch (error) {
      console.error("Error getting messages:", error);
      res.status(500).json({ error: "Failed to get messages" });
    }
  });

  // Send message to AI
  app.post("/api/messages", async (req, res) => {
    try {
      const validation = insertMessageSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid message data" });
      }

      // Save user message
      const userMessage = await storage.createMessage({
        content: validation.data.content,
        sender: "user",
        attachments: validation.data.attachments,
      });

      // Get config for API settings
      const config = await storage.getConfig();
      if (!config) {
        return res.status(500).json({ error: "Configuration not found" });
      }

      try {
        // Send to Flowise API
        const attachments = Array.isArray(validation.data.attachments) 
          ? validation.data.attachments 
          : validation.data.attachments ? [validation.data.attachments] : [];
          
        const aiResponse = await sendToFlowise(
          validation.data.content,
          config.apiUrl,
          config.apiKey,
          attachments
        );

        // Save AI response
        const aiMessage = await storage.createMessage({
          content: aiResponse.text,
          sender: "ai",
          attachments: null,
        });

        res.json({
          userMessage,
          aiMessage,
        });
      } catch (aiError) {
        console.error("Error from Flowise API:", aiError);
        
        // Save error response
        const errorMessage = await storage.createMessage({
          content: "Lo siento, no pude procesar tu consulta en este momento. Por favor, intenta nuevamente más tarde.",
          sender: "ai",
          attachments: null,
        });

        res.json({
          userMessage,
          aiMessage: errorMessage,
          error: "AI service temporarily unavailable",
        });
      }
    } catch (error) {
      console.error("Error processing message:", error);
      res.status(500).json({ error: "Failed to process message" });
    }
  });

  // Clear chat messages
  app.delete("/api/messages", async (req, res) => {
    try {
      await storage.clearMessages();
      res.json({ success: true });
    } catch (error) {
      console.error("Error clearing messages:", error);
      res.status(500).json({ error: "Failed to clear messages" });
    }
  });

  // Upload files
  app.post("/api/files", upload.array('files', 5), async (req: any, res: any) => {
    try {
      const files = req.files;
      if (!files || !Array.isArray(files)) {
        return res.status(400).json({ error: "No files uploaded" });
      }

      const uploadedFiles = [];

      for (const file of files) {
        const fileData = {
          filename: file.filename,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size.toString(),
          storageUrl: `/uploads/${file.filename}`,
        };

        const validation = insertFileSchema.safeParse(fileData);
        if (!validation.success) {
          console.error("Invalid file data:", validation.error);
          continue;
        }

        const savedFile = await storage.createFile(validation.data);
        uploadedFiles.push(savedFile);
      }

      res.json(uploadedFiles);
    } catch (error) {
      console.error("Error uploading files:", error);
      res.status(500).json({ error: "Failed to upload files" });
    }
  });

  // Get uploaded files
  app.get("/api/files", async (req, res) => {
    try {
      const files = await storage.getFiles();
      res.json(files);
    } catch (error) {
      console.error("Error getting files:", error);
      res.status(500).json({ error: "Failed to get files" });
    }
  });

  // Delete file
  app.delete("/api/files/:id", async (req, res) => {
    try {
      await storage.deleteFile(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting file:", error);
      res.status(500).json({ error: "Failed to delete file" });
    }
  });

  // Serve uploaded files
  app.use('/uploads', express.static('uploads', {
    setHeaders: (res) => {
      res.header('Access-Control-Allow-Origin', '*');
    }
  }));

  const httpServer = createServer(app);
  return httpServer;
}
