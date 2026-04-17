import { createContext, useEffect, useMemo, useState } from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

import i18n, { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES, resolveDeviceLanguage } from '@/shared/i18n';

const KEY_LANGUAGE_PREFERENCE = 'language.preference';

interface I18nContextType {
  language: LanguagePreference;
  resolvedLanguage: SupportedLanguage;
  onUpdateLanguage: (language: LanguagePreference) => void;
}

export const I18nContext = createContext<I18nContextType>({
  language: 'system',
  resolvedLanguage: DEFAULT_LANGUAGE,
  onUpdateLanguage: () => {},
});

const isSupported = (value: string): value is SupportedLanguage =>
  (SUPPORTED_LANGUAGES as readonly string[]).includes(value);

const resolveLanguage = (preference: LanguagePreference): SupportedLanguage =>
  preference === 'system' ? resolveDeviceLanguage() : preference;

export default function I18nProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [language, setLanguage] = useState<LanguagePreference>('system');

  useEffect(() => {
    AsyncStorage.getItem(KEY_LANGUAGE_PREFERENCE)
      .then((stored) => {
        if (stored === 'system' || (stored && isSupported(stored))) {
          setLanguage(stored as LanguagePreference);
        }
      })
      .catch((err) => console.warn('load language preference failed', err));
  }, []);

  const resolvedLanguage = useMemo(() => resolveLanguage(language), [language]);

  useEffect(() => {
    if (i18n.language !== resolvedLanguage) {
      i18n.changeLanguage(resolvedLanguage).catch((err) => console.warn('changeLanguage failed', err));
    }
    AsyncStorage.setItem(KEY_LANGUAGE_PREFERENCE, language).catch((err) =>
      console.warn('save language preference failed', err),
    );
  }, [language, resolvedLanguage]);

  const contextValue = useMemo<I18nContextType>(
    () => ({
      language,
      resolvedLanguage,
      onUpdateLanguage: (next: LanguagePreference) => setLanguage(next),
    }),
    [language, resolvedLanguage],
  );

  return <I18nContext value={contextValue}>{children}</I18nContext>;
}
