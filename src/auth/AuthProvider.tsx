import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AppState, Platform, type AppStateStatus } from 'react-native';

import { setFoloAccessToken } from '../api/config';
import { ApiClientError } from '../api/client';
import type {
  AppleNativeAuthRequest,
  AuthProvider as AuthProviderType,
  AuthResponse,
  ConfirmEmailRequest,
  LoginRequest,
  SocialAuthExchangeResponse,
  SocialAuthExchangeStatus,
  SocialAuthProvider,
  SocialAuthStartResponse,
  SignupRequest,
} from '../api/contracts';
import { foloApi } from '../api/services';
import {
  clearAllWidgetsInBackground,
  syncAllWidgetsInBackground,
} from '../features/widgets';

type AuthStatus = 'booting' | 'signed_out' | 'authenticated';
type SignInResult = 'authenticated' | 'verification_required';
type SocialSignInResult =
  | 'authenticated'
  | 'profile_setup_required'
  | 'account_link_required';
type PendingSocialAuthStatus = Exclude<SocialAuthExchangeStatus, 'AUTHENTICATED'>;

type PendingVerification = {
  email: string;
  nickname?: string;
} | null;

type PendingSocialAuth = {
  status: PendingSocialAuthStatus;
  pendingToken: string;
  provider: SocialAuthProvider;
  email: string | null;
  nicknameSuggestion: string | null;
  profileImage: string | null;
  message: string | null;
} | null;

type AuthContextValue = {
  status: AuthStatus;
  session: AuthResponse | null;
  pendingVerification: PendingVerification;
  pendingSocialAuth: PendingSocialAuth;
  signIn: (body: LoginRequest) => Promise<SignInResult>;
  signUp: (body: SignupRequest) => Promise<PendingVerification>;
  startSocialSignIn: (provider: SocialAuthProvider) => Promise<SocialAuthStartResponse>;
  verifyAppleSignIn: (body: AppleNativeAuthRequest) => Promise<SocialSignInResult>;
  exchangeSocialSignIn: (handoffCode: string) => Promise<SocialSignInResult>;
  linkPendingSocialAuth: () => Promise<void>;
  completeSocialSignInProfile: (body: {
    nickname: string;
    profileImage: string | null;
  }) => Promise<void>;
  confirmEmail: (body: ConfirmEmailRequest) => Promise<void>;
  resendVerification: (email?: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearPendingVerification: () => void;
  clearPendingSocialAuth: () => void;
};

const SESSION_STORAGE_KEY = '@folo/auth-session';
const MIN_SPLASH_DURATION_MS = 1750;
const inMemoryStorage = new Map<string, string>();
const AUTH_PROVIDER_VALUES: AuthProviderType[] = [
  'EMAIL',
  'APPLE',
  'GOOGLE',
  'KAKAO',
  'NAVER',
];

const AuthContext = createContext<AuthContextValue | null>(null);

function isUnavailableStorageError(error: unknown) {
  return (
    error instanceof Error &&
    (error.message.includes('Native module is null') ||
      error.message.includes('legacy storage'))
  );
}

async function getStorageItem(key: string) {
  try {
    return await AsyncStorage.getItem(key);
  } catch (error) {
    if (isUnavailableStorageError(error)) {
      return inMemoryStorage.get(key) ?? null;
    }
    throw error;
  }
}

async function setStorageItem(key: string, value: string) {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (error) {
    if (isUnavailableStorageError(error)) {
      inMemoryStorage.set(key, value);
      return;
    }
    throw error;
  }
}

async function removeStorageItem(key: string) {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    if (isUnavailableStorageError(error)) {
      inMemoryStorage.delete(key);
      return;
    }
    throw error;
  }
}

async function readStoredSession() {
  const raw = await getStorageItem(SESSION_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    const normalized = normalizeStoredSession(parsed);

    if (!normalized) {
      await removeStorageItem(SESSION_STORAGE_KEY);
      return null;
    }

    return normalized;
  } catch {
    await removeStorageItem(SESSION_STORAGE_KEY);
    return null;
  }
}

async function persistSession(session: AuthResponse) {
  await setStorageItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  setFoloAccessToken(session.accessToken);
}

async function clearSessionStorage() {
  await removeStorageItem(SESSION_STORAGE_KEY);
  setFoloAccessToken('');
}

function isExpiredSessionError(error: unknown) {
  return (
    error instanceof ApiClientError &&
    (error.code === 'INVALID_REFRESH_TOKEN' ||
      error.code === 'EXPIRED_REFRESH_TOKEN' ||
      error.code === 'UNAUTHORIZED')
  );
}

function isAuthProvider(value: unknown): value is AuthProviderType {
  return AUTH_PROVIDER_VALUES.includes(value as AuthProviderType);
}

