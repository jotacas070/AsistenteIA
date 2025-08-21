import { apiRequest } from "./queryClient";
import type { AppConfig, ChatMessage, UploadedFile } from "@shared/schema";

export const api = {
  // Config
  getConfig: async (): Promise<Omit<AppConfig, 'adminPassword' | 'apiKey'>> => {
    const res = await apiRequest('GET', '/api/config');
    return res.json();
  },

  updateConfig: async (config: Partial<AppConfig>) => {
    const res = await apiRequest('PUT', '/api/config', config);
    return res.json();
  },

  // Auth
  authAdmin: async (password: string) => {
    const res = await apiRequest('POST', '/api/auth/admin', { password });
    return res.json();
  },

  authUser: async (password: string) => {
    const res = await apiRequest('POST', '/api/auth/user', { password });
    return res.json();
  },

  // Messages
  getMessages: async (): Promise<ChatMessage[]> => {
    const res = await apiRequest('GET', '/api/messages');
    return res.json();
  },

  sendMessage: async (content: string, attachments?: any) => {
    const res = await apiRequest('POST', '/api/messages', { 
      content, 
      sender: 'user',
      attachments 
    });
    return res.json();
  },

  clearMessages: async () => {
    const res = await apiRequest('DELETE', '/api/messages');
    return res.json();
  },

  // Files
  uploadFiles: async (files: FileList): Promise<UploadedFile[]> => {
    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('files', file);
    });

    const res = await fetch('/api/files', {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      throw new Error('Failed to upload files');
    }

    return res.json();
  },

  getFiles: async (): Promise<UploadedFile[]> => {
    const res = await apiRequest('GET', '/api/files');
    return res.json();
  },

  deleteFile: async (id: string) => {
    const res = await apiRequest('DELETE', `/api/files/${id}`);
    return res.json();
  },
};
