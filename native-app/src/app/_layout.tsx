import '@/global.css';

import { ThemeProvider } from 'expo-router/react-navigation';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';
import { PortalHost } from '@rn-primitives/portal';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { NAV_THEME } from '@/lib/theme';

SplashScreen.preventAutoHideAsync();

import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';

function RootLayoutContent() {
  const segments = useSegments();
  const router = useRouter();

  const storeId = useAuthStore((state) => state.storeId);
  const token = useAuthStore((state) => state.token);
  const activeBranchId = useAuthStore((state) => state.activeBranchId);
  const user = useAuthStore((state) => state.user);

  const [isNavigationReady, setIsNavigationReady] = useState(false);

  useEffect(() => {
    // Wait for the router structure to mount before navigating
    const timer = setTimeout(() => {
      setIsNavigationReady(true);
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isNavigationReady) return;

    const inAuthGroup = segments[0] === 'auth';
    const inOnboardingGroup = segments[0] === 'onboarding';

    if (!storeId) {
      // 1. If tenant is not set, force user to Onboarding Tenant Lookup
      if (!inOnboardingGroup) {
        router.replace('/onboarding/tenant');
      }
    } else if (!token) {
      // 2. If tenant is resolved but no auth token is active, force Login
      if (!inAuthGroup || segments[1] !== 'login') {
        router.replace('/auth/login');
      }
    } else {
      // 3. User is authenticated. Enforce active branch/warehouse scope selection
      const isSuperAdmin = user?.role === 'SUPER_ADMIN' || user?.isAdmin;
      if (!isSuperAdmin && !activeBranchId) {
        if (!inAuthGroup || segments[1] !== 'scope-select') {
          router.replace('/auth/scope-select');
        }
      } else {
        // 4. Authenticated & scoped -> Redirect away from auth/onboarding back to home
        if (inOnboardingGroup || inAuthGroup) {
          router.replace('/');
        }
      }
    }
  }, [storeId, token, activeBranchId, segments, user, isNavigationReady]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="onboarding/tenant" />
      <Stack.Screen name="auth/login" />
      <Stack.Screen name="auth/scope-select" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  return (
    <ThemeProvider value={NAV_THEME[colorScheme]}>
      <AnimatedSplashOverlay />
      <RootLayoutContent />
      <PortalHost />
    </ThemeProvider>
  );
}
