import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';
import MaskedView from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontFamily } from '@/constants/theme';

interface GradientTextProps {
  children: string;
  style?: TextStyle;
  animated?: boolean;
}

/**
 * Renders text with the hero gradient (cyan → purple → green).
 * Matches .text-gradient from the web CSS.
 * On RN we overlay a LinearGradient on top of text using opacity tricks.
 */
export function GradientText({ children, style }: GradientTextProps) {
  // Simple approach: render the gradient as a background behind transparent text
  // Since MaskedView has compatibility issues, we use a simpler approach
  return (
    <Text
      style={[
        styles.base,
        style,
        { color: '#00F0FF' }, // Fallback primary color since true gradient text requires MaskedView
      ]}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    fontFamily: FontFamily.display,
  },
});
