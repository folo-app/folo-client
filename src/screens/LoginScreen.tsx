import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useEffect, useReducer, useRef, useState } from 'react';
import {
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import type { SocialAuthProvider } from '../api/contracts';
import { useAuth } from '../auth/AuthProvider';
import {
  AUTH_PROVIDER_LABELS,
  getSocialAuthProvidersForPlatform,
  parseSocialAuthHandoffCode,
} from '../auth/socialAuth';
import { ProfileImageField } from '../components/ProfileImageField';
import {
  AuthField,
  AuthNotice,
  AuthNoticeText,
  AuthScreenLayout,
  AuthTextLink,
} from '../components/auth-ui';
import { PrimaryButton } from '../components/ui';
import type { RootStackParamList } from '../navigation/types';
import { tokens } from '../theme/tokens';

type LoginNoticeTone = 'default' | 'positive' | 'danger';
type LoginPhase =
  | 'idle'
  | 'submitting_credentials'
  | 'starting_social'
  | 'exchanging_social'
  | 'submitting_social_profile';

type LoginNotice = {
  tone: LoginNoticeTone;
  text: string;
} | null;

type LoginState = {
  email: string;
  password: string;
  nickname: string;
  profileImage: string | null;
  notice: LoginNotice;
  phase: LoginPhase;
  activeSocialProvider: SocialAuthProvider | null;
};

type LoginAction =
  | { type: 'set_email'; value: string }
  | { type: 'set_password'; value: string }
  | { type: 'set_nickname'; value: string }
  | { type: 'set_profile_image'; value: string | null }
  | { type: 'set_notice'; value: LoginNotice }
  | { type: 'submit_credentials' }
  | { type: 'start_social'; provider: SocialAuthProvider }
  | { type: 'exchange_social' }
  | { type: 'submit_social_profile' }
  | { type: 'complete_step' }
  | { type: 'fail'; message: string }
  | { type: 'reset_social_flow' };

const SOCIAL_PROVIDER_DISPLAY_ORDER: SocialAuthProvider[] = [
  'KAKAO',
  'GOOGLE',
  'NAVER',
  'APPLE',
];
const SOCIAL_PROVIDER_ORDER: SocialAuthProvider[] = SOCIAL_PROVIDER_DISPLAY_ORDER.filter(
  (provider) => getSocialAuthProvidersForPlatform().includes(provider),
);

const SOCIAL_BUTTON_COPY: Record<SocialAuthProvider, string> = {
  APPLE: 'Apple로 계속하기',
  GOOGLE: 'Google로 계속하기',
  KAKAO: '카카오로 계속하기',
  NAVER: '네이버로 계속하기',
};
const SOCIAL_PROVIDER_DISPLAY_NAME: Record<SocialAuthProvider, string> = {
  APPLE: 'Apple',
  GOOGLE: 'Google',
  KAKAO: '카카오',
  NAVER: '네이버',
};

const CUSTOM_SOCIAL_BUTTON_STYLES: Record<
  SocialAuthProvider,
  {
    backgroundColor: string;
    borderColor?: string;
    textColor: string;
  }
> = {
  APPLE: {
    backgroundColor: tokens.colors.surface,
    borderColor: 'rgba(17, 24, 39, 0.12)',
    textColor: '#111827',
  },
  GOOGLE: {
    backgroundColor: '#202325',
    textColor: '#F8FAFC',
  },
  KAKAO: {
    backgroundColor: '#FEE500',
    textColor: '#191919',
  },
  NAVER: {
    backgroundColor: '#03C75A',
    textColor: '#FFFFFF',
  },
};

const initialState: LoginState = {
  email: '',
  password: '',
  nickname: '',
  profileImage: null,
  notice: null,
  phase: 'idle',
  activeSocialProvider: null,
};

function loginReducer(state: LoginState, action: LoginAction): LoginState {
  switch (action.type) {
    case 'set_email':
      return {
        ...state,
        email: action.value,
      };
    case 'set_password':
      return {
        ...state,
        password: action.value,
      };
    case 'set_nickname':
      return {
        ...state,
        nickname: action.value,
      };
    case 'set_profile_image':
      return {
        ...state,
        profileImage: action.value,
      };
    case 'set_notice':
      return {
        ...state,
        notice: action.value,
      };
    case 'submit_credentials':
      return {
        ...state,
        notice: null,
        phase: 'submitting_credentials',
      };
    case 'start_social':
      return {
        ...state,
        notice: null,
        phase: 'starting_social',
        activeSocialProvider: action.provider,
      };
    case 'exchange_social':
      return {
        ...state,
        notice: null,
        phase: 'exchanging_social',
      };
    case 'submit_social_profile':
      return {
        ...state,
        notice: null,
        phase: 'submitting_social_profile',
      };
    case 'complete_step':
      return {
        ...state,
        phase: 'idle',
        activeSocialProvider: null,
      };
    case 'fail':
      return {
        ...state,
        notice: {
          tone: 'danger',
          text: action.message,
        },
        phase: 'idle',
        activeSocialProvider: null,
      };
    case 'reset_social_flow':
      return {
        ...state,
        password: '',
        nickname: '',
        profileImage: null,
        notice: null,
        phase: 'idle',
        activeSocialProvider: null,
      };
  }
}

function getSocialButtonLabel(
  provider: SocialAuthProvider,
  isLoading: boolean,
) {
  if (isLoading) {
    return `${SOCIAL_PROVIDER_DISPLAY_NAME[provider]} 연결 중...`;
  }

  return SOCIAL_BUTTON_COPY[provider];
}

function SocialProviderIcon({ provider }: { provider: SocialAuthProvider }) {
  switch (provider) {
    case 'GOOGLE':
      return <AntDesign color="#FFFFFF" name="google" size={24} />;
    case 'KAKAO':
      return <Ionicons color="#191919" name="chatbubble" size={24} />;
    case 'NAVER':
      return (
        <View style={styles.naverBadge}>
          <Text style={styles.naverBadgeLabel}>N</Text>
        </View>
      );
    case 'APPLE':
      return <Ionicons color="#111827" name="logo-apple" size={24} />;
  }
}

function SocialLoginButton({
  provider,
  label,
  disabled,
  onPress,
}: {
  provider: SocialAuthProvider;
  label: string;
  disabled: boolean;
  onPress: () => void;
}) {
  const palette = CUSTOM_SOCIAL_BUTTON_STYLES[provider];

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.socialButton,
        {
          backgroundColor: palette.backgroundColor,
          borderColor: palette.borderColor ?? palette.backgroundColor,
        },
        disabled && styles.socialButtonDisabled,
        pressed && !disabled && styles.socialButtonPressed,
      ]}
    >
      <View style={styles.socialButtonContent}>
        <SocialProviderIcon provider={provider} />
        <Text style={[styles.socialButtonLabel, { color: palette.textColor }]}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

