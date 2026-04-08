import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useEffect, useRef, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import type {
  AuthProvider,
  AuthResponse,
  SocialAuthProvider,
} from '../api/contracts';
import { useAuth } from '../auth/AuthProvider';
import {
  AUTH_PROVIDER_LABELS,
  SOCIAL_AUTH_PROVIDER_DESCRIPTIONS,
  getSocialAuthProvidersForPlatform,
  parseSocialAuthHandoffCode,
} from '../auth/socialAuth';
import { Avatar } from '../components/Avatar';
import { DataStatusCard } from '../components/DataStatusCard';
import {
  Chip,
  DetailRow,
  Page,
  PrimaryButton,
  SectionHeading,
  SurfaceCard,
} from '../components/ui';
import {
  useMyProfileData,
  useMyTradesData,
  useNotificationsData,
  useRemindersData,
} from '../hooks/useFoloData';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import {
  currencyLabel,
  formatCurrency,
  formatNumber,
  formatRelativeDate,
  notificationLabel,
  tradeTypeLabel,
  visibilityLabel,
} from '../lib/format';
import { shareProfile } from '../lib/profileShare';
import type { MainTabParamList, RootStackParamList } from '../navigation/types';
import { tokens } from '../theme/tokens';

type ProviderNoticeTone = 'default' | 'positive' | 'danger';
type ProviderNotice = {
  tone: ProviderNoticeTone;
  text: string;
} | null;
type SocialLinkPhase = 'idle' | 'starting' | 'exchanging' | 'linking';

function getCurrentLoginSummary(session: AuthResponse | null) {
  if (!session) {
    return {
      title: '로그인 세션을 확인하는 중입니다.',
      subtitle: '현재 계정 정보를 다시 불러오면 로그인 방식을 표시합니다.',
    };
  }

  if (session.authProvider === 'EMAIL') {
    return {
      title: '이메일과 비밀번호로 로그인 중',
      subtitle: session.email
        ? `${session.email} 계정으로 직접 로그인합니다.`
        : '이메일 계정 정보를 다시 확인해 주세요.',
    };
  }

  return {
    title: `${AUTH_PROVIDER_LABELS[session.authProvider]} 계정으로 로그인 중`,
    subtitle: session.email
      ? `${session.email} 이메일이 이 로그인 방식에 연결되어 있습니다.`
      : '이메일 없이 연결된 소셜 계정입니다.',
  };
}

function getProviderStatusLabel(
  provider: SocialAuthProvider,
  sessionProvider: AuthProvider | undefined,
) {
  if (provider === sessionProvider) {
    return '현재 사용 중';
  }

  return '추가 연결';
}

function getProviderActionLabel(
  provider: SocialAuthProvider,
  activeProvider: SocialAuthProvider | null,
  phase: SocialLinkPhase,
  sessionProvider: AuthProvider | undefined,
) {
  if (provider === sessionProvider) {
    return '현재 로그인';
  }

  if (provider !== activeProvider) {
    return '연결하기';
  }

  switch (phase) {
    case 'starting':
      return '연결 시작 중...';
    case 'exchanging':
      return '연결 확인 중...';
    case 'linking':
      return '계정 연결 중...';
    default:
      return '연결하기';
  }
}

function isAppleRequestCanceled(error: unknown) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: string }).code === 'ERR_REQUEST_CANCELED'
  );
}

