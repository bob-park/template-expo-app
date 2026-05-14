import AsyncStorage from '@react-native-async-storage/async-storage';

import createUserSlice from '@/domain/users/store/slice';
import { UserState } from '@/domain/users/store/users.state';

import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export const useStore = create<BoundState>()(
  devtools(
    persist(
      immer((...a) => ({
        ...createUserSlice(...a),
      })),
      { name: 'template-expo-app', storage: createJSONStorage(() => AsyncStorage) },
    ),
    { name: 'template-expo-app', enabled: process.env.NODE_ENV !== 'production' },
  ),
);

export type BoundState = UserState;