function AppleSocialLoginButton({
  disabled,
  onPress,
}: {
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <View
      pointerEvents={disabled ? 'none' : 'auto'}
      style={[styles.appleButtonShell, disabled && styles.socialButtonDisabled]}
    >
      <AppleAuthentication.AppleAuthenticationButton
        accessibilityLabel={SOCIAL_BUTTON_COPY.APPLE}
        buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
        buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
        cornerRadius={999}
        onPress={onPress}
        style={styles.appleButton}
      />
    </View>
  );
}

export function LoginScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Login'>>();
  const {
    clearPendingSocialAuth,
    exchangeSocialSignIn,
    pendingSocialAuth,
    pendingVerification,
    signIn,
    startSocialSignIn,
    completeSocialSignInProfile,
    verifyAppleSignIn,
  } = useAuth();
  const [state, dispatch] = useReducer(loginReducer, initialState);
  const [appleAuthAvailable, setAppleAuthAvailable] = useState(Platform.OS === 'ios');
  const aliveRef = useRef(true);
  const exchangeSocialSignInRef = useRef(exchangeSocialSignIn);
  const handledHandoffCodesRef = useRef<Set<string>>(new Set());

  const flowMode =
    pendingSocialAuth?.status === 'PROFILE_SETUP_REQUIRED'
      ? 'social_profile'
      : pendingSocialAuth?.status === 'ACCOUNT_LINK_REQUIRED'
        ? 'social_link'
        : 'credentials';

  const activeProvider =
    pendingSocialAuth?.provider ?? state.activeSocialProvider;
  const activeProviderLabel = activeProvider
    ? AUTH_PROVIDER_LABELS[activeProvider]
    : null;
  const busy = state.phase !== 'idle';

  useEffect(() => {
    aliveRef.current = true;

    return () => {
      aliveRef.current = false;
    };
  }, []);

  useEffect(() => {
    exchangeSocialSignInRef.current = exchangeSocialSignIn;
  }, [exchangeSocialSignIn]);

  useEffect(() => {
    let mounted = true;

    AppleAuthentication.isAvailableAsync()
      .then((available) => {
        if (mounted) {
          setAppleAuthAvailable(available);
        }
      })
      .catch(() => {
        if (mounted) {
          setAppleAuthAvailable(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const nextEmail =
      route.params?.email ?? pendingVerification?.email ?? pendingSocialAuth?.email;

    if (nextEmail) {
      dispatch({ type: 'set_email', value: nextEmail });
    }
  }, [pendingSocialAuth?.email, pendingVerification?.email, route.params?.email]);

  useEffect(() => {
    if (!route.params?.notice) {
      return;
    }

    dispatch({
      type: 'set_notice',
      value: {
        tone: 'positive',
        text: route.params.notice,
      },
    });
  }, [route.params?.notice]);

  useEffect(() => {
    if (!pendingSocialAuth) {
      return;
    }

    if (pendingSocialAuth.nicknameSuggestion) {
      dispatch({
        type: 'set_nickname',
        value: pendingSocialAuth.nicknameSuggestion,
      });
    }

    dispatch({
      type: 'set_profile_image',
      value: pendingSocialAuth.profileImage,
    });

    const message =
      pendingSocialAuth.message ??
      (pendingSocialAuth.status === 'ACCOUNT_LINK_REQUIRED'
        ? `${AUTH_PROVIDER_LABELS[pendingSocialAuth.provider]} 로그인을 기존 FOLO 계정에 연결하려면 이메일 로그인으로 확인해 주세요.`
        : `${AUTH_PROVIDER_LABELS[pendingSocialAuth.provider]} 프로필을 마무리하면 바로 시작할 수 있습니다.`);

    dispatch({
      type: 'set_notice',
      value: {
        tone: 'default',
        text: message,
      },
    });
  }, [pendingSocialAuth]);

  useEffect(() => {
    let alive = true;

    async function handleIncomingUrl(url: string) {
      const handoffCode = parseSocialAuthHandoffCode(url);

      if (!handoffCode || handledHandoffCodesRef.current.has(handoffCode)) {
        return;
      }

      handledHandoffCodesRef.current.add(handoffCode);
      dispatch({ type: 'exchange_social' });

      try {
        await exchangeSocialSignInRef.current(handoffCode);
        if (!alive || !aliveRef.current) {
          return;
        }
        dispatch({ type: 'complete_step' });
      } catch (error) {
        handledHandoffCodesRef.current.delete(handoffCode);

        if (!alive || !aliveRef.current) {
          return;
        }

        dispatch({
          type: 'fail',
          message:
            error instanceof Error
              ? error.message
              : '소셜 로그인 결과를 확인하지 못했습니다. 다시 시도해 주세요.',
        });
      }
    }

    Linking.getInitialURL().then((url) => {
      if (!alive || !url) {
        return;
      }

      void handleIncomingUrl(url);
    });

    const subscription = Linking.addEventListener('url', ({ url }) => {
      void handleIncomingUrl(url);
    });

    return () => {
      alive = false;
      subscription.remove();
    };
  }, []);

  async function completePasswordSignIn(
    emailValue: string,
    passwordValue: string,
  ) {
    const result = await signIn({
      email: emailValue,
      password: passwordValue,
    });

    if (result === 'verification_required') {
      navigation.navigate('EmailVerification', { email: emailValue });
      return false;
    }

    return true;
  }

  async function handleCredentialLogin() {
    const normalizedEmail = state.email.trim().toLowerCase();
    const rawPassword = state.password;
    const trimmedPassword = rawPassword.trim();

    if (!normalizedEmail || !rawPassword) {
      dispatch({
        type: 'set_notice',
        value: {
          tone: 'danger',
          text: '이메일과 비밀번호를 모두 입력해 주세요.',
        },
      });
      return;
    }

    dispatch({ type: 'submit_credentials' });

    try {
      const signedIn = await completePasswordSignIn(normalizedEmail, rawPassword);
      if (signedIn || !aliveRef.current) {
        return;
      }
    } catch (error) {
      if (rawPassword !== trimmedPassword) {
        dispatch({ type: 'set_password', value: trimmedPassword });

        try {
          const signedIn = await completePasswordSignIn(
            normalizedEmail,
            trimmedPassword,
          );
          if (signedIn || !aliveRef.current) {
            return;
          }
        } catch (retryError) {
          if (!aliveRef.current) {
            return;
          }

          dispatch({
            type: 'fail',
            message:
              retryError instanceof Error
                ? retryError.message
                : '로그인에 실패했습니다. 다시 시도해 주세요.',
          });
          return;
        }
      } else if (aliveRef.current) {
        dispatch({
          type: 'fail',
          message:
            error instanceof Error
              ? error.message
              : '로그인에 실패했습니다. 다시 시도해 주세요.',
        });
        return;
      }
    }

    if (aliveRef.current) {
      dispatch({ type: 'complete_step' });
    }
  }

  async function handleSocialStart(provider: SocialAuthProvider) {
    dispatch({ type: 'start_social', provider });

    if (provider === 'APPLE') {
      const stateToken = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const nonce = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

      try {
        const credential = await AppleAuthentication.signInAsync({
          requestedScopes: [
            AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
            AppleAuthentication.AppleAuthenticationScope.EMAIL,
          ],
          state: stateToken,
          nonce,
        });

        if (!credential.identityToken) {
          throw new Error('Apple 로그인 토큰을 확인하지 못했습니다. 다시 시도해 주세요.');
        }

        await verifyAppleSignIn({
          identityToken: credential.identityToken,
          userIdentifier: credential.user,
          email: credential.email,
          givenName: credential.fullName?.givenName ?? null,
          familyName: credential.fullName?.familyName ?? null,
          nonce,
        });
      } catch (error) {
        if (!aliveRef.current) {
          return;
        }

        if (
          typeof error === 'object' &&
          error !== null &&
          'code' in error &&
          error.code === 'ERR_REQUEST_CANCELED'
        ) {
          dispatch({ type: 'complete_step' });
          return;
        }

        dispatch({
          type: 'fail',
          message:
            error instanceof Error
              ? error.message
              : 'Apple 로그인을 시작하지 못했습니다. 다시 시도해 주세요.',
        });
        return;
      }

      if (aliveRef.current) {
        dispatch({ type: 'complete_step' });
      }
      return;
    }

    try {
      const result = await startSocialSignIn(provider);
      await Linking.openURL(result.authorizationUrl);
    } catch (error) {
      if (!aliveRef.current) {
        return;
      }

      dispatch({
        type: 'fail',
        message:
          error instanceof Error
            ? error.message
            : '소셜 로그인을 시작하지 못했습니다. 다시 시도해 주세요.',
      });
      return;
    }

    if (aliveRef.current) {
      dispatch({ type: 'complete_step' });
    }
  }

  async function handleSocialProfileSubmit() {
    const normalizedNickname = state.nickname.trim();

    if (!normalizedNickname) {
      dispatch({
        type: 'set_notice',
        value: {
          tone: 'danger',
          text: '닉네임을 입력해 주세요.',
        },
      });
      return;
    }

    dispatch({ type: 'submit_social_profile' });

    try {
      await completeSocialSignInProfile({
        nickname: normalizedNickname,
        profileImage: state.profileImage,
      });
    } catch (error) {
      if (!aliveRef.current) {
        return;
      }

      dispatch({
        type: 'fail',
        message:
          error instanceof Error
            ? error.message
            : '소셜 로그인 프로필을 저장하지 못했습니다. 다시 시도해 주세요.',
      });
      return;
    }

    if (aliveRef.current) {
      dispatch({ type: 'complete_step' });
    }
  }

  function handleResetSocialFlow() {
    clearPendingSocialAuth();
    dispatch({ type: 'reset_social_flow' });
  }

  const footer =
    flowMode === 'credentials' ? (
      <>
        <Text style={styles.footerText}>처음이라면</Text>
        <AuthTextLink label="회원가입" onPress={() => navigation.navigate('Signup')} />
      </>
    ) : (
      <>
        <Text style={styles.footerText}>다른 방식으로 다시 시작하려면</Text>
        <AuthTextLink label="로그인 기본 화면" onPress={handleResetSocialFlow} />
      </>
    );

  return (
    <AuthScreenLayout
      badge="Sign In"
      heroVariant="compact"
      title={`포트폴리오와 친구 피드,\n한 번에 이어 보기`}
      subtitle="로그인하면 마지막 기록과 투자 루틴이 바로 이어집니다."
      footer={footer}
    >
      {flowMode === 'social_profile' ? (
        <>
          {pendingSocialAuth?.email ? (
            <AuthField
              editable={false}
              helper={`${activeProviderLabel ?? '소셜'} 계정에서 전달된 이메일입니다.`}
              label="이메일"
              value={pendingSocialAuth.email}
            />
          ) : null}

          <AuthField
            autoCapitalize="none"
            helper="친구 피드와 포트폴리오 공개 화면에 표시됩니다."
            label="닉네임"
            onChangeText={(value) => dispatch({ type: 'set_nickname', value })}
            placeholder="닉네임"
            value={state.nickname}
          />

          <ProfileImageField
            fallbackName={state.nickname || state.email || 'Folo'}
            helper="선택 사항입니다. 소셜 계정 이미지가 있더라도 여기서 바꿀 수 있습니다."
            label="프로필 이미지"
            onChange={(value) => dispatch({ type: 'set_profile_image', value })}
            value={state.profileImage}
          />
        </>
      ) : (
        <>
          <AuthField
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            label="이메일"
            onChangeText={(value) => dispatch({ type: 'set_email', value })}
            placeholder="you@example.com"
            value={state.email}
          />
          <AuthField
            autoCapitalize="none"
            autoComplete="password"
            helper={
              flowMode === 'social_link'
                ? '기존 비밀번호 로그인을 마치면 선택한 소셜 계정이 함께 연결됩니다.'
                : '영문, 숫자, 특수문자를 포함한 비밀번호를 입력합니다.'
            }
            label="비밀번호"
            onChangeText={(value) => dispatch({ type: 'set_password', value })}
            placeholder="비밀번호"
            secureTextEntry
            value={state.password}
          />
        </>
      )}

      {state.notice ? (
        <AuthNotice tone={state.notice.tone}>
          <AuthNoticeText>{state.notice.text}</AuthNoticeText>
        </AuthNotice>
      ) : null}

      {flowMode === 'social_profile' ? (
        <PrimaryButton
          disabled={busy}
          label={
            state.phase === 'submitting_social_profile'
              ? '프로필 저장 중...'
              : `${activeProviderLabel ?? '소셜'}로 시작하기`
          }
          onPress={handleSocialProfileSubmit}
        />
      ) : (
        <PrimaryButton
          disabled={busy}
          label={
            state.phase === 'submitting_credentials'
              ? '로그인 중...'
              : flowMode === 'social_link' && activeProviderLabel
                ? `${activeProviderLabel} 연결하고 로그인`
                : '로그인'
          }
          onPress={handleCredentialLogin}
        />
      )}

      {flowMode === 'credentials' ? (
        <>
          <View style={styles.linkGrid}>
            <View style={styles.inlineRow}>
              <Text style={styles.inlineText}>가입 이메일이 기억나지 않나요?</Text>
              <AuthTextLink
                label="아이디 찾기"
                onPress={() => navigation.navigate('RecoverLoginId')}
              />
            </View>
            <View style={styles.inlineRow}>
              <Text style={styles.inlineText}>비밀번호를 잊어버렸나요?</Text>
              <AuthTextLink
                label="임시 비밀번호 받기"
                onPress={() =>
                  navigation.navigate('PasswordResetRequest', {
                    email: state.email.trim(),
                  })
                }
              />
            </View>
          </View>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerLabel}>또는 소셜 계정으로 이어가기</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialButtonStack}>
            {SOCIAL_PROVIDER_ORDER.map((provider) => {
              const providerLoading =
                state.phase === 'starting_social' &&
                state.activeSocialProvider === provider;

              if (provider === 'APPLE') {
                if (!appleAuthAvailable) {
                  return null;
                }

                return (
                  <AppleSocialLoginButton
                    key={provider}
                    disabled={busy}
                    onPress={() => handleSocialStart(provider)}
                  />
                );
              }

              return (
                <SocialLoginButton
                  key={provider}
                  disabled={busy}
                  label={getSocialButtonLabel(provider, providerLoading)}
                  onPress={() => handleSocialStart(provider)}
                  provider={provider}
                />
              );
            })}
          </View>

          <Text style={styles.socialLegalText}>
            ‘계속하기’를 누르면 필수 이용약관 및 개인정보 처리방침에 동의한 것으로
            간주됩니다.
          </Text>
        </>
      ) : (
        <View style={styles.resetRow}>
          <Text style={styles.inlineText}>
            {flowMode === 'social_link'
              ? '일반 이메일 로그인으로만 진행하려면'
              : '프로필 설정을 닫고 다른 방식으로 시작하려면'}
          </Text>
          <AuthTextLink label="소셜 흐름 취소" onPress={handleResetSocialFlow} />
        </View>
      )}
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  footerText: {
    color: tokens.colors.inkSoft,
    fontSize: 14,
    fontFamily: tokens.typography.body,
  },
  linkGrid: {
    gap: 6,
  },
  inlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  inlineText: {
    color: tokens.colors.inkSoft,
    fontSize: 13,
    fontFamily: tokens.typography.body,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 2,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: tokens.colors.line,
  },
  dividerLabel: {
    color: tokens.colors.inkMute,
    fontSize: 12,
    fontFamily: tokens.typography.body,
  },
  socialButtonStack: {
    gap: 10,
  },
  socialButton: {
    minHeight: 54,
    borderRadius: tokens.radius.pill,
    borderWidth: 1,
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    ...tokens.shadow,
  },
  socialButtonContent: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
  },
  socialButtonLabel: {
    fontSize: 15,
    fontFamily: tokens.typography.heading,
    fontWeight: '700',
  },
  socialButtonPressed: {
    opacity: 0.94,
    transform: [{ scale: 0.995 }],
  },
  socialButtonDisabled: {
    opacity: 0.58,
  },
  appleButtonShell: {
    minHeight: 54,
    borderRadius: tokens.radius.pill,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(17, 24, 39, 0.10)',
    backgroundColor: tokens.colors.surface,
    ...tokens.shadow,
  },
  appleButton: {
    width: '100%',
    height: 54,
  },
  naverBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 20,
    height: 20,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  naverBadgeLabel: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: tokens.typography.heading,
    fontWeight: '900',
    lineHeight: 15,
  },
  socialLegalText: {
    color: tokens.colors.inkMute,
    fontSize: 13,
    lineHeight: 20,
    fontFamily: tokens.typography.body,
    textAlign: 'center',
  },
  resetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
});
