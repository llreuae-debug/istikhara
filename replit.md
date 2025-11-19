# Istikhara - Quranic Verse Interpretation App

## Overview

Istikhara is a spiritual web application that enables users to receive divine guidance through Quranic verses. Users upload images of Quranic verses, and the application uses AI-powered vision and language models to extract the Arabic text and provide detailed Urdu interpretations including literal meaning, historical background, and spiritual messages.

The application emphasizes a reverent, minimalist design inspired by premium Islamic apps, with careful attention to Arabic and Urdu typography and a meditative user experience.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server for fast HMR and optimized production builds
- Client-side routing using Wouter (lightweight alternative to React Router)

**UI Component System**
- Shadcn UI components built on Radix UI primitives for accessible, customizable components
- Tailwind CSS for utility-first styling with custom design tokens
- Component configuration follows "New York" style variant from Shadcn
- Custom theming system supporting light/dark modes with CSS variables

**Design System Implementation**
- Sacred minimalism aesthetic with focus on reverence and clarity
- Multi-script typography system:
  - Arabic: Amiri and Scheherazade New fonts for Quranic text
  - Urdu: Noto Nastaliq Urdu with RTL support
  - English/UI: Inter and Poppins
- Islamic geometric pattern overlays using SVG
- Responsive spacing using Tailwind's 4-based scale

**State Management**
- TanStack Query (React Query) for server state management and caching
- Local component state using React hooks
- Theme persistence using localStorage

**Page Structure**
- Home page: Landing with upload interface and drag-and-drop zone
- Results page: Displays verse analysis with Arabic text and Urdu interpretation
- 404 page: Standard error handling

### Backend Architecture

**Server Framework**
- Express.js for HTTP server and API routing
- TypeScript for type safety across the stack
- Custom middleware for request logging and JSON parsing with raw body preservation

**Development & Production**
- Development: Vite middleware mode integrated with Express for HMR
- Production: Static file serving of built client assets
- Custom logging system with timestamp formatting

**API Design**
- RESTful endpoint: POST `/api/analyze-verse`
- Request validation using Zod schemas from shared types
- Error handling with appropriate HTTP status codes and user-friendly messages
- JSON response format with structured verse analysis data

**Authentication & Session Management**
- User schema defined using Drizzle ORM
- In-memory storage implementation (MemStorage class) for development
- PostgreSQL schema prepared for production deployment
- Session management configured with connect-pg-simple

### External Dependencies

**OpenAI Integration**
- GPT-5 vision model for image-to-text extraction of Arabic verses
- Two-step AI process:
  1. Vision API extracts Arabic text and identifies Surah/verse reference
  2. Language model generates Urdu interpretation with literal meaning, background context, and spiritual message
- JSON structured output for consistent parsing
- API key configuration via environment variables
- Comprehensive error handling for API failures

**Database Configuration**
- Drizzle ORM for type-safe database operations
- PostgreSQL as the target database (via Neon serverless driver)
- Schema-first approach with migrations in dedicated folder
- Environment-based connection configuration
- Users table with username/password fields and UUID primary keys
- Prepared for adding verse history and user preferences

**External Fonts**
- Google Fonts for Arabic (Amiri, Scheherazade New), Urdu (Noto Nastaliq Urdu), and UI fonts (Inter, Poppins)
- Preconnect optimization for font loading performance

**Development Tools**
- Replit-specific plugins for development experience:
  - Runtime error overlay
  - Cartographer for code navigation
  - Development banner
- ESBuild for backend bundling in production
- Drizzle Kit for database schema management and migrations

**Type Safety & Validation**
- Zod for runtime type validation and schema creation
- Shared schema types between client and server
- Drizzle-Zod integration for database schema validation
- TypeScript path aliases for clean imports (@/, @shared/, @assets/)

**UI Component Libraries**
- Radix UI primitives for 25+ accessible component types (dialogs, dropdowns, tooltips, etc.)
- Embla Carousel for image galleries
- CMDK for command palette interfaces
- Lucide React for consistent iconography
- Class Variance Authority for component variant management