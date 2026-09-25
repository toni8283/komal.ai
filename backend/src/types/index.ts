export type TherapistId = 'alex' | 'komal';

export interface TherapistConfig {
  id: TherapistId;
  name: string;
  gender: 'male' | 'female';
  voice: string;
  tagline: string;
  description: string;
  systemPrompt: string;
  greeting: string;
}

export interface TherapistPublicInfo {
  id: TherapistId;
  name: string;
  gender: 'male' | 'female';
  description: string;
  tagline: string;
}

export interface VoiceTokenRequest {
  therapistId: TherapistId;
}

export interface VoiceTokenResponse {
  token: string;
  websocketUrl: string;
  therapist: {
    id: TherapistId;
    name: string;
    voice: string;
    greeting: string;
    systemPrompt: string;
  };
}

export interface ApiErrorResponse {
  error: {
    code: 'INVALID_THERAPIST' | 'VOICE_SESSION_FAILED' | 'ASSEMBLYAI_ERROR' | 'RATE_LIMITED' | 'INTERNAL_ERROR' | 'MISSING_API_KEY';
    message: string;
  };
}

