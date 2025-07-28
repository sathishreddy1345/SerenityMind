# SerenityAI - Mental Health Companion

## Overview

SerenityAI is a full-stack mental health companion application built with React frontend and Node.js/Express backend. The app provides AI-powered chatbot interactions, mood tracking, habit management, and self-care tools to support users' mental wellness journey.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter for client-side routing
- **UI Library**: Shadcn/UI components with Radix UI primitives
- **Styling**: Tailwind CSS with custom mental health-themed color palette
- **State Management**: TanStack Query for server state management
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Style**: RESTful API with structured error handling
- **Session Management**: Express sessions with PostgreSQL storage
- **Middleware**: Custom logging, JSON parsing, and authentication middleware

### Database Architecture
- **Primary Database**: PostgreSQL with Neon serverless hosting
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Connection**: Connection pooling with @neondatabase/serverless

## Key Components

### Authentication System
- **Provider**: Replit Auth with OpenID Connect
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **Strategy**: Passport.js integration for authentication flows
- **Security**: HTTP-only cookies with secure session management

### AI Chatbot Service
- **Provider**: Hugging Face Transformers API
- **Model**: DialoGPT for conversational AI
- **Features**: 
  - Sentiment analysis for emotional tone detection
  - Crisis phrase detection with emergency support redirection
  - Context-aware responses with conversation history
  - Multiple personality modes (Calm Mentor, Energetic Coach, Funny Buddy)

### Mood Tracking System
- **Data Model**: Mood entries with 1-10 scale scoring and journal text
- **Visualization**: Chart.js integration for mood analytics and trends
- **Features**:
  - Daily mood logging with emoji-based selection
  - Weekly/monthly mood graphs
  - Correlation tracking between activities and mood
  - CSV export functionality for data portability

### Habit Management
- **Tracking**: Daily habit completion with streak counting
- **Persistence**: Database-backed habit storage with completion history
- **Analytics**: Streak visualization and progress tracking

### Self-Care Tools
- **Breathing Exercises**: 4-7-8 breathing pattern with guided modal
- **Daily Affirmations**: Positive messaging system
- **Meditation Tools**: Structured meditation sessions (placeholder for future expansion)

## Data Flow

### Client-Server Communication
1. **Authentication Flow**: Client → Replit Auth → Server session creation → Database user storage
2. **API Requests**: Client (React Query) → Express routes → Database operations → JSON responses
3. **Real-time Updates**: Optimistic updates with React Query cache invalidation
4. **Error Handling**: Centralized error boundaries with toast notifications

### Database Operations
1. **User Management**: CRUD operations for user profiles and preferences
2. **Mood Data**: Time-series storage of mood entries with analytical queries
3. **Chat History**: Persistent conversation storage with AI response caching
4. **Habit Tracking**: Daily completion records with streak calculations

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **drizzle-orm**: Type-safe database operations
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI component primitives
- **chart.js**: Data visualization for mood analytics

### AI/ML Services
- **Hugging Face API**: Natural language processing and generation
- **Environment Variables**: HF_TOKEN or HUGGING_FACE_API_KEY for service access

### Authentication
- **Replit Auth**: OAuth provider integration
- **OpenID Connect**: Standards-based authentication flow
- **Passport.js**: Authentication middleware and strategy management

### Development Tools
- **Vite**: Fast development server and build tool
- **TypeScript**: Type safety across frontend and backend
- **Tailwind CSS**: Utility-first styling framework
- **ESBuild**: Fast JavaScript bundling for production

## Deployment Strategy

### Build Process
1. **Frontend Build**: Vite builds React app to `dist/public`
2. **Backend Build**: ESBuild bundles server code to `dist/index.js`
3. **Database Setup**: Drizzle Kit handles schema migrations
4. **Environment Config**: DATABASE_URL and auth secrets required

### Production Architecture
- **Static Assets**: Frontend served from `dist/public`
- **API Server**: Express.js serving from `/api` routes
- **Database**: Neon PostgreSQL with connection pooling
- **Session Storage**: PostgreSQL sessions table for scalability

### Environment Requirements
- **DATABASE_URL**: PostgreSQL connection string
- **SESSION_SECRET**: Secure session encryption key
- **REPLIT_DOMAINS**: Allowed domains for OIDC
- **HF_TOKEN**: Hugging Face API access token
- **ISSUER_URL**: OpenID Connect issuer endpoint

### Scalability Considerations
- **Database**: Connection pooling prevents connection exhaustion
- **Sessions**: PostgreSQL storage allows horizontal scaling
- **Static Assets**: CDN-ready build output
- **API Rate Limiting**: Built-in logging for monitoring API usage