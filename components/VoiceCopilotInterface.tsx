/**
 * Voice Copilot Interface Modal
 * Full-screen modal for voice interactions with HAUS AI
 */

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  TextInput,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { 
  X, 
  Mic, 
  MicOff, 
  Send, 
  Loader2,
  Volume2,
  VolumeX,
} from 'lucide-react-native';
import { useVoiceCopilot } from '@/providers/VoiceCopilotProvider';
import { useTheme } from '@/providers/ThemeProvider';
import Colors from '@/constants/colors';

const { width, height } = Dimensions.get('window');

export function VoiceCopilotInterface() {
  const {
    isOpen,
    voiceState,
    transcript,
    interimTranscript,
    response,
    toggleCopilot,
    startListening,
    stopListening,
    processCopilotCommand,
    manualInput,
    setManualInput,
    isStreaming,
    currentPersona,
  } = useVoiceCopilot();

  const { theme } = useTheme();
  const colors = Colors[theme];
  
  const inputRef = useRef<TextInput>(null);
  const responseScrollRef = useRef<ScrollView>(null);
  
  // Animation values
  const waveAnimation = useSharedValue(0);
  const pulseAnimation = useSharedValue(1);
  const fadeAnimation = useSharedValue(0);

  // Initialize animations when modal opens
  useEffect(() => {
    if (isOpen) {
      fadeAnimation.value = withTiming(1, { duration: 300 });
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      fadeAnimation.value = withTiming(0, { duration: 200 });
    }
  }, [isOpen]);

  // Voice state animations
  useEffect(() => {
    switch (voiceState) {
      case 'listening':
        waveAnimation.value = withRepeat(
          withTiming(1, { duration: 1000 }),
          -1,
          true
        );
        break;
      case 'processing':
        pulseAnimation.value = withRepeat(
          withTiming(1.2, { duration: 800 }),
          -1,
          true
        );
        break;
      case 'speaking':
        waveAnimation.value = withRepeat(
          withTiming(1, { duration: 600 }),
          -1,
          true
        );
        break;
      default:
        waveAnimation.value = withTiming(0);
        pulseAnimation.value = withTiming(1);
    }
  }, [voiceState]);

  // Auto-scroll response
  useEffect(() => {
    if (response && responseScrollRef.current) {
      responseScrollRef.current.scrollToEnd({ animated: true });
    }
  }, [response]);

  const modalAnimatedStyle = useAnimatedStyle(() => ({
    opacity: fadeAnimation.value,
    transform: [
      { scale: interpolate(fadeAnimation.value, [0, 1], [0.9, 1]) }
    ],
  }));

  const waveAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      waveAnimation.value,
      [0, 0.5, 1],
      [0.3, 1, 0.3]
    );
    return { opacity };
  });

  const handleManualSubmit = () => {
    if (manualInput.trim()) {
      processCopilotCommand(manualInput);
      setManualInput('');
    }
  };

  const getPersonaDisplayName = () => {
    switch (currentPersona) {
      case 'propertyExpert':
        return 'Property Expert';
      case 'neighborhoodSpecialist':
        return 'Neighborhood Specialist';
      case 'investmentAdvisor':
        return 'Investment Advisor';
      case 'tourGuide':
        return 'Tour Guide';
      default:
        return 'HAUS Assistant';
    }
  };

  const getPersonaColor = () => {
    switch (currentPersona) {
      case 'propertyExpert':
        return '#D4C1B3';
      case 'neighborhoodSpecialist':
        return '#4A90E2';
      case 'investmentAdvisor':
        return '#50C878';
      case 'tourGuide':
        return '#FF8C00';
      default:
        return '#D4C1B3';
    }
  };

  const renderVoiceVisualization = () => {
    const personaColor = getPersonaColor();
    
    if (voiceState === 'listening') {
      return (
        <View style={styles.voiceViz}>
          {[...Array(5)].map((_, i) => (
            <Animated.View
              key={i}
              style={[
                styles.voiceBar,
                { backgroundColor: personaColor },
                waveAnimatedStyle,
                {
                  height: 20 + Math.random() * 30,
                  animationDelay: `${i * 100}ms`,
                }
              ]}
            />
          ))}
        </View>
      );
    }

    if (voiceState === 'processing') {
      return (
        <View style={styles.voiceViz}>
          <Animated.View style={[styles.processingSpinner, { transform: [{ scale: pulseAnimation.value }] }]}>
            <Loader2 size={32} color={personaColor} />
          </Animated.View>
        </View>
      );
    }

    if (voiceState === 'speaking') {
      return (
        <View style={styles.voiceViz}>
          <Animated.View style={waveAnimatedStyle}>
            <Volume2 size={32} color={personaColor} />
          </Animated.View>
        </View>
      );
    }

    return (
      <View style={styles.voiceViz}>
        <Text style={[styles.voicePrompt, { color: colors.secondary }]}>
          Ask me anything about Australian properties
        </Text>
      </View>
    );
  };

  const combinedTranscript = transcript + (interimTranscript ? ` ${interimTranscript}` : '');

  return (
    <Modal
      visible={isOpen}
      animationType="none"
      transparent
      statusBarTranslucent
    >
      <BlurView intensity={80} style={styles.backdrop}>
        <Animated.View style={[styles.container, modalAnimatedStyle]}>
          <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.titleContainer}>
                <Text style={[styles.title, { color: colors.text }]}>
                  HAUS COPILOT
                </Text>
                <Text style={[styles.subtitle, { color: getPersonaColor() }]}>
                  {getPersonaDisplayName()}
                </Text>
              </View>
              <Pressable
                style={styles.closeButton}
                onPress={toggleCopilot}
              >
                <X size={24} color={colors.text} />
              </Pressable>
            </View>

            {/* Voice Visualization */}
            <View style={styles.visualizationContainer}>
              {renderVoiceVisualization()}
            </View>

            {/* Transcript Display */}
            {combinedTranscript ? (
              <View style={[styles.transcriptContainer, { backgroundColor: colors.background + '80' }]}>
                <ScrollView style={styles.transcriptScroll} showsVerticalScrollIndicator={false}>
                  <Text style={[styles.transcriptText, { color: colors.text }]}>
                    <Text>{transcript}</Text>
                    {interimTranscript && (
                      <Text style={{ color: getPersonaColor(), opacity: 0.8 }}>
                        {interimTranscript}
                      </Text>
                    )}
                  </Text>
                </ScrollView>
              </View>
            ) : null}

            {/* Response Display */}
            {response ? (
              <View style={[styles.responseContainer, { backgroundColor: getPersonaColor() + '20' }]}>
                <ScrollView 
                  ref={responseScrollRef}
                  style={styles.responseScroll} 
                  showsVerticalScrollIndicator={false}
                >
                  <Text style={[styles.responseText, { color: colors.text }]}>
                    {response}
                    {isStreaming && (
                      <Animated.View style={[styles.cursor, waveAnimatedStyle]}>
                        <Text style={{ color: getPersonaColor() }}>|</Text>
                      </Animated.View>
                    )}
                  </Text>
                </ScrollView>
              </View>
            ) : null}

            {/* Controls */}
            <View style={styles.controls}>
              {/* Voice Button */}
              <Pressable
                style={[
                  styles.voiceButton,
                  { 
                    backgroundColor: voiceState === 'listening' ? getPersonaColor() : colors.background,
                    borderColor: getPersonaColor(),
                  }
                ]}
                onPress={voiceState === 'listening' ? stopListening : startListening}
                disabled={voiceState === 'processing' || isStreaming}
              >
                <LinearGradient
                  colors={
                    voiceState === 'listening' 
                      ? [getPersonaColor(), getPersonaColor() + 'CC']
                      : [colors.background, colors.background]
                  }
                  style={styles.voiceButtonGradient}
                >
                  {voiceState === 'listening' ? (
                    <>
                      <MicOff size={20} color="#FFFFFF" />
                      <Text style={styles.voiceButtonText}>STOP LISTENING</Text>
                    </>
                  ) : (
                    <>
                      <Mic size={20} color={getPersonaColor()} />
                      <Text style={[styles.voiceButtonText, { color: getPersonaColor() }]}>
                        START LISTENING
                      </Text>
                    </>
                  )}
                </LinearGradient>
              </Pressable>

              {/* Text Input */}
              <View style={styles.inputContainer}>
                <TextInput
                  ref={inputRef}
                  style={[
                    styles.textInput,
                    { 
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                      color: colors.text,
                    }
                  ]}
                  placeholder="Type your question..."
                  placeholderTextColor={colors.secondary}
                  value={manualInput}
                  onChangeText={setManualInput}
                  onSubmitEditing={handleManualSubmit}
                  editable={!isStreaming && voiceState !== 'processing'}
                  multiline
                  maxLength={500}
                />
                <Pressable
                  style={[
                    styles.sendButton,
                    { 
                      backgroundColor: manualInput.trim() ? getPersonaColor() : colors.border,
                    }
                  ]}
                  onPress={handleManualSubmit}
                  disabled={!manualInput.trim() || isStreaming || voiceState === 'processing'}
                >
                  <Send 
                    size={20} 
                    color={manualInput.trim() ? '#FFFFFF' : colors.secondary} 
                  />
                </Pressable>
              </View>
            </View>

            {/* Suggestions */}
            <View style={styles.suggestionsContainer}>
              <Text style={[styles.suggestionsLabel, { color: colors.secondary }]}>
                TRY ASKING
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.suggestions}>
                  <SuggestionChip text="Show me luxury properties in Sydney" />
                  <SuggestionChip text="What's the market trend in Melbourne?" />
                  <SuggestionChip text="Find 3-bedroom houses under $800k" />
                  <SuggestionChip text="Schedule a property inspection" />
                </View>
              </ScrollView>
            </View>
          </SafeAreaView>
        </Animated.View>
      </BlurView>
    </Modal>
  );
}

