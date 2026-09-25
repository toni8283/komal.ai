import app from './app.js';

const PORT = parseInt(process.env.PORT || '4000', 10);

app.listen(PORT, () => {
  console.log(`[Komal.ai Backend] Server running on http://localhost:${PORT}`);
  console.log(`[Komal.ai Backend] Health check: http://localhost:${PORT}/health`);
  console.log(`[Komal.ai Backend] Therapists API: http://localhost:${PORT}/api/therapists`);
  console.log(`[Komal.ai Backend] Voice Token API: http://localhost:${PORT}/api/voice/token`);
});

