# Product Requirements Document (PRD) - Metis

## Project Overview
Metis is a full-stack application featuring a modern Next.js frontend and a high-performance FastAPI backend. The project aims to provide a robust starting point for building AI-powered applications with a focus on developer experience and UI excellence.

## Goals
- Initialize a `client` folder with a Next.js project using the `src/` directory.
- Integrate **Tailwind CSS** for styling.
- Integrate **shadcn/ui** with **Dark Theme** by default.
- Initialize a `server` folder with a basic **FastAPI** server.
- Provide **Docker** configuration for seamless local hosting and orchestration.

## Tech Stack
- **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui, next-themes.
- **Backend**: Python, FastAPI, Uvicorn.
- **Orchestration**: Docker, Docker Compose.
- **Package Manager**: npm (frontend), pip (backend).

## Project Structure
```bash
/
├── client/          # Next.js frontend
│   ├── src/         # Source directory
│   │   ├── app/     # Next.js app directory
│   │   ├── components/ # shadcn components
│   │   └── ...
│   ├── Dockerfile   # Frontend Dockerfile
│   └── ...
├── server/          # FastAPI backend
│   ├── server.py    # Main server entry point
│   ├── Dockerfile   # Backend Dockerfile
│   └── ...
├── docker-compose.yml # Local orchestration
└── PRD.md           # This document
```

## Functional Requirements
### Client (Frontend)
- Clean Next.js setup with App Router and `src/` directory.
- Tailwind CSS configured.
- shadcn/ui initialized.
- **Dark Theme enabled as the default.**
- Basic responsive layout.

### Server (Backend)
- FastAPI instance initialized.
- Root endpoint returning health status.
- Basic error handling.
- CORS configured for local development.

### Infrastructure (Local Hosting)
- `Dockerfile` for the client (optimized for development).
- `Dockerfile` for the server (Python slim image).
- `docker-compose.yml` that brings up both services and enables hot-reloading if possible.

## Future Scope
- Integration with Gemini API for agentic features.
- Database integration (PostgreSQL/Supabase).
- Authentication (NextAuth.js or Clerk).
