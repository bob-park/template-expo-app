import AsyncStorage from '@react-native-async-storage/async-storage';

import { NotificationState } from '@/domain/notifications/store/notifications.state';
import createNotificationSlice from '@/domain/notifications/store/slice';
import createThemeSlice from '@/domain/theme/store/slice';
import { ThemeState } from '@/domain/theme/store/theme.state';
import createUserSlice from '@/domain/users/store/slice';
import { UserState } from '@/domain/users/store/users.state';
import { UserInfo } from '@/shared/providers/auth/AuthProvider';
import { ThemePreference } from '@/shared/providers/theme/ThemeProvider';

import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export const useStore = create<BoundState>()(
  devtools(
    persist(
      immer((...a) => ({
        ...createUserSlice(...a),
        ...createThemeSlice(...a),
        ...createNotificationSlice(...a),
      })),
      {
        name: 'template-expo-app',
        storage: createJSONStorage(() => AsyncStorage),
        partialize: (state): { userinfo?: UserInfo; themePreference?: ThemePreference; userProviderId?: string } => ({
          userinfo: state.userinfo,
          themePreference: state.themePreference,
          userProviderId: state.userProviderId,
        }),
      },
    ),
    { name: 'template-expo-app', enabled: process.env.NODE_ENV !== 'production' },
  ),
);

export type BoundState = UserState & ThemeState & NotificationState;
