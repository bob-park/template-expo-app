import { useContext } from 'react';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import '@/app/global.css';
import AnimateAppLoader from '@/shared/loaders/app/AnimateAppLoader';
import AuthProvider, { AuthContext } from '@/shared/providers/auth/AuthProvider';
import I18nProvider from '@/shared/providers/i18n/I18nProvider';
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
      {/*
        가드에 막혔을 때 갈 곳을 명시한다. 생략하면 expo-router 가 첫 화면을 자동으로 고르는데,
        (tabs) 레이아웃이 _layout.ios.tsx 처럼 플랫폼 파일이면 '/(tabs)/_layout.ios' 로 이동해 404 가 된다.
      */}
      <Stack.Protected guard={isLoggedIn} redirectTo="/login">
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>
      <Stack.Protected guard={!isLoggedIn} redirectTo="/">
        <Stack.Screen name="login" />
        <Stack.Screen name="callback" />
      </Stack.Protected>
    </Stack>
  );
};

export default function RootLayout() {
  return (
    <ThemeProvider>
      <I18nProvider>
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
      </I18nProvider>
    </ThemeProvider>
  );
}
