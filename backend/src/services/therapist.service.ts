import { therapists } from '../config/therapists.js';
import { TherapistConfig, TherapistId, TherapistPublicInfo } from '../types/index.js';

export class TherapistService {
  public static getAllTherapists(): TherapistPublicInfo[] {
    return Object.values(therapists).map(({ id, name, gender, description, tagline }) => ({
      id,
      name,
      gender,
      description,
      tagline
    }));
  }

  public static getTherapistById(id: string): TherapistConfig | null {
    if (id === 'alex' || id === 'komal') {
      return therapists[id as TherapistId];
    }
    return null;
  }

  public static isValidTherapist(id: string): id is TherapistId {
    return id === 'alex' || id === 'komal';
  }
}

