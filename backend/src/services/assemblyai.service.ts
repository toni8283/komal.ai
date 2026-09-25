export class AssemblyAIService {
  private static readonly TOKEN_ENDPOINT = 'https://agents.assemblyai.com/v1/token';
  private static readonly WEBSOCKET_URL = 'wss://agents.assemblyai.com/v1/ws';

  public static async createTemporaryToken(expiresInSeconds: number = 600): Promise<{ token: string; websocketUrl: string }> {
    const apiKey = process.env.ASSEMBLYAI_API_KEY;

    if (!apiKey || apiKey.trim() === '' || apiKey === 'your_secret_key') {
      const error = new Error('ASSEMBLYAI_API_KEY is not configured in environment variables');
      (error as any).code = 'MISSING_API_KEY';
      throw error;
    }

    try {
      const url = new URL(this.TOKEN_ENDPOINT);
      url.searchParams.set('expires_in_seconds', expiresInSeconds.toString());

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey.trim()}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`AssemblyAI Token Minting failed (${response.status}):`, errorText);
        const error = new Error(`AssemblyAI token request failed with status ${response.status}`);
        (error as any).code = 'ASSEMBLYAI_ERROR';
        (error as any).statusCode = response.status;
        throw error;
      }

      const data = (await response.json()) as { token: string };

      if (!data.token) {
        const error = new Error('No token returned from AssemblyAI');
        (error as any).code = 'ASSEMBLYAI_ERROR';
        throw error;
      }

      return {
        token: data.token,
        websocketUrl: this.WEBSOCKET_URL,
      };
    } catch (err: any) {
      if (err.code === 'MISSING_API_KEY' || err.code === 'ASSEMBLYAI_ERROR') {
        throw err;
      }
      console.error('Unexpected error requesting AssemblyAI token:', err.message);
      const networkError = new Error('Failed to connect to AssemblyAI Voice Agent service');
      (networkError as any).code = 'VOICE_SESSION_FAILED';
      throw networkError;
    }
  }
}