function normalizeStoredSession(value: unknown): AuthResponse | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const session = value as Partial<AuthResponse>;

  if (
    typeof session.userId !== 'number' ||
    typeof session.nickname !== 'string' ||
    typeof session.accessToken !== 'string' ||
    typeof session.refreshToken !== 'string'
  ) {
    return null;
  }

  return {
    userId: session.userId,
    nickname: session.nickname,
    email: typeof session.email === 'string' ? session.email : null,
    profileImage: typeof session.profileImage === 'string' ? session.profileImage : null,
    authProvider: isAuthProvider(session.authProvider) ? session.authProvider : 'EMAIL',
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
  };
}

function toPendingSocialAuth(
  response: SocialAuthExchangeResponse,
): PendingSocialAuth {
  if (response.status === 'AUTHENTICATED') {
    return null;
  }

  if (!response.pendingToken || !response.provider) {
    throw new Error('소셜 로그인 상태를 이어갈 수 없습니다. 다시 시도해 주세요.');
  }

  return {
    status: response.status,
    pendingToken: response.pendingToken,
    provider: response.provider,
    email: response.email,
    nicknameSuggestion: response.nicknameSuggestion,
    profileImage: response.profileImage,
    message: response.message,
  };
}

function getSocialAuthPlatform() {
  switch (Platform.OS) {
    case 'ios':
      return 'IOS' as const;
    case 'android':
      return 'ANDROID' as const;
    default:
      return 'WEB' as const;
  }
}

function normalizeComparableEmail(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? null;
}

