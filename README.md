# Komal.ai — Someone's here. Talk to me.

> A warm, voice-first AI companion built for conversations — not conversations with a machine.

---

## 🌿 What is Komal.ai?

Most AI interactions start with a keyboard. You are asked to write prompts, structure sentences, and stare at a blinking cursor. But when you are overwhelmed, stressed, or lonely, articulating your thoughts into text is the last thing you want to do.

**Komal.ai starts with your voice.**

Komal is a voice-first conversational companion designed to listen, understand context, and respond naturally. It provides a judgment-free space to speak freely, unpack your thoughts, and feel a little lighter — anytime, day or night.

---

## 🕊️ How Komal.ai Helps People

### 1. Speak Instead of Typing
Thoughts and emotions are messy. You don't need "prompt engineering" or structured paragraphs here. Just speak whatever comes to mind — pauses, sighs, rambling, and all.

### 2. Natural Human Cadence
Traditional AI assistants sound like encyclopedias: they wait in awkward silence and dump essays. Komal responds with short, natural conversational turns (under 20 words) with real vocal acknowledgments ("*Hmm...*", "*Yeah...*", "*I hear you...*") and gentle breathing pauses.

### 3. A Calm, Judgment-Free Presence
Whether you had a exhausting day at work, feel anxious about the future, or just need to vent without burdening friends or family, Komal is always present, patient, and calm.

### 4. Grounding Editorial Aesthetic
Instead of clinical white screens or sterile tech dashboards, Komal.ai is crafted with warm terracotta tones, ambient blurred lighting, film grain, and elegant editorial typography to create an atmosphere of warmth and safety.

---

## 📸 Screenshots

*(Screenshots from the live site)*

| Home Screen | About Page |
| :---: | :---: |
| ![Home Screen](./docs/screenshots/home.png) | ![About Page](./docs/screenshots/about.png) |

| Voice Therapy Session | Live Chat Log |
| :---: | :---: |
| ![Voice Therapy](./docs/screenshots/voice-therapy.png) | ![Chat Log](./docs/screenshots/chat-log.png) |

---

## ✨ Features

- **Real-Time Voice Streaming**: Ultra-low latency voice-to-voice interaction powered by AssemblyAI Voice Agent API.
- **Natural Conversational Pacing**: Instant spoken nods and soft pauses so you never feel left waiting.
- **Companion Personalities**:
  - **Komal**: Warm, empathetic, and gentle female listener.
  - **Alex**: Grounded, calm, and straightforward male presence.
- **Dynamic Waveform Visualization**: Interactive Canvas waveform that breathes and reacts dynamically as you talk and listen.
- **Editorial Chat Log**: Clean, typography-driven transcript panel with conversation history.
- **100% Serverless & Cloud-Ready**: Single-project deployment ready for Vercel with zero cold-start latency.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Framer Motion, CSS Modules
- **Voice Engine**: AssemblyAI Voice Agent API (Full-duplex WebSocket at 24kHz PCM)
- **Deployment**: Vercel (SPA Rewrites + Serverless Token Provider)
- **Design System**: Warm Editorial (Instrument Serif / Cormorant Garamond + Space Grotesk)

---

## 🚀 Getting Started Locally

### 1. Clone the repository
```bash
git clone git@github.com:toni8283/komal.ai.git
cd komal.ai
```

### 2. Setup Frontend
```bash
cd komal-ai
npm install
npm run dev
```

The frontend will run at `http://localhost:5173`.

### 3. Setup Backend (Optional for local dev)
```bash
cd ../backend
cp .env.example .env
# Add your ASSEMBLYAI_API_KEY inside .env
npm install
npm run dev
```

---

## 🌐 Deploy to Vercel

1. Import your GitHub repository into **[Vercel](https://vercel.com)**.
2. Set **Root Directory** to `komal-ai`.
3. In **Environment Variables**, add:
   - `ASSEMBLYAI_API_KEY`: *your_assemblyai_api_key*
4. Click **Deploy**.

---

## ⚠️ Disclaimer

Komal.ai is an empathetic AI conversational companion and is **not** a replacement for licensed mental health care, medical therapy, or emergency crisis services. If you or someone you know is in crisis, please contact your local emergency services or a mental health helpline.
