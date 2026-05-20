import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '@/constants/theme';

interface GlassViewProps {
  strong?: boolean;
  style?: ViewStyle | ViewStyle[];
  children?: React.ReactNode;
}

/**
 * Reusable glass-morphism container.
 * Matches .glass and .glass-strong from the web CSS.
 * React Native does not support backdrop-filter, so we simulate
 * the frosted-glass effect with a semi-transparent background.
 */
export function GlassView({ strong, style, children }: GlassViewProps) {
  return (
    <View style={[strong ? styles.strong : styles.glass, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  glass: {
    backgroundColor: Colors.whiteAlpha4,
    borderWidth: 1,
    borderColor: Colors.whiteAlpha8,
  },
  strong: {
    backgroundColor: 'rgba(17,20,31,0.7)',
    borderWidth: 1,
    borderColor: Colors.whiteAlpha10,
  },
});
