import type { ExpoConfig } from 'expo/config';

type FoloExpoConfig = ExpoConfig & {
  newArchEnabled?: boolean;
};

const config: FoloExpoConfig = {
  name: 'Folo',
  slug: 'folo-client',
  version: '1.0.0',
  orientation: 'portrait',
  scheme: 'folo',
  userInterfaceStyle: 'light',
  newArchEnabled: true,
  ios: {
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
  },
  web: {
    bundler: 'metro',
    output: 'single',
  },
};

export default config;
