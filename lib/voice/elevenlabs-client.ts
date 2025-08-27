/**
 * ElevenLabs Voice Client for HAUS Platform (React Native)
 * Provides high-quality voice synthesis for property search and AI interactions
 */

import { Audio } from 'expo-audio';

// Environment validation
const ELEVENLABS_API_KEY = process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY;

// Voice configurations for different HAUS agent personas
export const VOICE_CONFIGS = {
  // Property Expert - Professional, knowledgeable
  propertyExpert: {
    voiceId: 'EXAVITQu4vr4xnSDxMaL', // Bella
    settings: {
      stability: 0.75,
      similarityBoost: 0.8,
      style: 0.2,
      useSpeakerBoost: true
    },
    languages: ['en-AU', 'en-US', 'en-GB']
  },
  
  // Neighborhood Specialist - Friendly, local expert
  neighborhoodSpecialist: {
    voiceId: '21m00Tcm4TlvDq8ikWAM', // Rachel
    settings: {
      stability: 0.7,
      similarityBoost: 0.75,
      style: 0.4,
      useSpeakerBoost: true
    },
    languages: ['en-AU', 'en-US', 'en-GB']
  },
  
  // Investment Advisor - Authoritative, analytical
  investmentAdvisor: {
    voiceId: '29vD33N1CtxCmqQRPOHJ', // Drew
    settings: {
      stability: 0.8,
      similarityBoost: 0.85,
      style: 0.1,
      useSpeakerBoost: true
    },
    languages: ['en-AU', 'en-US', 'en-GB']
  },
  
  // Tour Guide - Enthusiastic, descriptive
  tourGuide: {
    voiceId: 'pNInz6obpgDQGcFmaJgB', // Adam
    settings: {
      stability: 0.65,
      similarityBoost: 0.7,
      style: 0.6,
      useSpeakerBoost: true
    },
    languages: ['en-AU', 'en-US', 'en-GB']
  },
  
  // Default voice for general interactions
  default: {
    voiceId: 'EXAVITQu4vr4xnSDxMaL', // Bella
    settings: {
      stability: 0.7,
      similarityBoost: 0.75,
      style: 0.3,
      useSpeakerBoost: true
    },
    languages: ['en-AU', 'en-US', 'en-GB']
  }
} as const;

export type VoicePersona = keyof typeof VOICE_CONFIGS;

export interface VoiceSynthesisOptions {
  persona?: VoicePersona;
  language?: string;
  speed?: number;
  customVoiceId?: string;
}

export class ElevenLabsClient {
  private isInitialized = false;
  private currentPlayer: Audio.Player | null = null;

  constructor() {
    this.initialize();
  }

  /**
   * Initialize audio permissions and setup
   */
  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;
    
    try {
      // Request audio permissions for expo-audio
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        console.warn('Audio permissions not granted');
        return false;
      }
      
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize ElevenLabs client:', error);
      return false;
    }
  }

  /**
   * Check if voice synthesis is available
   */
  isAvailable(): boolean {
    return !!ELEVENLABS_API_KEY;
  }

  /**
   * Synthesize speech with high-quality settings
   */
  async synthesize(
    text: string,
    options: VoiceSynthesisOptions = {}
  ): Promise<string> {
    if (!ELEVENLABS_API_KEY) {
      throw new Error('ElevenLabs API key not found. Please add EXPO_PUBLIC_ELEVENLABS_API_KEY to your environment.');
    }

    const {
      persona = 'default',
      language = 'en-AU',
      customVoiceId
    } = options;

    const voiceConfig = VOICE_CONFIGS[persona];
    const voiceId = customVoiceId || voiceConfig.voiceId;

    try {
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_turbo_v2_5',
          voice_settings: voiceConfig.settings,
        }),
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status}`);
      }

      // Convert response to base64 for React Native Audio
      const audioBlob = await response.blob();
      const reader = new FileReader();
      
      return new Promise((resolve, reject) => {
        reader.onloadend = () => {
          const base64data = reader.result as string;
          resolve(base64data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(audioBlob);
      });
    } catch (error) {
      console.error('Voice synthesis failed:', error);
      throw error;
    }
  }

  /**
   * Play audio from base64 data
   */
  async playAudio(audioData: string): Promise<void> {
    try {
      // Stop any currently playing audio
      if (this.currentPlayer) {
        await this.currentPlayer.stop();
        this.currentPlayer = null;
      }

      // Create new player with audio data
      this.currentPlayer = Audio.createPlayer(audioData);
      
      // Play the audio
      await this.currentPlayer.play();
      
      // Clean up when finished
      this.currentPlayer.onPlaybackStatusChange((status) => {
        if (status.isLoaded && status.didJustFinish) {
          this.currentPlayer = null;
        }
      });
    } catch (error) {
      console.error('Audio playback failed:', error);
      throw error;
    }
  }

  /**
   * Convert text to speech and play immediately
   */
  async speak(text: string, options: VoiceSynthesisOptions = {}): Promise<void> {
    try {
      const audioData = await this.synthesize(text, options);
      await this.playAudio(audioData);
    } catch (error) {
      console.error('Speech failed:', error);
      
      // Fallback to system TTS if available
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-AU';
        speechSynthesis.speak(utterance);
      } else {
        throw error;
      }
    }
  }

  /**
   * Stop any currently playing audio
   */
  async stop(): Promise<void> {
    if (this.currentPlayer) {
      await this.currentPlayer.stop();
      this.currentPlayer = null;
    }
  }

  /**
   * Get voice synthesis latency estimate
   */
  async getLatencyEstimate(text: string): Promise<number> {
    const start = Date.now();
    
    try {
      // Use a small test synthesis to estimate latency
      await this.synthesize(text.substring(0, 50));
      return Date.now() - start;
    } catch (error) {
      return -1; // Unable to estimate
    }
  }

  /**
   * Cleanup resources
   */
  async dispose(): Promise<void> {
    if (this.currentPlayer) {
      await this.currentPlayer.stop();
      this.currentPlayer = null;
    }
    this.isInitialized = false;
  }
}

// Singleton instance
let elevenLabsClient: ElevenLabsClient | null = null;

export function getElevenLabsClient(): ElevenLabsClient {
  if (!elevenLabsClient) {
    elevenLabsClient = new ElevenLabsClient();
  }
  return elevenLabsClient;
}

// Utility function to detect Australian context
export function getAustralianVoicePersona(context: string): VoicePersona {
  const lowerContext = context.toLowerCase();
  
  if (lowerContext.includes('investment') || lowerContext.includes('market')) {
    return 'investmentAdvisor';
  }
  
  if (lowerContext.includes('neighborhood') || lowerContext.includes('area') || lowerContext.includes('suburb')) {
    return 'neighborhoodSpecialist';
  }
  
  if (lowerContext.includes('tour') || lowerContext.includes('view') || lowerContext.includes('visit')) {
    return 'tourGuide';
  }
  
  return 'propertyExpert';
}