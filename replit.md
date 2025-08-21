# Overview

This is a full-stack AI assistant application specifically designed for "Compras Públicas" (Public Procurement) for the Chilean Navy. The application provides an intelligent chat interface that integrates with Flowise AI to answer procurement-related questions. It features a modern React frontend with shadcn/ui components, an Express.js backend, and Supabase PostgreSQL database support via Drizzle ORM. The system includes comprehensive admin controls, file upload capabilities with drag-and-drop support, and user authentication options.

## Current Status
✅ Application is running successfully on port 5000  
✅ Frontend and backend are fully integrated  
✅ Supabase database connection configured (with fallback support)  
✅ Admin panel with full customization features  
✅ File upload system with support for PDFs, images, and documents  
✅ Chat interface with real-time messaging and file attachments  
✅ User authentication system (optional password protection)  
✅ Flowise AI API integration for intelligent responses  

## Recent Implementation (August 2025)
- **Database Migration**: Migrated from in-memory storage to Supabase PostgreSQL with robust fallback mechanisms
- **File Attachment System**: Added drag-and-drop file uploads directly in chat interface
- **Enhanced Chat Interface**: Improved chat with file preview, attachment management, and copy functionality
- **Admin Customization**: Full admin panel with real-time color preview and API configuration
- **Error Handling**: Comprehensive error handling with graceful fallbacks for database connectivity issues

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom navy-themed color palette
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation schemas

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful endpoints for configuration, authentication, messages, and file operations
- **File Handling**: Multer middleware for multipart form uploads with file type validation
- **Development**: tsx for TypeScript execution and hot reloading

## Database & Storage
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Storage Strategy**: Dual implementation with in-memory fallback and database persistence

## Authentication & Security
- **Admin Authentication**: Password-based admin access for system configuration
- **User Authentication**: Optional password protection for end users
- **Session Management**: Express sessions with connect-pg-simple for PostgreSQL session storage
- **File Upload Security**: MIME type validation and file size limits (10MB)

## AI Integration
- **AI Service**: Flowise AI integration via REST API
- **Chat Features**: Real-time message handling with file attachment support
- **Document Processing**: Support for PDF, DOC, DOCX, images, and plain text uploads
- **Response Handling**: Structured AI responses with source documents and follow-up prompts

## Application Configuration
- **Dynamic Theming**: Configurable app title, subtitle, colors, and font sizes
- **API Configuration**: Runtime configurable Flowise API endpoints and authentication
- **User Access Control**: Toggle-based user password requirements
- **Responsive Design**: Mobile-first approach with adaptive layouts

# External Dependencies

## Core Framework Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL connection driver for Neon Database
- **drizzle-orm**: Type-safe ORM for database operations
- **express**: Web application framework for Node.js backend
- **@tanstack/react-query**: Server state management and data fetching

## UI and Styling
- **@radix-ui/***: Comprehensive collection of unstyled, accessible UI primitives
- **tailwindcss**: Utility-first CSS framework for styling
- **class-variance-authority**: Utility for creating variant-based component APIs
- **lucide-react**: Icon library for React applications

## Development and Build Tools
- **vite**: Fast build tool and development server
- **typescript**: Static type checking
- **drizzle-kit**: Database migration and introspection toolkit
- **tsx**: TypeScript execution environment for development

## File and Session Management
- **multer**: Middleware for handling multipart/form-data file uploads
- **connect-pg-simple**: PostgreSQL session store for Express sessions

## AI Integration
- **Flowise AI Platform**: External AI service for natural language processing and document analysis
- Custom integration layer for handling chat interactions and file processing

## Database Infrastructure
- **Neon Database**: Serverless PostgreSQL provider for production database hosting
- **PostgreSQL**: Relational database system for data persistence