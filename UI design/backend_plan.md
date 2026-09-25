# Komal.ai --- V1 Backend Plan

## Goal

Build only the backend needed for the browser-based MVP:

-   No login/signup
-   No database
-   No payments
-   No subscriptions
-   Real-time voice conversation
-   Alex and Komal therapist configurations
-   Live transcript for Chat Log
-   New Chat
-   One saved conversation per browser
-   Basic rate limiting, validation, CORS, and error handling

## Architecture

``` text
Browser / Next.js
      |
      | REST: request temporary voice authorization
      v
Node.js + Express
      |
      | securely uses AssemblyAI API key
      v
AssemblyAI Voice Agent
      ^
      | realtime voice + transcript
      |
Browser

Browser localStorage
  ├── current conversation
  ├── saved conversation
  └── chat history
```

The backend should create the temporary authorization/session required
by the current AssemblyAI Voice Agent API. The browser should then
establish the realtime voice connection directly with AssemblyAI where
supported, rather than proxying every audio packet through Express.

## Recommended Stack

-   Node.js
-   TypeScript
-   Express.js
-   AssemblyAI Voice Agent API
-   localStorage for V1 persistence
-   dotenv
-   CORS middleware
-   rate limiting middleware

Do not add PostgreSQL, Redis, authentication, or cloud storage yet.

## Folder Structure

``` text
backend/
├── src/
│   ├── server.ts
│   ├── app.ts
│   ├── routes/
│   │   ├── health.routes.ts
│   │   ├── voice.routes.ts
│   │   └── therapist.routes.ts
│   ├── controllers/
│   │   ├── voice.controller.ts
│   │   └── therapist.controller.ts
│   ├── services/
│   │   ├── assemblyai.service.ts
│   │   └── therapist.service.ts
│   ├── config/
│   │   └── therapists.ts
│   ├── middleware/
│   │   ├── error.middleware.ts
│   │   └── rate-limit.middleware.ts
│   └── types/
│       └── index.ts
├── .env
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## Environment Variables

`.env`:

``` env
PORT=4000
ASSEMBLYAI_API_KEY=your_secret_key
FRONTEND_URL=http://localhost:3000
```

`.env.example`:

``` env
PORT=4000
ASSEMBLYAI_API_KEY=
FRONTEND_URL=http://localhost:3000
```

Never expose the AssemblyAI API key to the browser. Never commit `.env`.

## API Endpoints

### GET `/health`

Used to verify that the backend is running.

Response:

``` json
{
  "status": "ok"
}
```

### GET `/api/therapists`

Returns available therapist configurations.

Example:

``` json
[
  {
    "id": "alex",
    "name": "Alex",
    "description": "Someone to talk to, whenever you need."
  },
  {
    "id": "komal",
    "name": "Komal",
    "description": "Someone to talk to, whenever you need."
  }
]
```

### GET `/api/therapists/:id`

Returns one therapist after validating the ID.

### POST `/api/voice/token`

Request:

``` json
{
  "therapistId": "komal"
}
```

Server flow:

``` text
receive therapistId
      ↓
validate therapist
      ↓
load therapist configuration
      ↓
create temporary AssemblyAI Voice Agent authorization/session
      ↓
return temporary credential/config
```

Response shape should follow the current AssemblyAI Voice Agent API
documentation.

Do not copy parameters from old tutorials without checking the current
API docs.

## Therapist Configuration

Keep therapist data in one configuration file.

Conceptually:

``` ts
export const therapists = {
  alex: {
    id: "alex",
    name: "Alex",
    voice: "...",
    description: "Someone to talk to, whenever you need.",
    systemPrompt: "..."
  },
  komal: {
    id: "komal",
    name: "Komal",
    voice: "...",
    description: "Someone to talk to, whenever you need.",
    systemPrompt: "..."
  }
};
```

Use the current AssemblyAI-supported voice identifiers when implementing
this.

## Personality Prompt

Each therapist can have a separate conversational configuration.

Example direction for Komal:

``` text
You are Komal, an AI emotional-support companion.

Personality:
- warm
- calm
- patient
- conversational
- non-judgmental
- concise
- attentive

Conversation style:
- speak naturally
- avoid long monologues
- acknowledge what the user says
- ask one useful follow-up question when appropriate
- do not overwhelm the user with advice
```

The product should not represent the AI as a licensed human therapist.

## Realtime Voice Flow

When the user presses `Start therapy`:

``` text
Frontend
   |
   | POST /api/voice/token
   v
