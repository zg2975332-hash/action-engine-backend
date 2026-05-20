import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface NeonBorderViewProps {
  style?: ViewStyle;
  borderRadius?: number;
  children?: React.ReactNode;
}

/**
 * Simulates .neon-border::before pseudo-element.
 * Renders a gradient border around children.
 */
export function NeonBorderView({ style, borderRadius = 16, children }: NeonBorderViewProps) {
  return (
    <View style={[styles.wrapper, { borderRadius }, style]}>
      <LinearGradient
        colors={['#00F0FF', '#B847FF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[StyleSheet.absoluteFill, { borderRadius, opacity: 0.6 }]}
      />
      <View style={[styles.inner, { borderRadius: borderRadius - 1 }]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    padding: 1,
    overflow: 'hidden',
  },
  inner: {
    overflow: 'hidden',
  },
});
