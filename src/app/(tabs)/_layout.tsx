import { Tabs } from 'expo-router';

import { Ionicons } from '@expo/vector-icons';

import { useColorScheme } from 'nativewind';
import { useTranslation } from 'react-i18next';

export default function TabLayout() {
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
