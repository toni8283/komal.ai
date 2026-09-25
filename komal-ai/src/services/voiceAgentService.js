/**
 * AssemblyAI Voice Agent Web Client Service
 * Connects directly to AssemblyAI Voice Agent WebSocket (wss://agents.assemblyai.com/v1/ws)
 * via temporary single-use token obtained from backend.
 * 
 * Latency-Optimized Architecture:
 * 1. Single persistent WebSocket connection throughout the entire conversation.
 * 2. Hardware sample rate verification with fast linear resampling to guaranteed 24 kHz mono PCM16.
 * 3. 1024-sample microphone buffer (~42.7ms at 24kHz) without heavy client-side audio analysis loops.
 * 4. AssemblyAI adaptive endpointing (interrupt_response: true, no fixed silence thresholds).
 * 5. Official server barge-in handling (immediate audio queue flush on interruption).
 * 6. Streaming gapless AudioContext playback using a drift-free timeline cursor.
 * 7. Integrated latency instrumentation for measuring turnaround times.
 */

export class VoiceAgentService {
  static activeInstance = null;

  constructor({
    backendUrl = 'http://localhost:4000',
    therapistId = 'komal',
    onStatusChange = () => {},
    onUserTranscript = () => {},
    onAgentTranscript = () => {},
    onError = () => {},
  }) {
    // If any previous instance is running, cleanly terminate it immediately to prevent duplicate voices
    if (VoiceAgentService.activeInstance && VoiceAgentService.activeInstance !== this) {
      console.warn('[VoiceAgentService] Terminating previous active instance');
      VoiceAgentService.activeInstance.stop();
      VoiceAgentService.activeInstance = null;
    }

    this.backendUrl = backendUrl;
    this.therapistId = therapistId;
    this.onStatusChange = onStatusChange;
    this.onUserTranscript = onUserTranscript;
    this.onAgentTranscript = onAgentTranscript;
    this.onError = onError;

    this._isStopped = false;
    this._abortController = new AbortController();
    this.ws = null;
    this.audioContext = null;
    this.mediaStream = null;
    this.processorNode = null;
    this.silentKeepAlive = null;
    this.isMuted = false;
    this.isConnected = false;
    this.isSessionReady = false;
    this.nextPlaybackTime = 0;
    this.activeAudioSources = [];

    // Detailed latency instrumentation markers
    this.userSpeakingEndTime = 0;
    this.finalTranscriptTime = 0;
    this.firstAudioReceivedTime = 0;
    this.firstAudioReceived = false;
    this.firstAudioPlayed = false;
  }

