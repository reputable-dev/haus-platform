/**
 * Speech Recognition Service for HAUS Platform (React Native)
 * Handles voice input with Australian English optimization
 */

import { Audio } from 'expo-audio';
import * as FileSystem from 'expo-file-system';

// Voice command schemas
export interface VoiceCommand {
  command: string;
  confidence: number;
  timestamp: string;
  type: 'search' | 'filter' | 'navigate' | 'action';
}

// Property search patterns optimized for Australian real estate
export const PROPERTY_COMMANDS = {
  search: [
    { pattern: /show me (.*) properties/i, type: 'search' },
    { pattern: /find (.*) for sale/i, type: 'search' },
    { pattern: /search for (.*)/i, type: 'search' },
    { pattern: /I'm looking for (.*)/i, type: 'search' },
    { pattern: /properties in (.*)/i, type: 'search' },
    { pattern: /houses in (.*)/i, type: 'search' },
    { pattern: /apartments in (.*)/i, type: 'search' },
  ],
  filter: [
    { pattern: /under (\d+)/i, type: 'price_max' },
    { pattern: /over (\d+)/i, type: 'price_min' },
    { pattern: /(\d+) bedroom/i, type: 'bedrooms' },
    { pattern: /(\d+) bathroom/i, type: 'bathrooms' },
    { pattern: /with (pool|garden|garage)/i, type: 'features' },
    { pattern: /close to (.*)/i, type: 'location' },
  ],
  navigate: [
    { pattern: /go to (.*)/, type: 'navigate' },
    { pattern: /show details/, type: 'details' },
    { pattern: /back to search/, type: 'back' },
    { pattern: /next property/, type: 'next' },
    { pattern: /previous property/, type: 'previous' },
    { pattern: /show map/, type: 'map' },
    { pattern: /virtual tour/, type: 'tour' },
  ],
  action: [
    { pattern: /save this/, type: 'save' },
    { pattern: /contact agent/, type: 'contact' },
    { pattern: /schedule inspection/, type: 'schedule' },
    { pattern: /book viewing/, type: 'schedule' },
    { pattern: /get directions/, type: 'directions' },
    { pattern: /share this/, type: 'share' },
    { pattern: /compare properties/, type: 'compare' },
  ],
};

export type RecognitionState = 'idle' | 'listening' | 'processing' | 'error';

export interface SpeechRecognitionOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
}

export class SpeechRecognitionService {
  private recorder: Audio.Recorder | null = null;
  private isListening = false;
  private state: RecognitionState = 'idle';
  private onResultCallback?: (command: VoiceCommand) => void;
  private onErrorCallback?: (error: Error) => void;
  private onStateChangeCallback?: (state: RecognitionState) => void;

  constructor() {
    this.initialize();
  }

