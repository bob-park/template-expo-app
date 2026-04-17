import { useContext } from 'react';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import '@/app/global.css';
import AnimateAppLoader from '@/shared/loaders/app/AnimateAppLoader';
import AuthProvider, { AuthContext } from '@/shared/providers/auth/AuthProvider';
import NotificationProvider from '@/shared/providers/notification/NotificationProvider';
import RQProvider from '@/shared/providers/queries/RQProvider';
import ThemeProvider from '@/shared/providers/theme/ThemeProvider';

import { useColorScheme } from 'nativewind';

import './global.css';

export { ErrorBoundary } from 'expo-router';

const RootStackLayout = () => {
  // context
  const { isLoggedIn } = useContext(AuthContext);

  // hooks
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: isDark ? '#000000' : '#ffffff' } }}>
      <Stack.Protected guard={isLoggedIn}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>
      <Stack.Protected guard={!isLoggedIn}>
        <Stack.Screen name="login" />
        <Stack.Screen name="callback" />
      </Stack.Protected>
    </Stack>
  );
};

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RQProvider>
        <AuthProvider>
          <NotificationProvider>
            <AnimateAppLoader>
              <StatusBar style="auto" animated />
              <RootStackLayout />
            </AnimateAppLoader>
          </NotificationProvider>
        </AuthProvider>
      </RQProvider>
    </ThemeProvider>
  );
}
