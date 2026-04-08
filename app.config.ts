import type { ExpoConfig } from 'expo/config';

type FoloExpoConfig = ExpoConfig & {
  newArchEnabled?: boolean;
};

const config: FoloExpoConfig = {
  name: 'Folo',
  slug: 'folo-client',
  version: '1.0.0',
  icon: './assets/branding/app-icon-1024.png',
  orientation: 'portrait',
  scheme: 'folo',
  userInterfaceStyle: 'light',
  newArchEnabled: true,
  ios: {
    icon: './assets/branding/app-icon-1024.png',
    supportsTablet: true,
    bundleIdentifier: 'com.godten.folo',
    usesAppleSignIn: true,
    entitlements: {
      'com.apple.security.application-groups': ['group.com.godten.folo'],
    },
  },
  android: {
    predictiveBackGestureEnabled: false,
    package: 'com.godten.folo',
    adaptiveIcon: {
      foregroundImage: './assets/branding/android-adaptive-foreground.png',
      backgroundColor: '#FAFCFF',
    },
  },
  web: {
    bundler: 'metro',
    favicon: './assets/branding/favicon.png',
    output: 'single',
  },
};

export default config;
