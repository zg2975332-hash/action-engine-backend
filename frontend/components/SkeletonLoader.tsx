/**
 * Skeleton Loader Component
 * Shimmer effect for loading states
 */
import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/theme';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export function SkeletonLoader({ 
  width = '100%', 
  height = 20, 
  borderRadius = 8,
  style 
}: SkeletonLoaderProps) {
  const translateX = useSharedValue(-1);

  useEffect(() => {
    translateX.value = withRepeat(
      withTiming(1, {
        duration: 1500,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: translateX.value * 200,
        },
      ],
    };
  });

  return (
    <View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          backgroundColor: Colors.card,
        },
        style,
      ]}
    >
      <Animated.View style={[styles.shimmer, animatedStyle]}>
        <LinearGradient
          colors={[
            'transparent',
            Colors.primaryAlpha15,
            'transparent',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        />
      </Animated.View>
    </View>
  );
}

interface SkeletonStepCardProps {
  style?: any;
}

export function SkeletonStepCard({ style }: SkeletonStepCardProps) {
  return (
    <View style={[styles.stepCard, style]}>
      <View style={styles.stepCardContent}>
        {/* Icon skeleton */}
        <SkeletonLoader width={48} height={48} borderRadius={12} />
        
        {/* Text content */}
        <View style={styles.stepCardText}>
          <SkeletonLoader width="70%" height={16} borderRadius={4} />
          <SkeletonLoader width="40%" height={12} borderRadius={4} style={{ marginTop: 8 }} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    overflow: 'hidden',
    backgroundColor: Colors.card,
  },
  shimmer: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    flex: 1,
    width: 200,
  },
  stepCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: Colors.card + '80',
    marginBottom: 12,
  },
  stepCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepCardText: {
    flex: 1,
  },
});