export function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<MainTabParamList, 'Profile'>>();
  const {
    clearPendingSocialAuth,
    exchangeSocialSignIn,
    linkPendingSocialAuth,
    pendingSocialAuth,
    session,
    signOut,
    startSocialSignIn,
    verifyAppleSignIn,
  } = useAuth();
  const { isCompact } = useResponsiveLayout();
  const profile = useMyProfileData();
  const notifications = useNotificationsData();
  const reminders = useRemindersData();
  const myTrades = useMyTradesData();
  const [logoutPending, setLogoutPending] = useState(false);
  const [providerNotice, setProviderNotice] = useState<ProviderNotice>(null);
  const [socialLinkPhase, setSocialLinkPhase] = useState<SocialLinkPhase>('idle');
  const [activeSocialProvider, setActiveSocialProvider] =
    useState<SocialAuthProvider | null>(null);
  const [autoLinkPending, setAutoLinkPending] = useState(false);
  const [appleAuthAvailable, setAppleAuthAvailable] = useState(false);
  const aliveRef = useRef(true);
  const handledHandoffCodesRef = useRef<Set<string>>(new Set());
  const shareOnOpenTriggeredRef = useRef(false);
  const combinedError =
    profile.error ?? reminders.error ?? notifications.error ?? myTrades.error;
  const combinedLoading =
    profile.loading || reminders.loading || notifications.loading || myTrades.loading;
  const currentLoginSummary = getCurrentLoginSummary(session);
  const socialAuthProviders = getSocialAuthProvidersForPlatform().filter(
    (provider) => provider !== 'APPLE' || appleAuthAvailable,
  );
  const canManagePassword = session?.authProvider === 'EMAIL';

  useEffect(() => {
    aliveRef.current = true;

    return () => {
      aliveRef.current = false;
    };
  }, []);

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

  async function handleLogout() {
    setLogoutPending(true);

    try {
      await signOut();
    } finally {
      setLogoutPending(false);
    }
  }

  async function handleShareProfile() {
    if (profile.data.userId <= 0) {
      return;
    }

    await shareProfile({
      userId: profile.data.userId,
      nickname: profile.data.nickname || session?.nickname || 'Folo 사용자',
    });
  }

  useEffect(() => {
    if (
      !route.params?.qaShareOnOpen ||
      shareOnOpenTriggeredRef.current ||
      profile.data.userId <= 0
    ) {
      return;
    }

    shareOnOpenTriggeredRef.current = true;
    void handleShareProfile();
  }, [profile.data.nickname, profile.data.userId, route.params?.qaShareOnOpen, session?.nickname]);

  useEffect(() => {
    let alive = true;

    async function handleIncomingUrl(url: string) {
      const handoffCode = parseSocialAuthHandoffCode(url);

      if (!handoffCode || handledHandoffCodesRef.current.has(handoffCode)) {
        return;
      }

      handledHandoffCodesRef.current.add(handoffCode);
      setProviderNotice(null);
      setSocialLinkPhase('exchanging');

      try {
        const result = await exchangeSocialSignIn(handoffCode);

        if (!alive || !aliveRef.current) {
          return;
        }

        if (result === 'authenticated') {
          setProviderNotice({
            tone: 'positive',
            text: `${AUTH_PROVIDER_LABELS[activeSocialProvider ?? session?.authProvider ?? 'EMAIL']} 로그인이 확인되었습니다.`,
          });
          setActiveSocialProvider(null);
          setSocialLinkPhase('idle');
          return;
        }

        if (result === 'profile_setup_required') {
          clearPendingSocialAuth();
          setProviderNotice({
            tone: 'default',
            text: '이 제공자는 새 계정 생성 단계가 필요해서 현재 프로필 화면에서는 바로 연결할 수 없습니다.',
          });
          setActiveSocialProvider(null);
          setSocialLinkPhase('idle');
          return;
        }

        setAutoLinkPending(true);
      } catch (error) {
        handledHandoffCodesRef.current.delete(handoffCode);

        if (!alive || !aliveRef.current) {
          return;
        }

        setProviderNotice({
          tone: 'danger',
          text:
            error instanceof Error
              ? error.message
              : '소셜 로그인 연결을 확인하지 못했습니다. 다시 시도해 주세요.',
        });
        setActiveSocialProvider(null);
        setSocialLinkPhase('idle');
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
  }, [activeSocialProvider, clearPendingSocialAuth, exchangeSocialSignIn, session?.authProvider]);

  useEffect(() => {
    if (!autoLinkPending || pendingSocialAuth?.status !== 'ACCOUNT_LINK_REQUIRED') {
      return;
    }

    let alive = true;
    setSocialLinkPhase('linking');

    linkPendingSocialAuth()
      .then(() => {
        if (!alive || !aliveRef.current) {
          return;
        }

        setProviderNotice({
          tone: 'positive',
          text: `${AUTH_PROVIDER_LABELS[pendingSocialAuth.provider]} 로그인이 현재 계정에 연결되었습니다.`,
        });
      })
      .catch((error) => {
        if (!alive || !aliveRef.current) {
          return;
        }

        setProviderNotice({
          tone: 'danger',
          text:
            error instanceof Error
              ? error.message
              : '소셜 로그인 연결을 완료하지 못했습니다.',
        });
      })
      .finally(() => {
        if (!alive || !aliveRef.current) {
          return;
        }

        clearPendingSocialAuth();
        setAutoLinkPending(false);
        setActiveSocialProvider(null);
        setSocialLinkPhase('idle');
      });

    return () => {
      alive = false;
    };
  }, [
    autoLinkPending,
    clearPendingSocialAuth,
    linkPendingSocialAuth,
    pendingSocialAuth,
  ]);

  async function handleConnectProvider(provider: SocialAuthProvider) {
    if (provider === session?.authProvider) {
      return;
    }

    setProviderNotice(null);
    setActiveSocialProvider(provider);
    setSocialLinkPhase('starting');

    try {
      if (provider === 'APPLE') {
        const stateToken = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const nonce = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
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

        const result = await verifyAppleSignIn({
          identityToken: credential.identityToken,
          userIdentifier: credential.user,
          email: credential.email,
          givenName: credential.fullName?.givenName ?? null,
          familyName: credential.fullName?.familyName ?? null,
          nonce,
        });

        if (!aliveRef.current) {
          return;
        }

        if (result === 'authenticated') {
          setProviderNotice({
            tone: 'positive',
            text: `${AUTH_PROVIDER_LABELS[provider]} 로그인이 확인되었습니다.`,
          });
          setActiveSocialProvider(null);
          setSocialLinkPhase('idle');
          return;
        }

        if (result === 'profile_setup_required') {
          clearPendingSocialAuth();
          setProviderNotice({
            tone: 'default',
            text: 'Apple은 새 계정 생성 단계가 남아 있어 현재 프로필 화면에서는 바로 연결할 수 없습니다.',
          });
          setActiveSocialProvider(null);
          setSocialLinkPhase('idle');
          return;
        }

        setAutoLinkPending(true);
        return;
      }

      const result = await startSocialSignIn(provider);
      await Linking.openURL(result.authorizationUrl);
    } catch (error) {
      if (!aliveRef.current) {
        return;
      }

      if (provider === 'APPLE' && isAppleRequestCanceled(error)) {
        setActiveSocialProvider(null);
        setSocialLinkPhase('idle');
        return;
      }

      setProviderNotice({
        tone: 'danger',
        text:
          error instanceof Error
            ? error.message
            : '소셜 로그인 연결을 시작하지 못했습니다. 다시 시도해 주세요.',
      });
      setActiveSocialProvider(null);
      setSocialLinkPhase('idle');
    } finally {
      if (aliveRef.current && provider !== 'APPLE') {
        setSocialLinkPhase('idle');
      }
    }
  }

  return (
    <Page eyebrow="Profile" title="내 기록과 공개 범위">
      <DataStatusCard error={combinedError} loading={combinedLoading} variant="inline" />

      <SurfaceCard tone="hero">
        <View style={[styles.profileHeader, isCompact && styles.profileHeaderCompact]}>
          <Avatar
            backgroundColor={tokens.colors.navy}
            imageUrl={profile.data.profileImage}
            name={profile.data.nickname || session?.nickname || '?'}
            size={72}
          />
          <View style={styles.profileText}>
            <Text style={styles.name}>
              {profile.data.nickname || session?.nickname || '내 계정'}
            </Text>
            {session?.email ? (
              <Text ellipsizeMode="middle" numberOfLines={1} style={styles.handle}>
                {session.email}
              </Text>
            ) : null}
            <Text style={styles.joinedAt}>
              가입일 {formatRelativeDate(profile.data.createdAt)}
            </Text>
            <Text style={styles.bio}>{profile.data.bio ?? '바이오가 아직 없습니다.'}</Text>
          </View>
        </View>
        <View style={styles.metaRow}>
          <Chip active label={`팔로워 ${profile.data.followerCount}`} tone="brand" />
          <Chip label={`팔로잉 ${profile.data.followingCount}`} />
          <Chip label={`기록 ${myTrades.data.totalCount}`} />
          <Chip label={visibilityLabel(profile.data.portfolioVisibility)} />
        </View>
        <View style={styles.profileActions}>
          <PrimaryButton
            label="프로필 공유"
            onPress={() => {
              void handleShareProfile();
            }}
          />
          <PrimaryButton
            label="프로필 편집"
            onPress={() => navigation.navigate('ProfileEdit')}
            variant="secondary"
          />
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeading
          title="로그인 방식"
          description="현재 로그인 수단을 확인하고 추가 소셜 로그인을 연결합니다."
        />
        <View style={styles.providerSummaryCard}>
          <View style={styles.providerSummaryHeader}>
            <View style={styles.providerIdentity}>
              <View style={styles.providerBadge}>
                <Text style={styles.providerBadgeLabel}>
                  {AUTH_PROVIDER_LABELS[session?.authProvider ?? 'EMAIL']}
                </Text>
              </View>
              <View style={styles.providerCopy}>
                <Text style={styles.providerTitle}>{currentLoginSummary.title}</Text>
                <Text style={styles.providerDescription}>
                  {currentLoginSummary.subtitle}
                </Text>
              </View>
            </View>
            <Chip active label="현재 사용 중" tone="brand" />
          </View>
          <View style={styles.providerMetaStack}>
            <DetailRow
              label="세션 기준 로그인"
              value={AUTH_PROVIDER_LABELS[session?.authProvider ?? 'EMAIL']}
            />
            <DetailRow
              label="계정 이메일"
              value={session?.email ?? '이메일 없이 연결된 계정'}
            />
          </View>
        </View>

        {providerNotice ? (
          <View
            style={[
              styles.providerNotice,
              providerNotice.tone === 'positive' && styles.providerNoticePositive,
              providerNotice.tone === 'danger' && styles.providerNoticeDanger,
            ]}
          >
            <Text style={styles.providerNoticeText}>{providerNotice.text}</Text>
          </View>
        ) : null}

        <View style={styles.providerList}>
          {socialAuthProviders.map((provider) => (
            <View key={provider} style={styles.providerRow}>
              <View style={styles.providerRowCopy}>
                <View style={styles.providerRowTitleLine}>
                  <Text style={styles.providerRowTitle}>
                    {AUTH_PROVIDER_LABELS[provider]}
                  </Text>
                  <Chip
                    active={provider === session?.authProvider}
                    label={getProviderStatusLabel(provider, session?.authProvider)}
                    tone={provider === session?.authProvider ? 'positive' : 'default'}
                  />
                </View>
                <Text style={styles.providerRowDescription}>
                  {SOCIAL_AUTH_PROVIDER_DESCRIPTIONS[provider]}
                </Text>
              </View>
              <View style={styles.providerRowAction}>
                <PrimaryButton
                  disabled={
                    socialLinkPhase !== 'idle' || provider === session?.authProvider
                  }
                  label={getProviderActionLabel(
                    provider,
                    activeSocialProvider,
                    socialLinkPhase,
                    session?.authProvider,
                  )}
                  onPress={() => {
                    void handleConnectProvider(provider);
                  }}
                  variant="secondary"
                />
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.providerFootnote}>
          현재는 계정 연결 해제 UI가 준비되지 않았습니다. 연결된 제공자 목록과 해제는
          후속 서버 조회 API와 함께 이어집니다.
        </Text>
      </SurfaceCard>

      {canManagePassword ? (
        <SurfaceCard>
          <SectionHeading
            title="계정 보안"
            description="이메일 로그인 계정만 비밀번호 변경과 기본 보안 점검을 관리합니다."
          />
          <DetailRow label="로그인 보호 방식" value="이메일 + 비밀번호" />
          <DetailRow
            label="보안 확인 이메일"
            value={session?.email ?? '등록된 이메일을 확인해 주세요.'}
          />
          <Text style={styles.securityHint}>
            현재 비밀번호를 확인한 뒤 새 비밀번호로 바꿀 수 있습니다. 비밀번호 변경 UI는 프로필 편집 화면에서 이어집니다.
          </Text>
          <View style={styles.actionStack}>
            <PrimaryButton
              label="비밀번호 변경"
              onPress={() => navigation.navigate('ProfileEdit')}
              variant="secondary"
            />
          </View>
        </SurfaceCard>
      ) : null}

      <SurfaceCard>
        <SectionHeading
          title="공개 범위와 연결"
          description="내 프로필이 어떻게 보이고 있는지 빠르게 확인합니다."
        />
        <DetailRow
          label="포트폴리오 공개 범위"
          value={visibilityLabel(profile.data.portfolioVisibility)}
        />
        <DetailRow
          label="수익 공개 범위"
          value={visibilityLabel(profile.data.returnVisibility)}
        />
        <DetailRow
          label="평가 기준 통화"
          value={currencyLabel(profile.data.displayCurrency)}
        />
        <DetailRow label="알림 미확인 수" value={`${notifications.data.unreadCount}개`} />
        <DetailRow label="활성 리마인더" value={`${reminders.data.reminders.length}개`} />
        <View style={styles.actionStack}>
          <PrimaryButton
            label="사람 찾기"
            onPress={() => navigation.navigate('People')}
            variant="secondary"
          />
          <PrimaryButton
            label="KIS 연결"
            onPress={() => navigation.navigate('KisConnect')}
            variant="secondary"
          />
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeading title="내 최근 거래" description={`총 ${myTrades.data.totalCount}건`} />
        {myTrades.data.trades.length === 0 ? (
          <Text style={styles.emptyText}>아직 등록된 거래가 없습니다.</Text>
        ) : (
          myTrades.data.trades.slice(0, 3).map((trade, index) => (
            <Pressable
              key={trade.tradeId}
              onPress={() => navigation.navigate('TradeDetail', { tradeId: trade.tradeId })}
              style={[
                styles.listRow,
                index < Math.min(2, myTrades.data.trades.length - 1) && styles.divider,
              ]}
            >
              <Text style={styles.listTitle}>
                {trade.ticker} · {tradeTypeLabel(trade.tradeType)}
              </Text>
              <Text style={styles.listMeta}>
                {formatNumber(trade.totalAmount)} · {formatRelativeDate(trade.tradedAt)}
              </Text>
            </Pressable>
          ))
        )}
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeading title="리마인더" />
        {reminders.data.reminders.length === 0 ? (
          <Text style={styles.emptyText}>등록된 리마인더가 없습니다.</Text>
        ) : (
          reminders.data.reminders.slice(0, 2).map((reminder, index) => (
            <View
              key={reminder.reminderId}
              style={[
                styles.listRow,
                index < Math.min(1, reminders.data.reminders.length - 1) && styles.divider,
              ]}
            >
              <Text style={styles.listTitle}>
                {reminder.ticker} · {reminder.name}
              </Text>
              <Text style={styles.listMeta}>
                매월 {reminder.dayOfMonth}일 · {formatCurrency(reminder.amount)}
              </Text>
            </View>
          ))
        )}
        <PrimaryButton
          label="리마인더 전체 보기"
          onPress={() => navigation.navigate('Reminders')}
          variant="secondary"
        />
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeading title="알림" />
        {notifications.data.notifications.length === 0 ? (
          <Text style={styles.emptyText}>표시할 알림이 없습니다.</Text>
        ) : (
          notifications.data.notifications.slice(0, 2).map((item, index) => (
            <View
              key={item.notificationId}
              style={[
                styles.listRow,
                index < Math.min(1, notifications.data.notifications.length - 1) &&
                  styles.divider,
              ]}
            >
              <Text style={styles.listTitle}>
                {notificationLabel(item.type)} · {item.message}
              </Text>
              <Text style={styles.listMeta}>{formatRelativeDate(item.createdAt)}</Text>
            </View>
          ))
        )}
        <PrimaryButton
          label="알림 전체 보기"
          onPress={() => navigation.navigate('Notifications')}
          variant="secondary"
        />
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeading
          title="계정 관리"
          description="세션과 연결 상태를 마지막에 정리합니다."
        />
        <PrimaryButton
          disabled={logoutPending}
          label={logoutPending ? '로그아웃 중...' : '로그아웃'}
          onPress={handleLogout}
          variant="secondary"
        />
      </SurfaceCard>
    </Page>
  );
}

const styles = StyleSheet.create({
  profileHeader: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  profileHeaderCompact: {
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  profileText: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 24,
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontWeight: '800',
  },
  handle: {
    fontSize: 13,
    color: tokens.colors.brandStrong,
    fontFamily: tokens.typography.body,
  },
  joinedAt: {
    fontSize: 13,
    color: tokens.colors.inkMute,
    fontFamily: tokens.typography.body,
  },
  bio: {
    fontSize: 14,
    lineHeight: 22,
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.body,
  },
  profileActions: {
    gap: 10,
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  actionStack: {
    gap: 10,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  providerSummaryCard: {
    gap: 14,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.14)',
    backgroundColor: tokens.colors.brandSoft,
    padding: 16,
  },
  providerSummaryHeader: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  providerIdentity: {
    flex: 1,
    minWidth: 220,
    gap: 12,
  },
  providerBadge: {
    alignSelf: 'flex-start',
    borderRadius: tokens.radius.pill,
    backgroundColor: tokens.colors.navy,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  providerBadgeLabel: {
    color: tokens.colors.surface,
    fontSize: 12,
    fontFamily: tokens.typography.heading,
    fontWeight: '800',
  },
  providerCopy: {
    gap: 6,
  },
  providerTitle: {
    fontSize: 18,
    lineHeight: 24,
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontWeight: '800',
  },
  providerDescription: {
    fontSize: 13,
    lineHeight: 20,
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.body,
  },
  providerMetaStack: {
    gap: 4,
  },
  providerNotice: {
    borderRadius: tokens.radius.sm,
    backgroundColor: tokens.colors.surfaceMuted,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  providerNoticePositive: {
    backgroundColor: tokens.colors.positiveSoft,
  },
  providerNoticeDanger: {
    backgroundColor: tokens.colors.dangerSoft,
  },
  providerNoticeText: {
    color: tokens.colors.navy,
    fontSize: 13,
    lineHeight: 20,
    fontFamily: tokens.typography.body,
  },
  providerList: {
    gap: 12,
  },
  providerRow: {
    gap: 12,
    borderRadius: tokens.radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(214, 224, 234, 0.9)',
    backgroundColor: tokens.colors.surface,
    padding: 14,
  },
  providerRowCopy: {
    gap: 8,
  },
  providerRowTitleLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    flexWrap: 'wrap',
  },
  providerRowTitle: {
    fontSize: 15,
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontWeight: '700',
  },
  providerRowDescription: {
    color: tokens.colors.inkSoft,
    fontSize: 13,
    lineHeight: 20,
    fontFamily: tokens.typography.body,
  },
  providerRowAction: {
    alignItems: 'flex-start',
  },
  providerFootnote: {
    color: tokens.colors.inkMute,
    fontSize: 12,
    lineHeight: 18,
    fontFamily: tokens.typography.body,
  },
  securityHint: {
    color: tokens.colors.inkSoft,
    fontSize: 13,
    lineHeight: 20,
    fontFamily: tokens.typography.body,
  },
  listRow: {
    gap: 6,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(214, 224, 234, 0.8)',
    paddingBottom: 16,
    marginBottom: 16,
  },
  listTitle: {
    fontSize: 15,
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontWeight: '700',
  },
  listMeta: {
    fontSize: 13,
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.body,
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 22,
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.body,
  },
});
