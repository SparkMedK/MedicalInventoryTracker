# MedCabinet - Medical Practice Management System

## Overview

MedCabinet is a comprehensive medical practice management application built with a modern full-stack architecture. The system manages patient records, consultations, and provides dashboard analytics for healthcare providers. It features a clean, medical-themed interface designed for healthcare professionals.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state
- **Forms**: React Hook Form with Zod validation
- **Build Tool**: Vite with hot module replacement

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Connection**: Neon Database serverless connection
- **Validation**: Zod schemas for runtime type safety
- **Session Management**: PostgreSQL database with persistent storage

### Database Design
- **ORM**: Drizzle ORM with type-safe queries
- **Schema**: Two main entities - Patients and Consultations
- **Relationships**: One-to-many relationship between Patients and Consultations
- **Migrations**: Managed through Drizzle Kit

## Key Components

### Data Models
1. **Patients Table**
   - Personal information (name, DOB, gender, contact details)
   - Medical information (blood type, allergies, medications)
   - Insurance information (provider, policy number)
   - Emergency contact details

2. **Consultations Table**
   - Links to patient records via foreign key
   - Appointment scheduling and status tracking
   - Medical notes, diagnosis, and treatment records
   - Prescription management and follow-up scheduling

### Core Features
- **Patient Management**: Complete CRUD operations for patient records
- **Consultation Scheduling**: Appointment booking and status management
- **Dashboard Analytics**: Overview of practice statistics and today's appointments
- **Search Functionality**: Patient search across multiple fields
- **Responsive Design**: Mobile-first approach with medical theme

### UI Components
- **Layout**: Sidebar navigation with medical iconography
- **Forms**: Modal-based forms for patient and consultation management
- **Data Display**: Card-based layouts with status indicators
- **Theming**: Medical color palette with neutral base colors

## Data Flow

1. **Client Requests**: React components make API calls using TanStack Query
2. **Server Processing**: Express routes handle requests with Zod validation
3. **Database Operations**: Drizzle ORM executes type-safe database queries
4. **Response Handling**: JSON responses with proper error handling
5. **State Updates**: TanStack Query manages cache invalidation and updates

## External Dependencies

### Database
- **Neon Database**: Serverless PostgreSQL hosting
- **Connection Pool**: Managed through @neondatabase/serverless

### UI Framework
- **shadcn/ui**: Complete component library built on Radix UI
- **Radix UI**: Accessible, unstyled UI primitives
- **Tailwind CSS**: Utility-first CSS framework

### Development Tools
- **Vite**: Fast build tool with HMR
- **TypeScript**: Static type checking
- **Drizzle Kit**: Database migration tool
- **ESBuild**: Fast bundling for production

## Deployment Strategy

### Development
- **Local Development**: Vite dev server with Express backend
- **Hot Reloading**: Full-stack HMR with Vite middleware
- **Database**: Connects to remote Neon database instance

### Production Build
- **Frontend**: Vite builds static assets to dist/public
- **Backend**: ESBuild bundles server code to dist/index.js
- **Static Serving**: Express serves built frontend files
- **Environment**: Production mode with optimized builds

### Configuration
- **Environment Variables**: DATABASE_URL for database connection
- **Build Commands**: Separate build process for client and server
- **Type Safety**: Full TypeScript compilation checks

## Changelog

```
Changelog:
- June 29, 2025. Initial setup with complete medical cabinet management system
- June 29, 2025. Integrated PostgreSQL database replacing in-memory storage for persistent data
- June 29, 2025. Implemented comprehensive responsive design for mobile, tablet, and desktop screens
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```