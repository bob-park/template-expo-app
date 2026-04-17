import { ConfigContext, ExpoConfig } from 'expo/config';

import { version } from './package.json';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'template-expo-app',
  slug: 'template-expo-app',
  version,
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'templateexpoapp',
  userInterfaceStyle: 'automatic',
  ios: {
    supportsTablet: true,
    icon: './assets/expo.icon',
    bundleIdentifier: 'com.bobpark.template-expo-app',
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
      UIBackgroundModes: ['remote-notification'],
    },
  },
  android: {
    package: 'org.bobpark.templateexpoapp',
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    permissions: ['android.permission.ACCESS_COARSE_LOCATION', 'android.permission.ACCESS_FINE_LOCATION'],
    predictiveBackGestureEnabled: false,
    googleServicesFile: './google-services.json',
  },
  web: {
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#208AEF',
        android: {
          image: './assets/images/splash-icon.png',
          imageWidth: 76,
        },
      },
    ],
    [
      'expo-location',
      {
        locationAlwaysAndWhenInUsePermission: 'Allow ${PRODUCT_NAME} to use your location.',
      },
    ],
    [
      'expo-build-properties',
      {
        android: {
          usesCleartextTraffic: true,
        },
        ios: {
          infoPlist: {
            NSAppTransportSecurity: {
              NSAllowsArbitraryLoads: true,
            },
          },
        },
      },
    ],
    [
      'expo-notifications',
      {
        icon: './assets/images/icon.png',
        enableBackgroundRemoteNotifications: true,
      },
    ],
    [
      'expo-audio',
      {
        microphonePermission: 'Allow $(PRODUCT_NAME) to access your microphone.',
      },
    ],
    'expo-font',
    'expo-secure-store',
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    router: {},
    eas: {
      projectId: '40940bcb-9bde-47c7-be00-49932cb86e70',
    },
    auth: {
      host: process.env.AUTHORIZATION_HOST,
      clientId: process.env.AUTHORIZATION_CLIENT_ID,
      clientSecret: process.env.AUTHORIZATION_CLIENT_SECRET,
    },
  },
});