function canLinkPendingSocialAuth(
  pendingSocialLink: Exclude<PendingSocialAuth, null>,
  nextSession: AuthResponse,
) {
  const pendingEmail = normalizeComparableEmail(pendingSocialLink.email);
  const sessionEmail = normalizeComparableEmail(nextSession.email);

  return pendingEmail !== null && sessionEmail !== null && pendingEmail === sessionEmail;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('booting');
  const [session, setSession] = useState<AuthResponse | null>(null);
  const [pendingVerification, setPendingVerification] =
    useState<PendingVerification>(null);
  const [pendingSocialAuth, setPendingSocialAuth] =
    useState<PendingSocialAuth>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  async function finalizeAuthenticatedSession(nextSession: AuthResponse) {
    await persistSession(nextSession);
    setSession(nextSession);
    setPendingVerification(null);
    setPendingSocialAuth(null);
    setStatus('authenticated');
  }

  useEffect(() => {
    let alive = true;

    async function bootstrap() {
      let restoredSession: AuthResponse | null = null;

      try {
        const storedSession = await readStoredSession();

        if (storedSession) {
          setFoloAccessToken(storedSession.accessToken);

          try {
            restoredSession = await foloApi.refresh({
              refreshToken: storedSession.refreshToken,
            });
            await persistSession(restoredSession);
          } catch (error) {
            if (isExpiredSessionError(error)) {
              await clearSessionStorage();
            } else {
              restoredSession = storedSession;
              setFoloAccessToken(storedSession.accessToken);
            }
          }
        }
      } catch {
        await clearSessionStorage();
      }

      await new Promise((resolve) =>
        setTimeout(resolve, MIN_SPLASH_DURATION_MS),
      );

      if (!alive) {
        return;
      }

      if (restoredSession) {
        setSession(restoredSession);
        setStatus('authenticated');
        return;
      }

      setSession(null);
      setStatus('signed_out');
    }

    bootstrap();

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (status === 'authenticated') {
      syncAllWidgetsInBackground();
      return;
    }

    if (status === 'signed_out') {
      clearAllWidgetsInBackground();
    }
  }, [session?.accessToken, status]);

  useEffect(() => {
    appStateRef.current = AppState.currentState;

    if (status !== 'authenticated') {
      return;
    }

    const subscription = AppState.addEventListener('change', (nextState) => {
      const previousState = appStateRef.current;
      appStateRef.current = nextState;

      const becameActive =
        (previousState === 'background' || previousState === 'inactive') &&
        nextState === 'active';

      if (becameActive) {
        syncAllWidgetsInBackground();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [status]);

  async function signIn(body: LoginRequest): Promise<SignInResult> {
    const pendingSocialLink =
      pendingSocialAuth?.status === 'ACCOUNT_LINK_REQUIRED'
        ? pendingSocialAuth
        : null;
    let issuedSession: AuthResponse | null = null;

    try {
      issuedSession = await foloApi.login(body);
      setFoloAccessToken(issuedSession.accessToken);

      const nextSession = pendingSocialLink
        ? canLinkPendingSocialAuth(pendingSocialLink, issuedSession)
          ? await foloApi.linkSocialAuth({
              pendingToken: pendingSocialLink.pendingToken,
            })
          : (() => {
              throw new Error(
                '이 소셜 계정은 현재 로그인한 계정과 바로 연결할 수 없습니다. 같은 이메일 계정으로 다시 확인해 주세요.',
              );
            })()
        : issuedSession;

      await finalizeAuthenticatedSession(nextSession);
      return 'authenticated';
    } catch (error) {
      if (error instanceof ApiClientError && error.code === 'EMAIL_NOT_VERIFIED') {
        setPendingVerification({ email: body.email });
        return 'verification_required';
      }

      if (issuedSession) {
        try {
          await foloApi.logout({ refreshToken: issuedSession.refreshToken });
        } catch {
          // Keep the original linking error as the actionable surface.
        }
        setFoloAccessToken('');
      }

      throw error;
    }
  }

  async function signUp(body: SignupRequest): Promise<PendingVerification> {
    const result = await foloApi.signup(body);
    const nextPending = {
      email: result.email,
      nickname: result.nickname,
    };

    setPendingVerification(nextPending);
    return nextPending;
  }

  async function confirmEmail(body: ConfirmEmailRequest) {
    const nextSession = await foloApi.confirmEmail(body);
    await finalizeAuthenticatedSession(nextSession);
  }

  async function startSocialSignIn(provider: SocialAuthProvider) {
    setPendingVerification(null);
    setPendingSocialAuth(null);
    return foloApi.startSocialAuth(provider, {
      platform: getSocialAuthPlatform(),
    });
  }

  async function exchangeSocialSignIn(
    handoffCode: string,
  ): Promise<SocialSignInResult> {
    const response = await foloApi.exchangeSocialAuth({ handoffCode });

    if (response.status === 'AUTHENTICATED') {
      if (!response.session) {
        throw new Error('소셜 로그인 세션을 확인하지 못했습니다. 다시 시도해 주세요.');
      }

      await finalizeAuthenticatedSession(response.session);
      return 'authenticated';
    }

    setPendingVerification(null);
    setPendingSocialAuth(toPendingSocialAuth(response));

    return response.status === 'PROFILE_SETUP_REQUIRED'
      ? 'profile_setup_required'
      : 'account_link_required';
  }

  async function verifyAppleSignIn(
    body: AppleNativeAuthRequest,
  ): Promise<SocialSignInResult> {
    const response = await foloApi.verifyAppleNativeAuth(body);

    if (response.status === 'AUTHENTICATED') {
      if (!response.session) {
        throw new Error('Apple 로그인 세션을 확인하지 못했습니다. 다시 시도해 주세요.');
      }

      await finalizeAuthenticatedSession(response.session);
      return 'authenticated';
    }

    setPendingVerification(null);
    setPendingSocialAuth(toPendingSocialAuth(response));

    return response.status === 'PROFILE_SETUP_REQUIRED'
      ? 'profile_setup_required'
      : 'account_link_required';
  }

  async function linkPendingSocialAuth() {
    const pendingLink =
      pendingSocialAuth?.status === 'ACCOUNT_LINK_REQUIRED'
        ? pendingSocialAuth
        : null;

    if (!pendingLink) {
      throw new Error('연결을 완료할 소셜 로그인 정보가 없습니다.');
    }

    if (!session) {
      throw new Error('로그인이 필요합니다.');
    }

    if (!canLinkPendingSocialAuth(pendingLink, session)) {
      throw new Error(
        '이 소셜 계정은 현재 로그인한 계정과 이메일이 달라서 프로필 화면에서 바로 연결할 수 없습니다.',
      );
    }

    const nextSession = await foloApi.linkSocialAuth({
      pendingToken: pendingLink.pendingToken,
    });

    await finalizeAuthenticatedSession(nextSession);
  }

  async function completeSocialSignInProfile(body: {
    nickname: string;
    profileImage: string | null;
  }) {
    const pendingProfile =
      pendingSocialAuth?.status === 'PROFILE_SETUP_REQUIRED'
        ? pendingSocialAuth
        : null;

    if (!pendingProfile) {
      throw new Error('완료할 소셜 로그인 정보가 없습니다. 다시 시작해 주세요.');
    }

    const nextSession = await foloApi.completeSocialAuthProfile({
      pendingToken: pendingProfile.pendingToken,
      nickname: body.nickname,
      profileImage: body.profileImage,
    });

    await finalizeAuthenticatedSession(nextSession);
  }

  async function resendVerification(email?: string) {
    const targetEmail = email ?? pendingVerification?.email;

    if (!targetEmail) {
      throw new Error('인증 코드를 받을 이메일이 없습니다.');
    }

    await foloApi.verifyEmail({ email: targetEmail });
    setPendingVerification((current) => ({
      email: targetEmail,
      nickname: current?.nickname,
    }));
  }

  async function signOut() {
    const currentRefreshToken = session?.refreshToken;

    try {
      if (currentRefreshToken) {
        await foloApi.logout({ refreshToken: currentRefreshToken });
      }
    } finally {
      await clearSessionStorage();
      setPendingVerification(null);
      setPendingSocialAuth(null);
      setSession(null);
      setStatus('signed_out');
    }
  }

  return (
    <AuthContext.Provider
      value={{
        status,
        session,
        pendingVerification,
        pendingSocialAuth,
        signIn,
        signUp,
        startSocialSignIn,
        verifyAppleSignIn,
        exchangeSocialSignIn,
        linkPendingSocialAuth,
        completeSocialSignInProfile,
        confirmEmail,
        resendVerification,
        signOut,
        clearPendingVerification: () => setPendingVerification(null),
        clearPendingSocialAuth: () => setPendingSocialAuth(null),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
