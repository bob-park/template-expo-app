import { View } from 'react-native';

import { Stack } from 'expo-router';

export default function HomeLayout() {
  return (
    <View className="flex size-full bg-gray-50 dark:bg-gray-950">
      <Stack screenOptions={{ headerShown: false }} />
    </View>
  );
}