function SuggestionChip({ text }: { text: string }) {
  const { processCopilotCommand, voiceState, isStreaming } = useVoiceCopilot();
  const { theme } = useTheme();
  const colors = Colors[theme];

  return (
    <Pressable
      style={[
        styles.suggestionChip,
        { 
          backgroundColor: colors.background,
          borderColor: colors.border,
        }
      ]}
      onPress={() => processCopilotCommand(text)}
      disabled={voiceState === 'processing' || isStreaming}
    >
      <Text style={[styles.suggestionText, { color: colors.secondary }]}>
        {text}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: width * 0.95,
    maxHeight: height * 0.9,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    overflow: 'hidden',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    opacity: 0.8,
    marginTop: 2,
  },
  closeButton: {
    padding: 8,
  },
  visualizationContainer: {
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  voiceViz: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  voiceBar: {
    width: 3,
    borderRadius: 2,
    backgroundColor: '#D4C1B3',
  },
  processingSpinner: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  voicePrompt: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
  transcriptContainer: {
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 12,
    maxHeight: 120,
  },
  transcriptScroll: {
    padding: 16,
  },
  transcriptText: {
    fontSize: 16,
    lineHeight: 24,
  },
  responseContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    maxHeight: 200,
  },
  responseScroll: {
    padding: 16,
  },
  responseText: {
    fontSize: 16,
    lineHeight: 24,
  },
  cursor: {
    position: 'absolute',
    right: 0,
  },
  controls: {
    paddingHorizontal: 20,
    gap: 16,
  },
  voiceButton: {
    borderRadius: 12,
    borderWidth: 2,
    overflow: 'hidden',
  },
  voiceButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  voiceButtonText: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionsContainer: {
    padding: 20,
  },
  suggestionsLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 12,
  },
  suggestions: {
    flexDirection: 'row',
    gap: 8,
  },
  suggestionChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  suggestionText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default VoiceCopilotInterface;