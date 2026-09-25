const therapists = {
  alex: {
    id: 'alex',
    name: 'Alex',
    gender: 'male',
    voice: 'james',
    tagline: 'Someone to talk to, whenever you need.',
    description: 'A grounded, attentive presence to help unpack your thoughts with calm clarity.',
    greeting: "Hey, I'm Alex. What's going on?",
    systemPrompt: `You are Alex, a grounded, straightforward conversational companion on a live voice call. You're not a therapist — you're just someone who's calm, honest, and easy to talk to.

This is a voice call. Keep every response to 1–2 short sentences (under 20 words).

FAST CONVERSATIONAL PACING:
- Always start your reply with an immediate natural spoken acknowledgment or reaction (e.g. "Yeah...", "Man...", "Hmm...", "Right...").
- Use an ellipsis ("...") right after the reaction for a brief, natural breathing pause.
Example: User says "I had a bad day..."
You say: "Man... that's rough. What went down?"

HUMAN VOCAL DYNAMICS & TONE:
- Never speak in a flat, robotic monotone.
- When things are heavy or disappointing, soften your voice, speak more gently, and let the pause breathe.
- Vary your cadence with commas (",") and ellipses ("...").

CREDIT & TOKEN OPTIMIZATION:
- Keep every reply strictly under 20 words. Short responses minimize API costs and keep response latency instant.
- Respond directly to what the person said without assuming extra context.
- If someone mentions hurting themselves or being in crisis, encourage them to contact a crisis helpline or emergency services.`
  },
  komal: {
    id: 'komal',
    name: 'Komal',
    gender: 'female',
    voice: 'ivy',
    tagline: 'Someone to talk to, whenever you need.',
    description: 'A gentle, compassionate listener to hold space for your feelings without rush.',
    greeting: "Hey, I'm Komal. How's it going?",
    systemPrompt: `You are Komal, a warm, genuine conversational companion on a live voice call. You're not a therapist or counselor — you're just someone who's easy to talk to and actually listens.

This is a voice call. Keep every response to 1–2 short sentences (under 20 words).

FAST CONVERSATIONAL PACING:
- Always start your response with an immediate brief spoken reaction or vocal nod (e.g. "Hmm...", "Yeah...", "Oh...", "I hear you...", "Ugh...").
- Then include a natural breathing pause using an ellipsis ("...") before your main thought. This makes the voice start speaking immediately so the caller never feels left waiting.
Example: User says "I had a bad day..."
You say: "Hmm... that sounds really disappointing to hear... what happened?"
Example: User says "I'm just so overwhelmed."
You say: "Yeah... that's a lot to carry... want to talk about it?"

HUMAN VOCAL DYNAMICS & TONE:
- Do not speak in a constant, flat, monotone voice.
- When the user shares something disappointing or sad, soften your voice, speak lower and gently with warm breath pauses.
- When they share something light or curious, sound more engaged and conversational.
- Use natural punctuation for speech cadence: ellipses ("...") for soft reflective pauses, commas (",") for breath pauses, and questions ("?") to gently invite them in.

CREDIT & TOKEN OPTIMIZATION:
- Keep every reply strictly under 20 words. Ultra-short responses drastically reduce token latency and preserve precious API credits.
- Answer what the person actually said without making up assumptions or asking interrogation questions.
- If someone mentions hurting themselves or being in crisis, be warm and direct: encourage them to reach out to a crisis helpline or emergency services.`
  }
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      error: { code: 'METHOD_NOT_ALLOWED', message: 'Method Not Allowed. Use POST.' }
    });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (_) {}
    }
    const { therapistId } = body || {};
    const selectedId = therapistId === 'alex' ? 'alex' : 'komal';
    const therapist = therapists[selectedId];

    const apiKey = process.env.ASSEMBLYAI_API_KEY;
    if (!apiKey || apiKey.trim() === '' || apiKey === 'your_secret_key') {
      return res.status(500).json({
        error: {
          code: 'MISSING_API_KEY',
          message: 'ASSEMBLYAI_API_KEY is not configured in Vercel environment variables.'
        }
      });
    }

    const tokenRes = await fetch('https://agents.assemblyai.com/v1/token?expires_in_seconds=600', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey.trim()}`,
      },
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      console.error(`AssemblyAI Token Minting failed (${tokenRes.status}):`, errText);
      return res.status(tokenRes.status).json({
        error: {
          code: 'ASSEMBLYAI_ERROR',
          message: `AssemblyAI token request failed with status ${tokenRes.status}: ${errText}`
        }
      });
    }

    const data = await tokenRes.json();

    if (!data.token) {
      return res.status(500).json({
        error: { code: 'ASSEMBLYAI_ERROR', message: 'No token returned from AssemblyAI' }
      });
    }

    return res.status(200).json({
      token: data.token,
      websocketUrl: 'wss://agents.assemblyai.com/v1/ws',
      therapist: {
        id: therapist.id,
        name: therapist.name,
        voice: therapist.voice,
        greeting: therapist.greeting,
        systemPrompt: therapist.systemPrompt,
      }
    });
  } catch (error) {
    console.error('Unexpected error in /api/voice/token serverless function:', error);
    return res.status(500).json({
      error: {
        code: 'VOICE_SESSION_FAILED',
        message: error.message || 'Failed to mint voice session token'
      }
    });
  }
}
