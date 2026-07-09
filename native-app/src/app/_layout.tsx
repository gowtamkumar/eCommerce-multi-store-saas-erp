import '@/global.css';

import { ThemeProvider } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';
import { PortalHost } from '@rn-primitives/portal';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { NAV_THEME } from '@/lib/theme';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const colorScheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  return (
    <ThemeProvider value={NAV_THEME[colorScheme]}>
      <AnimatedSplashOverlay />
      <AppTabs />
      <PortalHost />
    </ThemeProvider>
  );
}