Express
   |
   | validate therapist
   | create temporary authorization
   v
AssemblyAI
   |
   | temporary credential/session
   v
Frontend
   |
   | microphone permission
   | realtime Voice Agent connection
   v
AssemblyAI
   |
   ├── user speech
   ├── transcription
   ├── AI response
   └── generated voice
   |
   v
Frontend
```

The exact connection method and session/token fields must match the
current AssemblyAI Voice Agent API/SDK.

## Conversation State

The frontend owns the active conversation state.

``` ts
type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: number;
};

type Conversation = {
  id: string;
  therapistId: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
};
```

Voice and Chat Log use the same `messages` state.

``` text
Voice conversation
        +
Chat Log
        |
        v
same conversation state
```

## Transcript Handling

Realtime transcripts may arrive as partial and final results.

Do not create a new message for every partial result.

Instead:

``` text
partial transcript
      ↓
update current message
      ↓
final transcript
      ↓
commit message
```

Example:

``` text
"I've been..."
"I've been feeling..."
"I've been feeling overwhelmed."
```

These should remain one user message.

Do the same for assistant output when the API provides incremental
transcript events.

## Microphone Pause

The play/pause control must represent the real microphone state.

States:

``` text
LISTENING
PAUSED
```

Listening:

-   microphone input active
-   waveform active
-   status: `I'm listening`

Paused:

-   microphone input stopped/muted according to the Voice Agent API/SDK
-   waveform becomes minimal/static
-   status: `Paused`

Do not only change the button visually while continuing to capture
microphone input.

## Waveform

Keep waveform processing in the frontend.

``` text
microphone audio
      ↓
browser Web Audio analyser
      ↓
amplitude/frequency data
      ↓
waveform animation
```

Do not send waveform data through the backend.

Recommended visual states:

``` text
IDLE
LISTENING
THINKING
AI_SPEAKING
PAUSED
ERROR
```

## Local Storage

V1 does not need a database.

Use:

``` text
localStorage
```

Possible structure:

``` json
{
  "currentConversation": {},
  "savedConversation": {},
  "history": []
}
```

Use one application key if possible, for example:

``` text
komal_app_state
```

## Free Tier

For the prototype:

``` text
one browser
    ↓
one saved conversation
```

When saving:

``` text
savedConversation exists?
        |
    +---+---+
    |       |
   NO      YES
    |       |
  SAVE    show limit
```

Show:

> Your free plan includes 1 saved conversation.

This is only a prototype limitation. It is not a secure commercial
subscription system because users can clear browser storage.

## New Chat

When the user selects `New chat`:

``` text
current conversation
       ↓
new conversation ID
       ↓
empty messages
```

Do not automatically delete the saved conversation.

## Chat History

V1 history is local:

``` text
localStorage
     ↓
Chat History screen
```

Example:

``` text
Chat history

────────────────────

Feeling overwhelmed
Tonight
```

Clicking the item loads the saved conversation.

## Save Chat

For V1:

``` text
Save Chat
    ↓
check savedConversation
    ↓
if empty → save
if occupied → show free-tier limit
```

No backend request is required for this prototype.

## Error Handling

Return consistent JSON errors.

Example:

``` json
{
  "error": {
    "code": "VOICE_SESSION_FAILED",
    "message": "Unable to start the voice session."
  }
}
```

Possible codes:

``` text
INVALID_THERAPIST
VOICE_SESSION_FAILED
ASSEMBLYAI_ERROR
RATE_LIMITED
INTERNAL_ERROR
```

Never return API keys, stack traces, or internal credentials.

Frontend should convert errors into friendly messages.

## Rate Limiting

Protect the public voice-token endpoint.

At minimum, rate-limit:

``` text
POST /api/voice/token
```

Purpose:

-   prevent accidental request loops
-   reduce abuse
-   protect AssemblyAI credits
-   prevent repeated session creation

Tune the exact limit after testing.

## CORS

Development:

``` text
Frontend → http://localhost:3000
Backend  → http://localhost:4000
```

Allow the frontend origin explicitly.

Production should use the actual deployed frontend domain.

Avoid an unrestricted `*` origin for the production API.

## Safety Behaviour

Because the product deals with emotional support, the AI configuration
should:

-   identify itself as AI when relevant
-   avoid claiming to be a licensed therapist
-   avoid pretending to diagnose medical conditions
-   avoid presenting itself as emergency services
-   respond supportively to distress
-   encourage appropriate professional/emergency help when a user
    indicates immediate danger or an emergency

