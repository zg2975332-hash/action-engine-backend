import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { Colors, Shadows, FontFamily, FontSize } from '@/constants/theme';

const items = [
  { href: '/', label: 'Hub', icon: 'home' as const },
  { href: '/process', label: 'Process', icon: 'cpu' as const },
  { href: '/results', label: 'Results', icon: 'bar-chart-2' as const },
  { href: '/simulation', label: 'Simulate', icon: 'star' as const },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {items.map(({ href, label, icon }) => {
          const active = pathname === href;
          return (
            <TouchableOpacity
              key={href}
              onPress={() => router.push(href as any)}
              activeOpacity={0.7}
              style={styles.item}
            >
              {active && (
                <>
                  <LinearGradient
                    colors={['#00F0FF', '#B847FF']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.activeBg}
                  />
                  <View style={styles.activeBar} />
                </>
              )}
              <Feather
                name={icon}
                size={20}
                color={active ? Colors.primary : Colors.mutedForeground}
                style={{ zIndex: 1 }}
              />
              <Text
                style={[
                  styles.label,
                  { color: active ? Colors.primary : Colors.mutedForeground },
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 8,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(17,20,31,0.7)',
    borderWidth: 1,
    borderColor: Colors.whiteAlpha10,
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 8,
    ...Shadows.navBar,
  },
  item: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    minHeight: 48,
    minWidth: 56,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  activeBg: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 12,
    opacity: 0.2,
  },
  activeBar: {
    position: 'absolute',
    top: -4,
    width: 32,
    height: 4,
    borderRadius: 9999,
    backgroundColor: Colors.primary,
    ...Shadows.glowPrimary,
  },
  label: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize['10'],
    fontWeight: '500',
    letterSpacing: 0.4,
    zIndex: 1,
  },
});
