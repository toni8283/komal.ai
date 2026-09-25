# Komal.ai Backend

Lightweight Node.js + TypeScript + Express backend for **Komal.ai** built for the **AssemblyAI Voice Agent Hackathon**.

## Overview

Per [`backend_plan.md`](../backend_plan.md):
- Securely mints temporary, single-use tokens from AssemblyAI (`POST https://agents.assemblyai.com/v1/token`) so `ASSEMBLYAI_API_KEY` is never exposed to the browser.
- Supplies therapist prompts and voice identifiers (`ivy` for Komal, `james` for Alex).
- Rate limits voice token generation to prevent abuse and API credit waste.
- Direct browser-to-AssemblyAI WebSocket streaming (`wss://agents.assemblyai.com/v1/ws?token=...`).

## Setup

1. In `backend/.env`, set your AssemblyAI API key:
   ```env
   PORT=4000
   ASSEMBLYAI_API_KEY=your_assemblyai_api_key_here
   FRONTEND_URL=http://localhost:5173
   ```

2. Run development server:
   ```bash
   npm run dev
   ```

3. Build production bundle:
   ```bash
   npm run build
   npm start
   ```

## Endpoints

- `GET /health` - Health check (`{"status": "ok"}`)
- `GET /api/therapists` - Lists available therapists (`alex`, `komal`)
- `GET /api/therapists/:id` - Get therapist metadata
- `POST /api/voice/token` - Requests single-use token from AssemblyAI Voice Agent API