Keep this safety behaviour conservative and clear for V1.

## What the Backend Should NOT Do

The backend should not:

``` text
❌ render UI
❌ generate waveform animations
❌ proxy every audio packet unnecessarily
❌ permanently store every conversation
❌ manage accounts
❌ manage payments
❌ manage subscriptions
❌ serve therapist artwork
```

## Local Development

Run frontend and backend separately.

``` text
Frontend
npm run dev
→ http://localhost:3000
```

``` text
Backend
npm run dev
→ http://localhost:4000
```

Test:

``` text
GET http://localhost:4000/health
```

Expected:

``` json
{
  "status": "ok"
}
```

## Implementation Order

### Phase 1 --- Backend Foundation

1.  Create Node/TypeScript project.
2.  Install Express.
3.  Add `dotenv`.
4.  Add CORS.
5.  Add `/health`.
6.  Confirm local server works.

### Phase 2 --- Therapist Configuration

7.  Create Alex configuration.
8.  Create Komal configuration.
9.  Add voice identifiers.
10. Add system/personality prompts.
11. Add therapist endpoints.

### Phase 3 --- AssemblyAI

12. Add server-side AssemblyAI API key.
13. Implement `/api/voice/token`.
14. Test session/token creation.
15. Connect frontend to token endpoint.
16. Connect browser to AssemblyAI Voice Agent.
17. Test microphone input.
18. Test AI voice output.

### Phase 4 --- Conversation

19. Capture user transcript events.
20. Capture assistant transcript events.
21. Handle partial transcripts.
22. Build shared `Message[]` state.
23. Connect Chat Log to that state.
24. Implement play/pause.
25. Implement waveform states.

### Phase 5 --- Local Persistence

26. Save current conversation to localStorage.
27. Implement Save Chat.
28. Enforce one saved conversation.
29. Implement New Chat.
30. Implement Chat History.

### Phase 6 --- Reliability

31. Add microphone-denied handling.
32. Add network failure handling.
33. Add AssemblyAI failure handling.
34. Add session timeout/reconnect handling where appropriate.
35. Add rate limiting.
36. Restrict CORS.
37. Verify secrets are never sent to the client.

### Phase 7 --- Deployment

38. Deploy backend.
39. Set production environment variables.
40. Set production CORS origin.
41. Test voice connection from deployed frontend.
42. Test on Chrome desktop.
43. Test on mobile browser.
44. Check API credit usage.
45. Add a simple README.

## Final V1 Architecture

``` text
                         KOMAL.AI

                    ┌───────────────┐
                    │    Browser    │
                    │ Next.js/React │
                    └───────┬───────┘
                            │
                    REST    │
                            ▼
                    ┌───────────────┐
                    │ Node + Express│
                    │               │
                    │ /health       │
                    │ /therapists   │
                    │ /voice/token  │
                    └───────┬───────┘
                            │
                            │ secure API request
                            ▼
                    ┌───────────────┐
                    │  AssemblyAI   │
                    │ Voice Agent   │
                    └───────┬───────┘
                            │
                    realtime│voice/transcript
                            ▼
                    ┌───────────────┐
                    │    Browser    │
                    │               │
                    │ Waveform      │
                    │ Voice UI      │
                    │ Chat Log      │
                    └───────┬───────┘
                            │
                            ▼
                       localStorage
                       ├── current chat
                       ├── saved chat
                       └── history
```

## V1 Success Criteria

The backend is ready when this entire flow works:

``` text
Open website
    ↓
Choose Alex or Komal
    ↓
Click Start Therapy
    ↓
Browser asks for microphone permission
    ↓
Voice Agent starts
    ↓
User speaks
    ↓
AI responds with voice
    ↓
Transcript appears in Chat Log
    ↓
Pause stops microphone listening
    ↓
Play resumes listening
    ↓
Save Chat stores one conversation
    ↓
New Chat creates a fresh conversation
    ↓
Chat History opens the saved conversation
```

## Core Principle

**Keep the backend boring.**

The impressive part of Komal.ai should be the experience:

``` text
Choose someone
      ↓
Start therapy
      ↓
Speak naturally
      ↓
AI responds naturally
      ↓
Conversation appears as text
      ↓
Pause whenever you want
      ↓
Save one conversation
```

The backend only needs to make that experience **secure, reliable, and
fast**.

Once V1 works, authentication, a real database, cloud history,
subscriptions, analytics, and other infrastructure can be added without
changing the basic voice-first product concept.
