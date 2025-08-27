/**
 * Voice Copilot Floating Button Component
 * Floating action button for triggering voice interactions in HAUS Platform
 */

import React from 'react';
import { 
  Pressable, 
  View, 
  Text,
  StyleSheet,
} from 'react-native';
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
import { Mic, MessageCircle } from 'lucide-react-native';
import { useVoiceCopilot } from '@/providers/VoiceCopilotProvider';
import { useTheme } from '@/providers/ThemeProvider';
import Colors from '@/constants/colors';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function VoiceCopilotButton() {
  const { toggleCopilot, voiceState, isEnabled } = useVoiceCopilot();
  const { theme } = useTheme();
  const colors = Colors[theme];

  // Animation values
  const scale = useSharedValue(1);
  const pulseScale = useSharedValue(1);
  const rotation = useSharedValue(0);

  // Handle different voice states with animations
  React.useEffect(() => {
    switch (voiceState) {
      case 'listening':
        pulseScale.value = withRepeat(
          withTiming(1.2, { duration: 800 }),
          -1,
          true
        );
        break;
      case 'processing':
        rotation.value = withRepeat(
          withTiming(360, { duration: 2000 }),
          -1,
          false
        );
        break;
      case 'speaking':
        pulseScale.value = withRepeat(
          withTiming(1.1, { duration: 600 }),
          -1,
          true
        );
        break;
      default:
        pulseScale.value = withTiming(1);
        rotation.value = withTiming(0);
    }
  }, [voiceState]);

  const animatedButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value * pulseScale.value },
        { 
          rotate: `${interpolate(
            rotation.value,
            [0, 360],
            [0, 360]
          )}deg` 
        }
      ],
    };
  });

  const animatedGlowStyle = useAnimatedStyle(() => {
    const opacity = voiceState === 'listening' ? 0.6 : 0.2;
    return {
      opacity: withTiming(opacity, { duration: 300 }),
      transform: [
        { scale: pulseScale.value * 1.5 }
      ],
    };
  });

  const handlePress = () => {
    if (!isEnabled) return;
    
    scale.value = withSpring(0.95, { duration: 100 }, () => {
      scale.value = withSpring(1);
    });
    
    toggleCopilot();
  };

  const getButtonColor = (): readonly [string, string] => {
    switch (voiceState) {
      case 'listening':
        return ['#D4C1B3', '#C4A484'] as const; // HAUS gold
      case 'processing':
        return ['#4A90E2', '#357ABD'] as const; // Blue
      case 'speaking':
        return ['#50C878', '#4CBB17'] as const; // Green
      case 'error':
        return ['#FF6B6B', '#FF5252'] as const; // Red
      default:
        return (theme === 'dark' 
          ? ['#2A2A2A', '#1A1A1A'] 
          : ['#FFFFFF', '#F5F5F5']) as const;
    }
  };

  const getIconColor = () => {
    switch (voiceState) {
      case 'listening':
      case 'processing':
      case 'speaking':
        return '#FFFFFF';
      case 'error':
        return '#FFFFFF';
      default:
        return colors.text;
    }
  };

  const getIcon = () => {
    switch (voiceState) {
      case 'listening':
      case 'processing':
      case 'speaking':
        return Mic;
      default:
        return MessageCircle;
    }
  };

  if (!isEnabled) {
    return null; // Don't show button if voice is not available
  }

  const IconComponent = getIcon();

  return (
    <View style={[styles.container, { bottom: 100 }]}>
      {/* Glow effect */}
      <Animated.View style={[styles.glow, animatedGlowStyle]}>
        <BlurView intensity={20} style={styles.blur}>
          <LinearGradient
            colors={getButtonColor()}
            style={styles.glowGradient}
          />
        </BlurView>
      </Animated.View>

      {/* Main button */}
      <AnimatedPressable
        style={[styles.button, animatedButtonStyle]}
        onPress={handlePress}
        disabled={!isEnabled}
      >
        <LinearGradient
          colors={getButtonColor()}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.iconContainer}>
            <IconComponent 
              size={28} 
              color={getIconColor()}
              strokeWidth={2}
            />
          </View>
        </LinearGradient>

        {/* Status indicator */}
        {voiceState !== 'idle' && (
          <View style={[
            styles.statusIndicator,
            { backgroundColor: getButtonColor()[0] }
          ]}>
            <Text style={styles.statusText}>
              {voiceState.toUpperCase()}
            </Text>
          </View>
        )}
      </AnimatedPressable>

      {/* Ripple effect for listening state */}
      {voiceState === 'listening' && (
        <Animated.View style={[styles.ripple, animatedGlowStyle]}>
          <View style={[styles.rippleRing, { borderColor: getButtonColor()[0] }]} />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  button: {
    width: 64,
    height: 64,
    borderRadius: 32,
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  gradient: {
    flex: 1,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  glow: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  blur: {
    flex: 1,
    borderRadius: 48,
    overflow: 'hidden',
  },
  glowGradient: {
    flex: 1,
    borderRadius: 48,
  },
  statusIndicator: {
    position: 'absolute',
    top: -8,
    left: -8,
    right: -8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 8,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  ripple: {
    position: 'absolute',
    width: 128,
    height: 128,
    borderRadius: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rippleRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    opacity: 0.3,
  },
});

export default VoiceCopilotButton;