import { Request, Response, NextFunction } from 'express';
import { TherapistService } from '../services/therapist.service.js';
import { AssemblyAIService } from '../services/assemblyai.service.js';
import { VoiceTokenRequest, VoiceTokenResponse } from '../types/index.js';

export class VoiceController {
  public static async createToken(
    req: Request<{}, {}, VoiceTokenRequest>,
    res: Response<VoiceTokenResponse | { error: any }>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { therapistId } = req.body;

      if (!therapistId || !TherapistService.isValidTherapist(therapistId)) {
        res.status(400).json({
          error: {
            code: 'INVALID_THERAPIST',
            message: `Invalid therapist ID '${therapistId}'. Must be either 'alex' or 'komal'.`
          }
        });
        return;
      }

      const therapist = TherapistService.getTherapistById(therapistId);
      if (!therapist) {
        res.status(404).json({
          error: {
            code: 'INVALID_THERAPIST',
            message: 'Therapist configuration could not be loaded.'
          }
        });
        return;
      }

      // Mint temporary token from AssemblyAI Voice Agent API
      const { token, websocketUrl } = await AssemblyAIService.createTemporaryToken();

      res.status(200).json({
        token,
        websocketUrl,
        therapist: {
          id: therapist.id,
          name: therapist.name,
          voice: therapist.voice,
          greeting: therapist.greeting,
          systemPrompt: therapist.systemPrompt,
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

