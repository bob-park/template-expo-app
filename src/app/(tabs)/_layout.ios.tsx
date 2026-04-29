import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { useTranslation } from 'react-i18next';

export default function IosTabLayout() {
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
