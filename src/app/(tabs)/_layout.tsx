import { useContext } from 'react';

import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { ThemeContext } from '@/shared/providers/theme/ThemeProvider';

function TabMenus({ theme }: { theme: string }) {
  return (
    <NativeTabs
      backBehavior="history"
      labelStyle={{
        default: { fontSize: 10 },
      }}
    >
      <NativeTabs.Trigger name="(home)/index">
        <NativeTabs.Trigger.Icon sf="house" md="house" drawable="custom_android_drawable" />
        <NativeTabs.Trigger.Label>홈</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="(schedule)/index">
        <NativeTabs.Trigger.Icon sf="calendar" md="calendar_view_day" drawable="custom_android_drawable" />
        <NativeTabs.Trigger.Label>일정</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="(info)/index">
        <NativeTabs.Trigger.Icon sf="person" md="person" drawable="custom_android_drawable" />
        <NativeTabs.Trigger.Label>내정보</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

export default function TabLayout() {
  const { theme } = useContext(ThemeContext);

  return <TabMenus theme={theme} />;
}
