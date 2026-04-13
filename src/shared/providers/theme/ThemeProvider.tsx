import { createContext, useEffect, useMemo, useState } from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { useColorScheme } from 'nativewind';

const KEY_THEME_PREFERENCE = 'theme.preference';

type ThemePreference = 'light' | 'dark' | 'unspecified';

interface ThemeContextType {
  theme: 'dark' | 'light' | 'unspecified';
  preference: ThemePreference;
  onUpdatePreference: (preference: ThemePreference) => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  preference: 'unspecified',
  onUpdatePreference: (preference: ThemePreference) => {},
});

export default function ThemeProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  // state
  const [preference, setPreference] = useState<ThemePreference>('unspecified');

  // hooks
  const { colorScheme, setColorScheme } = useColorScheme();

  // useEffect
  useEffect(() => {
    AsyncStorage.getItem(KEY_THEME_PREFERENCE)
      .then((data) => (!data ? 'unspecified' : (data as ThemePreference)))
      .then((preference) => setPreference(preference));
  }, []);

  useEffect(() => {
    setColorScheme(preference === 'unspecified' ? 'unspecified' : preference);

    // save
    AsyncStorage.setItem(KEY_THEME_PREFERENCE, preference);
  }, [preference, colorScheme]);

  // memorize
  const contextValue = useMemo<ThemeContextType>(
    () => ({
      theme: colorScheme,
      preference,
      onUpdatePreference: (preference: ThemePreference) => {
        setPreference(preference);
      },
    }),
    [colorScheme, preference],
  );

  return <ThemeContext value={contextValue}>{children}</ThemeContext>;
}
