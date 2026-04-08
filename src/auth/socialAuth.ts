import { Platform } from 'react-native';

import type { AuthProvider, SocialAuthProvider } from '../api/contracts';

export const AUTH_PROVIDER_LABELS: Record<AuthProvider, string> = {
  EMAIL: '이메일',
  APPLE: 'Apple',
  GOOGLE: 'Google',
  KAKAO: '카카오',
  NAVER: '네이버',
};

export const SOCIAL_AUTH_PROVIDER_DESCRIPTIONS: Record<SocialAuthProvider, string> = {
  APPLE: 'iPhone 계정으로 바로 이어서 로그인합니다.',
  GOOGLE: 'Google 계정으로 빠르게 로그인합니다.',
  KAKAO: '카카오 계정으로 친구 피드와 루틴을 이어갑니다.',
  NAVER: '네이버 계정으로 로그인 수단을 하나 더 연결합니다.',
};

export function getSocialAuthProvidersForPlatform(): SocialAuthProvider[] {
  if (Platform.OS === 'ios') {
    return ['GOOGLE', 'KAKAO', 'NAVER', 'APPLE'];
  }

  return ['GOOGLE', 'KAKAO', 'NAVER'];
}

export function parseSocialAuthHandoffCode(url: string) {
  if (
    !url.startsWith('folo://auth/callback') &&
    !url.startsWith('exp+folo-client://auth/callback')
  ) {
    return null;
  }

  const queryString = url.split('?')[1] ?? '';
  const params = new URLSearchParams(queryString);
  return params.get('handoffCode');
}
