import { Platform } from 'react-native';

import { Tabs } from 'expo-router';
import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { Ionicons } from '@expo/vector-icons';

import { useColorScheme } from 'nativewind';
import { useTranslation } from 'react-i18next';

function IOSTabs() {
  const { t } = useTranslation();
  return (
    <NativeTabs
      backBehavior="history"
      labelStyle={{
        default: { fontSize: 10 },
      }}
    >
      <NativeTabs.Trigger name="(home)">
        <NativeTabs.Trigger.Icon sf="house" md="house" drawable="custom_android_drawable" />
        <NativeTabs.Trigger.Label>{t('tabs.home')}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="schedule">
        <NativeTabs.Trigger.Icon sf="calendar" md="calendar_view_day" drawable="custom_android_drawable" />
        <NativeTabs.Trigger.Label>{t('tabs.schedule')}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="notification">
        <NativeTabs.Trigger.Icon sf="bell.fill" md="doorbell" drawable="custom_android_drawable" />
        <NativeTabs.Trigger.Label>{t('tabs.notification')}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Icon sf="person.fill" md="person" drawable="custom_android_drawable" />
        <NativeTabs.Trigger.Label>{t('tabs.profile')}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function AndroidTabs() {
  const { t } = useTranslation();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Tabs
      backBehavior="history"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: isDark ? '#ffffff' : '#000000',
        tabBarInactiveTintColor: isDark ? '#6b7280' : '#9ca3af',
        tabBarItemStyle: {},
        tabBarLabelStyle: { fontSize: 10 },
        tabBarStyle: {
          backgroundColor: isDark ? '#111111' : '#ffffff',
          borderTopColor: isDark ? '#111111' : '#ffffff',
        },
        sceneStyle: {
          backgroundColor: isDark ? '#000000' : '#ffffff',
        },
      }}
    >
      <Tabs.Screen
        name="(home)"
        options={{
          title: t('tabs.home'),
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: t('tabs.schedule'),
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'calendar' : 'calendar-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="notification"
        options={{
          title: t('tabs.notification'),
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'notifications' : 'notifications-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabs.profile'),
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  if (Platform.OS === 'ios') {
    return <IOSTabs />;
  }

  return <AndroidTabs />;
}
