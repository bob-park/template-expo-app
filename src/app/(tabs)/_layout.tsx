import { useContext } from 'react';

import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { ThemeContext } from '@/shared/providers/theme/ThemeProvider';
import {Tabs} from "expo-router";
import {Ionicons} from "@expo/vector-icons";
import {Platform} from "react-native";

function IOSTabs({ theme }: { theme: string }) {
  return (
      <NativeTabs
          backBehavior="history"
          labelStyle={{
            default: { fontSize: 10 },
          }}
      >
        <NativeTabs.Trigger name="(home)">
          <NativeTabs.Trigger.Icon sf="house" md="house" drawable="custom_android_drawable" />
          <NativeTabs.Trigger.Label>홈</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="schedule">
          <NativeTabs.Trigger.Icon sf="calendar" md="calendar_view_day" drawable="custom_android_drawable" />
          <NativeTabs.Trigger.Label>일정</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="notification">
          <NativeTabs.Trigger.Icon sf="bell.fill" md="doorbell" drawable="custom_android_drawable" />
          <NativeTabs.Trigger.Label>공지</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="profile">
          <NativeTabs.Trigger.Icon sf="person.fill" md="person" drawable="custom_android_drawable" />
          <NativeTabs.Trigger.Label>내정보</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
      </NativeTabs>
  );
}

function AndroidTabs({ theme }: { theme: string }) {
  return (
      <Tabs
          backBehavior="history"
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: theme !== 'light' ? '#ffffff' : '#000000',
            tabBarInactiveTintColor: theme !== 'light' ? '#6b7280' : '#9ca3af',
            tabBarItemStyle: {},
            tabBarLabelStyle: { fontSize: 10 },
            tabBarStyle: {
              backgroundColor: theme !== 'light' ? '#111111' : '#ffffff',
              borderTopColor: theme !== 'light' ? '#111111' : '#ffffff',
            },
          }}
      >
        <Tabs.Screen
            name="(home)"
            options={{
              title: '홈',
              tabBarIcon: ({ focused, color, size }) => (
                  <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />
              ),
            }}
        />
        <Tabs.Screen
            name="schedule"
            options={{
              title: '일정',
              tabBarIcon: ({ focused, color, size }) => (
                  <Ionicons name={focused ? 'calendar' : 'calendar-outline'} size={size} color={color} />
              ),
            }}
        />
        <Tabs.Screen
            name="notification"
            options={{
              title: '공지',
              tabBarIcon: ({ focused, color, size }) => (
                  <Ionicons name={focused ? 'notifications' : 'notifications-outline'} size={size} color={color} />
              ),
            }}
        />
        <Tabs.Screen
            name="profile"
            options={{
              title: '내 정보',
              tabBarIcon: ({ focused, color, size }) => (
                  <Ionicons name={focused ? 'person' : 'person-outline'} size={size} color={color} />
              ),
            }}
        />
      </Tabs>
  );
}

export default function TabLayout() {
  const { theme } = useContext(ThemeContext);

  if (Platform.OS === 'ios') {
    return <IOSTabs theme={theme} />;
  }

  return <AndroidTabs theme={theme} />;
}
