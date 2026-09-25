import { Router } from 'express';
import { VoiceController } from '../controllers/voice.controller.js';
import { voiceTokenRateLimiter } from '../middleware/rate-limit.middleware.js';

const router = Router();

router.post('/token', voiceTokenRateLimiter, VoiceController.createToken);

export default router;

