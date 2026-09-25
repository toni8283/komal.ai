import { Request, Response } from 'express';
import { TherapistService } from '../services/therapist.service.js';

export class TherapistController {
  public static getAll(_req: Request, res: Response): void {
    const therapists = TherapistService.getAllTherapists();
    res.json(therapists);
  }

  public static getById(req: Request, res: Response): void {
    const { id } = req.params;
    const therapistId = Array.isArray(id) ? id[0] : id;
    const therapist = TherapistService.getTherapistById(therapistId);

    if (!therapist) {
      res.status(404).json({
        error: {
          code: 'INVALID_THERAPIST',
          message: `Therapist '${id}' not found. Available therapists are 'alex' and 'komal'.`
        }
      });
      return;
    }

    res.json({
      id: therapist.id,
      name: therapist.name,
      gender: therapist.gender,
      tagline: therapist.tagline,
      description: therapist.description
    });
  }
}