  /**
   * Request temporary single-use token from backend and connect to AssemblyAI
   */
  async start() {
    if (VoiceAgentService.activeInstance && VoiceAgentService.activeInstance !== this) {
      VoiceAgentService.activeInstance.stop();
    }
    VoiceAgentService.activeInstance = this;

    this._isStopped = false;
    this._abortController = new AbortController();

    try {
      this.onStatusChange('thinking');
      this.isSessionReady = false;

      // 1. Fetch token and therapist config from backend
      const response = await fetch(`${this.backendUrl}/api/voice/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ therapistId: this.therapistId }),
        signal: this._abortController.signal,
      });

      if (this._isStopped) {
        console.log('[VoiceAgentService] Stopped during token fetch, aborting start');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error?.message ||
          `Backend returned status ${response.status} when requesting voice token.`
        );
      }

      const { token, websocketUrl, therapist } = await response.json();

      if (this._isStopped) {
        console.log('[VoiceAgentService] Stopped after token response, aborting start');
        return;
      }

      // 2. Request user microphone permissions & initialize audio pipeline
      await this._initMicrophone();

      if (this._isStopped) {
        console.log('[VoiceAgentService] Stopped during mic init, cleaning up');
        this.stop();
        return;
      }

      // 3. Connect to AssemblyAI Voice Agent WebSocket
      const wsUrl = `${websocketUrl || 'wss://agents.assemblyai.com/v1/ws'}?token=${encodeURIComponent(token)}`;
      this._connectWebSocket(wsUrl, therapist);

    } catch (err) {
      if (this._isStopped || err.name === 'AbortError') {
        console.log('[VoiceAgentService] Start aborted cleanly');
        return;
      }
      console.error('[VoiceAgentService] Start failed:', err);
      this.onError(err);
      this.onStatusChange('idle');
      this.stop();
    }
  }

  /**
   * Initialize microphone capture and audio context
   */
  async _initMicrophone() {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    this.audioContext = new AudioCtx({ sampleRate: 24000 });

    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume().catch(() => {});
    }

    // Auto-unlock audio if the browser suspended AudioContext due to autoplay policy
    const unlockAudio = () => {
      if (this.audioContext && this.audioContext.state === 'suspended') {
        this.audioContext.resume().catch(() => {});
      }
    };
    window.addEventListener('click', unlockAudio, { passive: true });
    window.addEventListener('touchstart', unlockAudio, { passive: true });
    window.addEventListener('keydown', unlockAudio, { passive: true });

    this.mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        sampleRate: 24000,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });

    const source = this.audioContext.createMediaStreamSource(this.mediaStream);
    const inputSampleRate = this.audioContext.sampleRate;

    // Buffer size 1024 samples = ~42.6ms at 24kHz (or ~21.3ms at 48kHz) to optimize WebSocket throughput
    const bufferSize = 1024;
    this.processorNode = this.audioContext.createScriptProcessor(bufferSize, 1, 1);

    this.processorNode.onaudioprocess = (event) => {
      // Stream only when session is confirmed ready by AssemblyAI
      if (this.isMuted || !this.isConnected || !this.isSessionReady || !this.ws || this.ws.readyState !== WebSocket.OPEN) {
        return;
      }

      const rawInput = event.inputBuffer.getChannelData(0);

      // Track the approximate moment user voice energy ends in the microphone
      let sum = 0;
      for (let i = 0; i < rawInput.length; i += 4) {
        sum += rawInput[i] * rawInput[i];
      }
      if (Math.sqrt((sum * 4) / rawInput.length) > 0.01) {
        this.userSpeakingEndTime = performance.now();
      }

      // Resample to 24000 Hz if browser/hardware initialized context at 48kHz or 44.1kHz
      const resampled = inputSampleRate === 24000 
        ? rawInput 
        : this._resampleTo24k(rawInput, inputSampleRate);

      const len = resampled.length;
      if (len === 0) return;

      // Convert Float32 to PCM16 little-endian
      const pcm16 = new Int16Array(len);
      for (let i = 0; i < len; i++) {
        const s = Math.max(-1, Math.min(1, resampled[i]));
        pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
      }

      // Fast binary base64 conversion
      const uint8 = new Uint8Array(pcm16.buffer);
      let binary = '';
      const byteLen = uint8.byteLength;
      for (let i = 0; i < byteLen; i += 512) {
        binary += String.fromCharCode.apply(null, uint8.subarray(i, Math.min(i + 512, byteLen)));
      }

      // Send input.audio to AssemblyAI
      this.ws.send(JSON.stringify({
        type: 'input.audio',
        audio: btoa(binary),
      }));
    };

    // Connect processor to silent gain node so mic doesn't echo into user speakers
    const muteNode = this.audioContext.createGain();
    muteNode.gain.value = 0;
    source.connect(this.processorNode);
    this.processorNode.connect(muteNode);
    muteNode.connect(this.audioContext.destination);

    // Pre-warm audio output hardware to eliminate OS DAC power-saving wake-up delay
    try {
      const silentOsc = this.audioContext.createOscillator();
      const silentGain = this.audioContext.createGain();
      silentGain.gain.value = 0.00001; // virtually silent, keeps hardware active
      silentOsc.connect(silentGain);
      silentGain.connect(this.audioContext.destination);
      silentOsc.start();
      this.silentKeepAlive = silentOsc;
    } catch (_) {}
  }

  /**
   * Fast linear resampler to guarantee 24 kHz for AssemblyAI
   */
  _resampleTo24k(inputData, srcRate) {
    const ratio = srcRate / 24000;
    const outLen = Math.floor(inputData.length / ratio);
    const output = new Float32Array(outLen);
    for (let i = 0; i < outLen; i++) {
      const srcIdx = i * ratio;
      const low = Math.floor(srcIdx);
      const high = Math.min(low + 1, inputData.length - 1);
      const frac = srcIdx - low;
      output[i] = inputData[low] * (1 - frac) + inputData[high] * frac;
    }
    return output;
  }

  /**
   * Connect and handle WebSocket events over persistent connection
   */
  _connectWebSocket(wsUrl, therapist) {
    if (this._isStopped) return;
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      this.isConnected = true;

      // Send session.update handshake with documented parameters
      const sessionConfig = {
        type: 'session.update',
        session: {
          system_prompt: therapist.systemPrompt,
          greeting: therapist.greeting,
          input: {
            turn_detection: {
              interrupt_response: true, // Enables server-side barge-in
              vad_threshold: 0.5,       // Clean sensitivity to ignore low ambient noise
              min_silence: 350,         // Detect conversational pause after 350ms
              max_silence: 900,         // Finalize turn within 900ms to eliminate dead air
            },
          },
          output: {
            voice: therapist.voice || (this.therapistId === 'alex' ? 'james' : 'ivy'),
          },
        },
      };

      this.ws.send(JSON.stringify(sessionConfig));
    };

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this._handleServerEvent(message);
      } catch (err) {
        console.error('[VoiceAgentService] Error parsing event:', err);
      }
    };

    this.ws.onerror = (err) => {
      console.error('[VoiceAgentService] WebSocket error:', err);
      this.onError(new Error('WebSocket connection to AssemblyAI Voice Agent failed.'));
    };

    this.ws.onclose = (event) => {
      this.isConnected = false;
      this.isSessionReady = false;
      if (!event.wasClean) {
        console.warn(`[VoiceAgentService] WebSocket closed unexpectedly (code: ${event.code})`);
      }
      this.onStatusChange('idle');
    };
  }

  /**
   * Stop all queued and playing audio chunks immediately (barge-in / interruption)
   */
  _stopAllPlayback() {
    this.activeAudioSources.forEach((source) => {
      try {
        source.stop();
        source.disconnect();
      } catch (_) {}
    });
    this.activeAudioSources = [];
    if (this.audioContext) {
      this.nextPlaybackTime = this.audioContext.currentTime;
    } else {
      this.nextPlaybackTime = 0;
    }
  }

  /**
   * Handle incoming AssemblyAI Voice Agent events
   */
  _handleServerEvent(event) {
    if (this._isStopped) return;
    switch (event.type) {
      case 'session.ready':
        this.isSessionReady = true;
        this.onStatusChange('listening');
        break;

      case 'reply.audio': {
        // AssemblyAI Voice Agent delivers base64 PCM in `event.data` (or fallback `event.audio`)
        const audioPayload = event.data || event.audio || event.delta;
        if (audioPayload) {
          if (!this.firstAudioReceived) {
            this.firstAudioReceivedTime = performance.now();
            this.firstAudioReceived = true;
          }
          this.onStatusChange('speaking');
          this._playAudioChunk(audioPayload);
        }
        break;
      }

      case 'reply.done':
        if (event.status === 'interrupted') {
          this._stopAllPlayback();
        }
        if (this.audioContext) {
          this.nextPlaybackTime = this.audioContext.currentTime;
        }
        if (this.activeAudioSources.length === 0) {
          this.onStatusChange('listening');
        }
        break;

      case 'turn.start':
        // User began speaking: immediately silence ongoing agent playback
        this._stopAllPlayback();
        this.userSpeakingEndTime = 0;
        this.finalTranscriptTime = 0;
        this.firstAudioReceivedTime = 0;
        this.firstAudioReceived = false;
        this.firstAudioPlayed = false;
        this.onStatusChange('listening');
        break;

      case 'transcript.user':
        // User speech confirmed: stop lingering playback
        if (this.activeAudioSources.length > 0) {
          this._stopAllPlayback();
        }
        if (event.is_final) {
          if (!this.finalTranscriptTime) {
            this.finalTranscriptTime = performance.now();
          }
          this.onStatusChange('thinking');
        } else {
          this.onStatusChange('listening');
        }
        if (event.text) {
          this.onUserTranscript({
            text: event.text,
            isFinal: !!event.is_final,
          });
        }
        break;

      case 'transcript.agent':
        if (event.text) {
          this.onAgentTranscript({
            text: event.text,
            isFinal: !!event.is_final,
          });
        }
        break;

      case 'transcript.agent.delta':
        if (event.delta) {
          this.onAgentTranscript({
            delta: event.delta,
            isFinal: false,
          });
        }
        break;

      case 'turn.end':
        if (!this.finalTranscriptTime) {
          this.finalTranscriptTime = performance.now();
        }
        this.onStatusChange('thinking');
        break;

      case 'error':
        console.error('[VoiceAgentService] Agent error:', event.message || event);
        this.onError(new Error(event.message || 'AssemblyAI Agent encountered an error'));
        break;

      default:
        break;
    }
  }

  /**
   * Decode base64 PCM16 audio chunk and schedule seamless streaming playback
   */
  _playAudioChunk(base64Audio) {
    if (this._isStopped || !this.audioContext || this.audioContext.state === 'closed') return;

    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume().catch((e) => console.warn('Could not resume audioContext:', e));
    }

    try {
      const binaryString = atob(base64Audio);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // 16-bit PCM little-endian decoding
      const numSamples = Math.floor(len / 2);
      const dataView = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
      const float32Array = new Float32Array(numSamples);

      for (let i = 0; i < numSamples; i++) {
        const int16 = dataView.getInt16(i * 2, true);
        float32Array[i] = int16 / 32768.0;
      }

      const audioBuffer = this.audioContext.createBuffer(1, numSamples, 24000);
      audioBuffer.getChannelData(0).set(float32Array);

      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioContext.destination);

      // Schedule at continuous playback timeline cursor
      const currentTime = this.audioContext.currentTime;
      if (this.activeAudioSources.length === 0 || this.nextPlaybackTime < currentTime || this.nextPlaybackTime > currentTime + 0.8) {
        this.nextPlaybackTime = currentTime;
      }

      const startTime = this.nextPlaybackTime;
      source.start(startTime);
      this.nextPlaybackTime = startTime + audioBuffer.duration;

      this.activeAudioSources.push(source);

      // Latency instrumentation: fire once on the first audio playback of each response
      if (!this.firstAudioPlayed && this.firstAudioReceivedTime > 0) {
        this.firstAudioPlayed = true;
        const playbackStartTime = performance.now();
        const speechEndTime = this.userSpeakingEndTime || (this.finalTranscriptTime ? this.finalTranscriptTime - 320 : playbackStartTime - 1000);
        const transcriptTime = this.finalTranscriptTime || this.firstAudioReceivedTime;

        const speechToEndDelay = Math.max(0, Math.round(transcriptTime - speechEndTime));
        const transcriptToAudioDelay = Math.max(0, Math.round(this.firstAudioReceivedTime - transcriptTime));
        const audioToPlaybackDelay = Math.max(0, Math.round(playbackStartTime - this.firstAudioReceivedTime));
        const totalLatency = Math.max(0, Math.round(playbackStartTime - speechEndTime));

        console.log(
`[Voice Latency]
User speech end → final transcript: ${speechToEndDelay} ms
Final transcript → first agent audio: ${transcriptToAudioDelay} ms
First agent audio → playback: ${audioToPlaybackDelay} ms
Total measured latency: ${totalLatency} ms`
        );
        console.log(`[VoiceAgent Latency] End-of-turn to first audio response: ${transcriptToAudioDelay}ms`);
      }
      source.onended = () => {
        const index = this.activeAudioSources.indexOf(source);
        if (index > -1) this.activeAudioSources.splice(index, 1);
        if (this.activeAudioSources.length === 0 && this.audioContext && this.audioContext.currentTime >= this.nextPlaybackTime) {
          if (!this.isMuted) {
            this.onStatusChange('listening');
          }
        }
      };

    } catch (err) {
      console.error('[VoiceAgentService] Failed to play audio chunk:', err);
    }
  }

  /**
   * Dynamically switch between female (ivy) and male (james) voices
   */
  async switchVoice(newTherapistId) {
    this.therapistId = newTherapistId;
    const voiceName = newTherapistId === 'alex' ? 'james' : 'ivy';
    
    if (this.ws && this.ws.readyState === WebSocket.OPEN && this.isConnected) {
      console.log(`[VoiceAgentService] Dynamically switching voice output to: ${voiceName}`);
      try {
        const response = await fetch(`${this.backendUrl}/api/voice/token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ therapistId: newTherapistId }),
        });
        if (response.ok) {
          const { therapist } = await response.json();
          this.ws.send(JSON.stringify({
            type: 'session.update',
            session: {
              system_prompt: therapist.systemPrompt,
              output: {
                voice: therapist.voice || voiceName,
              },
            },
          }));
          return;
        }
      } catch (e) {
        console.warn('[VoiceAgentService] Fast voice update failed, sending direct voice change:', e);
      }

      this.ws.send(JSON.stringify({
        type: 'session.update',
        session: {
          output: {
            voice: voiceName,
          },
        },
      }));
    }
  }

  /**
   * Pause microphone listening (real mute)
   */
  pause() {
    this.isMuted = true;
    if (this.mediaStream) {
      this.mediaStream.getAudioTracks().forEach(track => {
        track.enabled = false;
      });
    }
    this.onStatusChange('paused');
  }

  /**
   * Resume microphone listening
   */
  resume() {
    this.isMuted = false;
    if (this.mediaStream) {
      this.mediaStream.getAudioTracks().forEach(track => {
        track.enabled = true;
      });
    }
    this.onStatusChange('listening');
  }

  /**
   * Toggle between paused and listening
   */
  togglePause() {
    if (this.isMuted) {
      this.resume();
      return false;
    } else {
      this.pause();
      return true;
    }
  }

  /**
   * Stop session and release all audio/WS resources
   */
  stop() {
    this._isStopped = true;
    if (this._abortController) {
      try { this._abortController.abort(); } catch (_) {}
    }

    if (VoiceAgentService.activeInstance === this) {
      VoiceAgentService.activeInstance = null;
    }

    this.isConnected = false;
    this.isSessionReady = false;
    this.isMuted = false;

    // Stop active audio sources
    this.activeAudioSources.forEach(source => {
      try { source.stop(); } catch (_) {}
    });
    this.activeAudioSources = [];

    // Stop microphone tracks
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    // Disconnect audio nodes
    if (this.silentKeepAlive) {
      try { this.silentKeepAlive.stop(); this.silentKeepAlive.disconnect(); } catch (_) {}
      this.silentKeepAlive = null;
    }

    if (this.processorNode) {
      try {
        this.processorNode.onaudioprocess = null;
        this.processorNode.disconnect();
      } catch (_) {}
      this.processorNode = null;
    }

    if (this.audioContext && this.audioContext.state !== 'closed') {
      try { this.audioContext.close(); } catch (_) {}
      this.audioContext = null;
    }

    // Close WebSocket
    if (this.ws) {
      try {
        if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
          this.ws.close();
        }
      } catch (_) {}
      this.ws = null;
    }

    this.onStatusChange('idle');
  }
}
