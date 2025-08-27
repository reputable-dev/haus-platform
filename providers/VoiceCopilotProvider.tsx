/**
 * Voice Copilot Provider for HAUS Platform
 * Manages voice interactions, AI responses, and property search integration
 */

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { router } from 'expo-router';
import { Alert } from 'react-native';
import { getElevenLabsClient, VoicePersona } from '@/lib/voice/elevenlabs-client';
import { getSpeechRecognitionService, VoiceCommand } from '@/lib/voice/speech-recognition';

type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking' | 'error';

interface VoiceCopilotContextType {
  // UI State
  isOpen: boolean;
  voiceState: VoiceState;
  transcript: string;
  interimTranscript: string;
  response: string;
  isEnabled: boolean;
  isStreaming: boolean;
  
  // Controls
  toggleCopilot: () => void;
  startListening: () => void;
  stopListening: () => void;
  processCopilotCommand: (text: string) => Promise<void>;
  
  // Manual Input
  manualInput: string;
  setManualInput: (text: string) => void;
  
  // Voice Persona
  currentPersona: VoicePersona;
  setPersona: (persona: VoicePersona) => void;
}

const VoiceCopilotContext = createContext<VoiceCopilotContextType | undefined>(undefined);

export function VoiceCopilotProvider({ children }: { children: ReactNode }) {
  // State
  const [isOpen, setIsOpen] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [isEnabled, setIsEnabled] = useState(true);
  const [manualInput, setManualInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentPersona, setCurrentPersona] = useState<VoicePersona>('propertyExpert');

  // Refs
  const elevenLabsClient = useRef(getElevenLabsClient());
  const speechService = useRef(getSpeechRecognitionService());
  const isProcessing = useRef(false);

  // Initialize services
  useEffect(() => {
    initializeServices();
    return () => {
      cleanup();
    };
  }, []);

  const initializeServices = async () => {
    try {
      const voiceAvailable = await elevenLabsClient.current.initialize();
      setIsEnabled(voiceAvailable);
      
      if (!voiceAvailable) {
        console.warn('Voice synthesis not available. Check EXPO_PUBLIC_ELEVENLABS_API_KEY.');
      }
    } catch (error) {
      console.error('Failed to initialize voice services:', error);
      setIsEnabled(false);
    }
  };

  const cleanup = async () => {
    try {
      await elevenLabsClient.current.dispose();
      await speechService.current.dispose();
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  };

  const toggleCopilot = () => {
    setIsOpen(prev => !prev);
    if (!isOpen) {
      // Reset state when opening
      setVoiceState('idle');
      setTranscript('');
      setInterimTranscript('');
      setResponse('');
      setManualInput('');
    } else {
      // Stop any ongoing processes when closing
      stopListening();
    }
  };

  const startListening = async () => {
    if (!isEnabled) {
      Alert.alert(
        'Voice Not Available',
        'Voice recognition is not available. Please use text input or check your permissions.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (isProcessing.current || voiceState === 'listening') {
      return;
    }

    try {
      setVoiceState('listening');
      setTranscript('');
      setInterimTranscript('');
      
      const success = await speechService.current.start(
        handleVoiceCommand,
        handleVoiceError,
        handleStateChange
      );

      if (!success) {
        throw new Error('Failed to start voice recognition');
      }
    } catch (error) {
      console.error('Error starting voice recognition:', error);
      setVoiceState('error');
      Alert.alert('Voice Error', 'Could not start voice recognition. Please try again.');
    }
  };

  const stopListening = async () => {
    try {
      await speechService.current.stop();
    } catch (error) {
      console.error('Error stopping voice recognition:', error);
    }
  };

  const handleVoiceCommand = (command: VoiceCommand) => {
    console.log('Voice command received:', command);
    setTranscript(command.command);
    processCopilotCommand(command.command);
  };

  const handleVoiceError = (error: Error) => {
    console.error('Voice recognition error:', error);
    setVoiceState('error');
    Alert.alert('Voice Error', error.message);
  };

  const handleStateChange = (state: any) => {
    // Map speech service state to voice state
    switch (state) {
      case 'listening':
        setVoiceState('listening');
        break;
      case 'processing':
        setVoiceState('processing');
        break;
      case 'error':
        setVoiceState('error');
        break;
      default:
        setVoiceState('idle');
    }
  };

  const processCopilotCommand = async (text: string) => {
    if (!text.trim() || isProcessing.current) return;

    isProcessing.current = true;
    setVoiceState('processing');
    setResponse('');
    setIsStreaming(true);

    try {
      // Determine appropriate voice persona based on query
      const persona = determinePersonaFromQuery(text);
      setCurrentPersona(persona);

      // Call HAUS AI API for property search and insights
      const apiResponse = await fetch('/api/ai/property-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query: text,
          persona: persona,
          streaming: true
        }),
      });

      if (!apiResponse.ok) {
        throw new Error(`API Error: ${apiResponse.status} ${apiResponse.statusText}`);
      }

      // Process streaming response
      const reader = apiResponse.body?.getReader();
      if (!reader) {
        throw new Error('No response body available');
      }

      const decoder = new TextDecoder();
      let actionData: any = null;
      let fullResponse = '';

      setVoiceState('speaking');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        
        // Check for action commands in response
        try {
          const actionMatch = chunk.match(/\{[\s\S]*"type"[\s\S]*\}/);
          if (actionMatch) {
            actionData = JSON.parse(actionMatch[0]);
            const cleanChunk = chunk.replace(actionMatch[0], '');
            setResponse(prev => prev + cleanChunk);
            fullResponse += cleanChunk;
          } else {
            setResponse(prev => prev + chunk);
            fullResponse += chunk;
          }
        } catch {
          setResponse(prev => prev + chunk);
          fullResponse += chunk;
        }
      }

      // Synthesize and play voice response
      if (isEnabled && fullResponse.trim()) {
        try {
          await elevenLabsClient.current.speak(fullResponse, { persona });
        } catch (voiceError) {
          console.error('Voice synthesis error:', voiceError);
          // Continue without voice output
        }
      }

      // Handle navigation actions
      if (actionData?.type === 'navigate' && actionData.path) {
        setTimeout(() => {
          router.push(actionData.path);
        }, 2000);
      }

      // Handle property search actions
      if (actionData?.type === 'search' && actionData.properties) {
        // Update search results or navigate to search page
        setTimeout(() => {
          router.push('/search');
        }, 1500);
      }

    } catch (error) {
      console.error('Error processing command:', error);
      setVoiceState('error');
      
      const errorMessage = error instanceof Error 
        ? `I encountered an error: ${error.message}` 
        : 'I\'m sorry, I couldn\'t process your request. Please try again.';
      
      setResponse(errorMessage);
      
      Alert.alert('Processing Error', errorMessage);
    } finally {
      setIsStreaming(false);
      isProcessing.current = false;
      
      // Return to idle state after a delay
      setTimeout(() => {
        if (voiceState !== 'listening') {
          setVoiceState('idle');
        }
      }, 3000);
    }
  };

  const determinePersonaFromQuery = (query: string): VoicePersona => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('invest') || lowerQuery.includes('market') || lowerQuery.includes('roi') || lowerQuery.includes('yield')) {
      return 'investmentAdvisor';
    }
    
    if (lowerQuery.includes('neighborhood') || lowerQuery.includes('area') || lowerQuery.includes('suburb') || lowerQuery.includes('local')) {
      return 'neighborhoodSpecialist';
    }
    
    if (lowerQuery.includes('tour') || lowerQuery.includes('view') || lowerQuery.includes('visit') || lowerQuery.includes('show me')) {
      return 'tourGuide';
    }
    
    return 'propertyExpert';
  };

  const value: VoiceCopilotContextType = {
    // UI State
    isOpen,
    voiceState,
    transcript,
    interimTranscript,
    response,
    isEnabled,
    isStreaming,
    
    // Controls
    toggleCopilot,
    startListening,
    stopListening,
    processCopilotCommand,
    
    // Manual Input
    manualInput,
    setManualInput,
    
    // Voice Persona
    currentPersona,
    setPersona: setCurrentPersona,
  };

  return (
    <VoiceCopilotContext.Provider value={value}>
      {children}
    </VoiceCopilotContext.Provider>
  );
}

export function useVoiceCopilot() {
  const context = useContext(VoiceCopilotContext);
  if (context === undefined) {
    throw new Error('useVoiceCopilot must be used within a VoiceCopilotProvider');
  }
  return context;
}