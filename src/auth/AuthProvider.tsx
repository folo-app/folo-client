import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import { setFoloAccessToken } from '../api/config';
import { ApiClientError } from '../api/client';
import type {
  AuthResponse,
  ConfirmEmailRequest,
  LoginRequest,
  SignupRequest,
} from '../api/contracts';
import { foloApi } from '../api/services';
import {
  clearGrowthWidgetSnapshotInBackground,
  syncGrowthWidgetSnapshotInBackground,
} from '../features/widgets';

type AuthStatus = 'booting' | 'signed_out' | 'authenticated';
type SignInResult = 'authenticated' | 'verification_required';

type PendingVerification = {
  email: string;
  nickname?: string;
} | null;

type AuthContextValue = {
  status: AuthStatus;
  session: AuthResponse | null;
  pendingVerification: PendingVerification;
  signIn: (body: LoginRequest) => Promise<SignInResult>;
  signUp: (body: SignupRequest) => Promise<PendingVerification>;
  confirmEmail: (body: ConfirmEmailRequest) => Promise<void>;
  resendVerification: (email?: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearPendingVerification: () => void;
};

const SESSION_STORAGE_KEY = '@folo/auth-session';
const MIN_SPLASH_DURATION_MS = 1750;
const inMemoryStorage = new Map<string, string>();

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
    return JSON.parse(raw) as AuthResponse;
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('booting');
  const [session, setSession] = useState<AuthResponse | null>(null);
  const [pendingVerification, setPendingVerification] =
    useState<PendingVerification>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

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
      syncGrowthWidgetSnapshotInBackground();
      return;
    }

    if (status === 'signed_out') {
      clearGrowthWidgetSnapshotInBackground();
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
        syncGrowthWidgetSnapshotInBackground();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [status]);

  async function signIn(body: LoginRequest): Promise<SignInResult> {
    try {
      const nextSession = await foloApi.login(body);
      await persistSession(nextSession);
      setSession(nextSession);
      setPendingVerification(null);
      setStatus('authenticated');
      return 'authenticated';
    } catch (error) {
      if (error instanceof ApiClientError && error.code === 'EMAIL_NOT_VERIFIED') {
        setPendingVerification({ email: body.email });
        return 'verification_required';
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
    await persistSession(nextSession);
    setSession(nextSession);
    setPendingVerification(null);
    setStatus('authenticated');
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
        signIn,
        signUp,
        confirmEmail,
        resendVerification,
        signOut,
        clearPendingVerification: () => setPendingVerification(null),
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