  /**
   * Initialize audio recording permissions
   */
  private async initialize(): Promise<void> {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Audio recording permission not granted');
      }
    } catch (error) {
      console.error('Failed to initialize speech recognition:', error);
    }
  }

  /**
   * Parse voice command using pattern matching
   */
  private parseCommand(transcript: string, confidence: number = 0.8): VoiceCommand | null {
    const normalizedTranscript = transcript.trim().toLowerCase();

    // Check search commands
    for (const { pattern, type } of PROPERTY_COMMANDS.search) {
      const match = normalizedTranscript.match(pattern);
      if (match) {
        return {
          command: match[1] || transcript,
          confidence,
          timestamp: new Date().toISOString(),
          type: 'search',
        };
      }
    }

    // Check filter commands
    for (const { pattern, type } of PROPERTY_COMMANDS.filter) {
      const match = normalizedTranscript.match(pattern);
      if (match) {
        return {
          command: transcript,
          confidence,
          timestamp: new Date().toISOString(),
          type: 'filter',
        };
      }
    }

    // Check navigation commands
    for (const { pattern, type } of PROPERTY_COMMANDS.navigate) {
      if (pattern.test(normalizedTranscript)) {
        return {
          command: transcript,
          confidence,
          timestamp: new Date().toISOString(),
          type: 'navigate',
        };
      }
    }

    // Check action commands
    for (const { pattern, type } of PROPERTY_COMMANDS.action) {
      if (pattern.test(normalizedTranscript)) {
        return {
          command: transcript,
          confidence,
          timestamp: new Date().toISOString(),
          type: 'action',
        };
      }
    }

    // Default to search if no pattern matches but has content
    if (transcript.trim().length > 3) {
      return {
        command: transcript,
        confidence,
        timestamp: new Date().toISOString(),
        type: 'search',
      };
    }

    return null;
  }

  /**
   * Start listening for voice commands
   */
  async start(
    onResult: (command: VoiceCommand) => void,
    onError?: (error: Error) => void,
    onStateChange?: (state: RecognitionState) => void
  ): Promise<boolean> {
    try {
      // Request permissions
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        const error = new Error('Microphone permission not granted');
        if (onError) onError(error);
        return false;
      }

      // Create recorder
      this.recorder = Audio.createRecorder();

      // Set callbacks
      this.onResultCallback = onResult;
      this.onErrorCallback = onError;
      this.onStateChangeCallback = onStateChange;

      // Start recording
      await this.recorder.start();
      this.isListening = true;
      this.setState('listening');

      return true;
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      if (onError) onError(error as Error);
      this.setState('error');
      return false;
    }
  }

  /**
   * Stop listening and process audio
   */
  async stop(): Promise<void> {
    if (!this.recorder || !this.isListening) return;

    try {
      this.setState('processing');
      
      const audioUri = await this.recorder.stop();
      
      if (audioUri) {
        // In a real implementation, you would send the audio to a speech-to-text service
        // For now, we'll simulate processing
        setTimeout(() => {
          // Simulate a voice command result
          const simulatedCommand: VoiceCommand = {
            command: "Show me properties in Sydney",
            confidence: 0.9,
            timestamp: new Date().toISOString(),
            type: 'search'
          };
          
          if (this.onResultCallback) {
            this.onResultCallback(simulatedCommand);
          }
          
          this.setState('idle');
        }, 1000);
      }

      this.recorder = null;
      this.isListening = false;
    } catch (error) {
      console.error('Failed to stop speech recognition:', error);
      if (this.onErrorCallback) {
        this.onErrorCallback(error as Error);
      }
      this.setState('error');
    }
  }

  /**
   * Process audio with external speech-to-text service
   */
  private async processAudioWithSTT(audioUri: string): Promise<string> {
    try {
      // This would integrate with services like:
      // - Google Speech-to-Text API
      // - Azure Cognitive Services Speech
      // - AWS Transcribe
      // - OpenAI Whisper API
      
      // For demonstration, we'll use a mock implementation
      // In production, you would send the audio file to your chosen STT service
      
      const audioData = await FileSystem.readAsStringAsync(audioUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Mock STT response - replace with actual service call
      return "Show me properties in Melbourne under 800000";
    } catch (error) {
      console.error('Speech-to-text processing failed:', error);
      throw error;
    }
  }

  /**
   * Set recognition state
   */
  private setState(newState: RecognitionState): void {
    this.state = newState;
    if (this.onStateChangeCallback) {
      this.onStateChangeCallback(newState);
    }
  }

  /**
   * Get current recognition state
   */
  getState(): RecognitionState {
    return this.state;
  }

  /**
   * Check if currently listening
   */
  getIsListening(): boolean {
    return this.isListening;
  }

  /**
   * Process natural language property query
   */
  async processNaturalLanguageQuery(query: string): Promise<{
    searchQuery: string;
    filters: Record<string, any>;
  }> {
    const normalized = query.toLowerCase();
    const filters: Record<string, any> = {};

    // Extract Australian-specific location patterns
    const australianCities = ['sydney', 'melbourne', 'brisbane', 'perth', 'adelaide', 'darwin', 'canberra', 'hobart'];
    const foundCity = australianCities.find(city => normalized.includes(city));
    if (foundCity) {
      filters.city = foundCity;
    }

    // Extract price information (Australian dollars)
    const priceMatch = normalized.match(/under \$?([\d,]+)(?:k|,000)?/);
    if (priceMatch) {
      let price = parseInt(priceMatch[1].replace(/,/g, ''));
      if (normalized.includes('k') || price < 10000) {
        price *= 1000; // Handle "500k" format
      }
      filters.priceMax = price;
    }

    const minPriceMatch = normalized.match(/over \$?([\d,]+)(?:k|,000)?/);
    if (minPriceMatch) {
      let price = parseInt(minPriceMatch[1].replace(/,/g, ''));
      if (normalized.includes('k') || price < 10000) {
        price *= 1000; // Handle "500k" format
      }
      filters.priceMin = price;
    }

    // Extract bedroom/bathroom counts
    const bedroomMatch = normalized.match(/(\d+)\s*(?:bed|bedroom)/);
    if (bedroomMatch) {
      filters.bedrooms = parseInt(bedroomMatch[1]);
    }

    const bathroomMatch = normalized.match(/(\d+)\s*(?:bath|bathroom)/);
    if (bathroomMatch) {
      filters.bathrooms = parseInt(bathroomMatch[1]);
    }

    // Extract Australian property types
    const propertyTypes = ['house', 'apartment', 'unit', 'townhouse', 'villa', 'duplex', 'terrace'];
    const foundTypes = propertyTypes.filter(type => normalized.includes(type));
    if (foundTypes.length > 0) {
      filters.propertyType = foundTypes;
    }

    // Extract Australian-specific features
    const features = [];
    if (normalized.includes('pool') || normalized.includes('swimming')) features.push('pool');
    if (normalized.includes('garden') || normalized.includes('yard')) features.push('garden');
    if (normalized.includes('garage') || normalized.includes('parking')) features.push('parking');
    if (normalized.includes('balcony') || normalized.includes('terrace')) features.push('balcony');
    if (normalized.includes('air con') || normalized.includes('ducted')) features.push('airConditioning');
    if (features.length > 0) {
      filters.features = features;
    }

    // Clean query for search
    let searchQuery = query;
    
    // Remove filter-related parts from search query
    searchQuery = searchQuery.replace(/under \$?[\d,k]+/gi, '');
    searchQuery = searchQuery.replace(/over \$?[\d,k]+/gi, '');
    searchQuery = searchQuery.replace(/\d+\s*(?:bed|bedroom|bath|bathroom)/gi, '');
    searchQuery = searchQuery.replace(/with (pool|garden|garage|parking|balcony)/gi, '');
    
    return {
      searchQuery: searchQuery.trim(),
      filters,
    };
  }

  /**
   * Cleanup resources
   */
  async dispose(): Promise<void> {
    if (this.recorder && this.isListening) {
      await this.stop();
    }
    this.recorder = null;
    this.isListening = false;
    this.state = 'idle';
  }
}

// Singleton instance
let speechRecognitionService: SpeechRecognitionService | null = null;

export function getSpeechRecognitionService(): SpeechRecognitionService {
  if (!speechRecognitionService) {
    speechRecognitionService = new SpeechRecognitionService();
  }
  return speechRecognitionService;
}