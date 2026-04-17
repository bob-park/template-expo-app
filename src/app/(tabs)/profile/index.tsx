import { useContext } from 'react';

import { Text, TouchableOpacity, View } from 'react-native';

import { ThemeContext } from '@/shared/providers/theme/ThemeProvider';

import cx from 'classnames';

const THEME_OPTIONS: { key: string; label: string }[] = [
  {
    key: 'light',
    label: '밝은 모드',
  },
  {
    key: 'dark',
    label: '어두운 모드',
  },
  {
    key: 'system',
    label: '시스템 설정과 같이',
  },
];

export default function Info() {
  // context
  const { theme, onUpdateTheme } = useContext(ThemeContext);

  return (
    <View className="flex size-full items-center justify-center dark:bg-black">
      <Text>My Info</Text>

      <View className="w-full flex-col">
        {THEME_OPTIONS.map((option, index) => (
          <View key={option.key}>
            <TouchableOpacity
              className={cx(`flex flex-row items-center gap-3 px-4 py-4`, {
                'bg-black dark:bg-white': theme === option.key,
              })}
              onPress={() => onUpdateTheme(option.key as ThemePreference)}
            >
              {/* label */}
              <Text
                className={cx('flex-1 text-[15px] font-semibold', {
                  'text-white dark:text-black': theme === option.key,
                  'text-black dark:text-white': theme !== option.key,
                })}
              >
                {option.label}
              </Text>

              {/* checkmark */}
              {theme === option.key && (
                <Text
                  className={cx({
                    'text-white dark:text-black': theme === option.key,
                  })}
                >
                  체크
                </Text>
              )}
            </TouchableOpacity>

            {index < THEME_OPTIONS.length - 1 && <View className="ml-[60px]" />}
          </View>
        ))}
      </View>
    </View>
  );
}
