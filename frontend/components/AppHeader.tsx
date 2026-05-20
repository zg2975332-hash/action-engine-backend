import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { Colors, Shadows, FontFamily, FontSize } from '@/constants/theme';

interface AppHeaderProps {
  subtitle?: string;
}

export function AppHeader({ subtitle }: AppHeaderProps) {
  const pingScale = useSharedValue(1);
  const pingOpacity = useSharedValue(0.75);

  useEffect(() => {
    pingScale.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 0 }),
        withTiming(2, { duration: 1000, easing: Easing.out(Easing.ease) }),
      ),
      -1,
    );
    pingOpacity.value = withRepeat(
      withSequence(
        withTiming(0.75, { duration: 0 }),
        withTiming(0, { duration: 1000, easing: Easing.out(Easing.ease) }),
      ),
      -1,
    );
  }, []);

  const pingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pingScale.value }],
    opacity: pingOpacity.value,
  }));

  return (
    <View style={styles.header}>
      <View style={styles.left}>
        {/* Logo icon */}
        <View style={styles.logoWrap}>
          <LinearGradient
            colors={['#00F0FF', '#B847FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoGradient}
          >
            <Feather name="zap" size={18} color={Colors.primaryForeground} />
          </LinearGradient>
          {/* Blur glow behind */}
          <View style={styles.logoGlow} />
        </View>
        <View>
          <Text style={styles.logoText}>AetherFlow</Text>
          <Text style={styles.subtitleText}>
            {subtitle ?? 'Insights → Impact'}
          </Text>
        </View>
      </View>

      {/* Status badge */}
      <View style={styles.badge}>
        <View style={styles.dotWrap}>
          <Animated.View style={[styles.dotPing, pingStyle]} />
          <View style={styles.dot} />
        </View>
        <Text style={styles.badgeText}>AGENT ONLINE</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 12,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoWrap: {
    position: 'relative',
  },
  logoGradient: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.glowPrimary,
  },
  logoGlow: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 12,
    backgroundColor: Colors.primaryAlpha30,
    zIndex: -1,
  },
  logoText: {
    fontFamily: FontFamily.display,
    fontSize: FontSize['15'],
    fontWeight: '700',
    color: Colors.foreground,
    letterSpacing: -0.3,
  },
  subtitleText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize['10'],
    fontWeight: '500',
    color: Colors.mutedForeground,
    textTransform: 'uppercase',
    letterSpacing: 2.9,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.whiteAlpha4,
    borderWidth: 1,
    borderColor: Colors.whiteAlpha8,
    borderRadius: 9999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  dotWrap: {
    width: 6,
    height: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotPing: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.success,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.success,
  },
  badgeText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize['10'],
    fontWeight: '500',
    color: Colors.mutedForeground,
  },
});
