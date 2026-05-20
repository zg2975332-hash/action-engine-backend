import React, { useCallback } from 'react';
import { View, StyleSheet, StatusBar, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { ThemeProvider, DarkTheme } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { BottomNav } from '@/components/BottomNav';
import { Colors } from '@/constants/theme';
import { AnalysisProvider } from '@/context/AnalysisContext';

SplashScreen.preventAutoHideAsync();

if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    html, body, #root {
      background-color: ${Colors.background};
      height: 100%;
      width: 100%;
    }
  `;
  document.head.appendChild(style);
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter: require('../assets/fonts/Inter-Regular.ttf'),
    'Inter-Medium': require('../assets/fonts/Inter-Medium.ttf'),
    'Inter-SemiBold': require('../assets/fonts/Inter-SemiBold.ttf'),
    'Inter-Bold': require('../assets/fonts/Inter-Bold.ttf'),
    SpaceGrotesk: require('../assets/fonts/SpaceGrotesk-Regular.ttf'),
    'SpaceGrotesk-Medium': require('../assets/fonts/SpaceGrotesk-Medium.ttf'),
    'SpaceGrotesk-SemiBold': require('../assets/fonts/SpaceGrotesk-SemiBold.ttf'),
    'SpaceGrotesk-Bold': require('../assets/fonts/SpaceGrotesk-Bold.ttf'),
    JetBrainsMono: require('../assets/fonts/JetBrainsMono-Regular.ttf'),
    'JetBrainsMono-Medium': require('../assets/fonts/JetBrainsMono-Medium.ttf'),
  });

  const onLayoutReady = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <AnalysisProvider>
      <ThemeProvider value={DarkTheme}>
        <SafeAreaProvider>
          <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
          <View style={styles.root} onLayout={onLayoutReady}>
            <AnimatedBackground />
            <SafeAreaView style={styles.safeArea} edges={['top']}>
              <View style={styles.content}>
                <Stack
                  screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: 'transparent' },
                    animation: 'fade',
                  }}
                />
              </View>
            </SafeAreaView>
            <BottomNav />
            <Toast />
          </View>
        </SafeAreaProvider>
      </ThemeProvider>
    </AnalysisProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    maxWidth: 428,
    width: '100%',
    alignSelf: 'center',
    paddingBottom: 112, // space for BottomNav
  },
});
