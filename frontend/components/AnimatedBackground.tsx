import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Colors } from '@/constants/theme';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

export function AnimatedBackground() {
  const gridOffset = useSharedValue(0);

  useEffect(() => {
    gridOffset.value = withRepeat(
      withTiming(48, { duration: 12000, easing: Easing.linear }),
      -1,
      false,
    );
  }, []);

  const gridStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: gridOffset.value },
      { translateY: gridOffset.value },
    ],
  }));

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Grid pattern */}
      <Animated.View style={[styles.gridLayer, gridStyle]}>
        {/* We simulate a grid with repeating thin views */}
        {Array.from({ length: 20 }).map((_, i) => (
          <View
            key={`h-${i}`}
            style={[styles.gridLineH, { top: i * 48 }]}
          />
        ))}
        {Array.from({ length: 12 }).map((_, i) => (
          <View
            key={`v-${i}`}
            style={[styles.gridLineV, { left: i * 48 }]}
          />
        ))}
      </Animated.View>

      {/* Radial glows – simulated with LinearGradient circles */}
      <View style={[styles.glow, styles.glowCyan]}>
        <LinearGradient
          colors={['rgba(0,240,255,0.6)', 'transparent']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 1 }}
        />
      </View>

      <View style={[styles.glow, styles.glowPurple]}>
        <LinearGradient
          colors={['rgba(184,71,255,0.6)', 'transparent']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 1 }}
        />
      </View>

      <View style={[styles.glow, styles.glowGreen]}>
        <LinearGradient
          colors={['rgba(0,255,136,0.5)', 'transparent']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 1 }}
        />
      </View>

      {/* Vignette */}
      <LinearGradient
        colors={['transparent', 'rgba(8,6,18,0.7)']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0.5 }}
        end={{ x: 0.5, y: 1 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
    overflow: 'hidden',
  },
  gridLayer: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.6,
  },
  gridLineH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(0,240,255,0.06)',
  },
  gridLineV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(0,240,255,0.06)',
  },
  glow: {
    position: 'absolute',
    borderRadius: 9999,
    overflow: 'hidden',
  },
  glowCyan: {
    top: -160,
    left: -128,
    width: 420,
    height: 420,
    opacity: 0.4,
  },
  glowPurple: {
    top: SCREEN_H * 0.33,
    right: -160,
    width: 460,
    height: 460,
    opacity: 0.3,
  },
  glowGreen: {
    bottom: 0,
    left: SCREEN_W * 0.25,
    width: 300,
    height: 300,
    opacity: 0.25,
  },
});
