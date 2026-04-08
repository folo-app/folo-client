import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { StyleSheet, Text, View } from 'react-native';

import { useAuth } from '../auth/AuthProvider';
import { Avatar } from '../components/Avatar';
import { DataStatusCard } from '../components/DataStatusCard';
import {
  Chip,
  DetailRow,
  Page,
  PageBackButton,
  PrimaryButton,
  SectionHeading,
  SurfaceCard,
} from '../components/ui';
import {
  useUserFeedData,
  useUserPortfolioData,
  useUserProfileData,
} from '../hooks/useFoloData';
import { useMutation } from '../hooks/query';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import {
  currencyLabel,
  formatCurrency,
  formatPercent,
  formatRelativeDate,
  tradeTypeLabel,
  visibilityLabel,
} from '../lib/format';
import type { RootStackParamList } from '../navigation/types';
import { foloApi } from '../api/services';
import { tokens } from '../theme/tokens';

export function UserProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'UserProfile'>>();
  const { session } = useAuth();
  const { isCompact } = useResponsiveLayout();
  const profile = useUserProfileData(route.params.userId);
  const portfolio = useUserPortfolioData(route.params.userId, profile.data.isAccessible);
  const feed = useUserFeedData(route.params.userId);
  const followMutation = useMutation({
    mutationFn: async (variables: { userId: number; isFollowing: boolean }) => {
      if (variables.isFollowing) {
        await foloApi.unfollowUser(variables.userId);
      } else {
        await foloApi.followUser(variables.userId);
      }
    },
  });

  async function handleToggleFollow() {
    if (profile.data.userId === 0 || profile.data.userId === session?.userId) {
      return;
    }

    try {
      await followMutation.mutate({
        userId: profile.data.userId,
        isFollowing: profile.data.isFollowing,
      });
      profile.refresh();
      portfolio.refresh();
      feed.refresh();
    } catch {}
  }

  const isSelf = profile.data.userId === session?.userId;
  const combinedError =
    profile.error ?? portfolio.error ?? feed.error ?? followMutation.error;
  const combinedLoading =
    profile.loading || portfolio.loading || feed.loading || followMutation.pending;

  return (
    <Page
      eyebrow="Profile"
      title={profile.data.nickname ? `${profile.data.nickname} 프로필` : '사용자 프로필'}
      leading={<PageBackButton />}
    >
      <DataStatusCard error={combinedError} loading={combinedLoading} />

      {profile.data.userId > 0 ? (
        <>
          <SurfaceCard tone="hero">
            <View style={[styles.header, isCompact && styles.headerCompact]}>
              <Avatar
                backgroundColor={tokens.colors.navy}
                imageUrl={profile.data.profileImage}
                name={profile.data.nickname}
                size={72}
              />
              <View style={styles.headerText}>
                <Text style={styles.name}>{profile.data.nickname}</Text>
                <Text style={styles.bio}>{profile.data.bio ?? '등록된 소개가 없습니다.'}</Text>
              </View>
            </View>
            <View style={styles.metaRow}>
              <Chip active label={`팔로워 ${profile.data.followerCount}`} tone="brand" />
              <Chip label={`팔로잉 ${profile.data.followingCount}`} />
              <Chip label={visibilityLabel(profile.data.portfolioVisibility)} />
            </View>
            {!isSelf ? (
              <PrimaryButton
                label={
                  followMutation.pending
                    ? '처리 중...'
                    : profile.data.isFollowing
                      ? '언팔로우'
                      : '팔로우'
                }
                onPress={handleToggleFollow}
                variant={profile.data.isFollowing ? 'secondary' : 'primary'}
                disabled={followMutation.pending}
              />
            ) : (
              <PrimaryButton
                label="내 프로필로 이동"
                onPress={() => navigation.navigate('MainTabs', { screen: 'Profile' })}
                variant="secondary"
              />
            )}
          </SurfaceCard>

          <SurfaceCard>
            <SectionHeading title="포트폴리오 접근" />
            <DetailRow
              label="현재 상태"
              value={profile.data.isAccessible ? '열람 가능' : '열람 제한'}
            />
            <Text style={styles.statusText}>
              {profile.data.isAccessible
                ? '공개 가능한 자산 요약과 보유 종목 미리보기를 아래에서 확인할 수 있습니다.'
                : '지금은 공개 범위 때문에 포트폴리오를 열 수 없습니다. 친구 공개 계정은 상호 팔로우가 되어야 접근 가능합니다.'}
            </Text>
          </SurfaceCard>

          {profile.data.isAccessible ? (
            <SurfaceCard>
              <SectionHeading
                title="공개 포트폴리오 미리보기"
                description={`보유 ${portfolio.data.holdings.length}개 종목`}
              />
              <View style={styles.metricPreviewRow}>
                <Chip
                  active
                  label={`총 수익률 ${formatPercent(portfolio.data.totalReturnRate)}`}
                  tone="positive"
                />
                <Chip
                  label={`평가금액 ${formatCurrency(
                    portfolio.data.totalValue,
                    portfolio.data.displayCurrency,
                  )}`}
                  tone="brand"
                />
              </View>
              {portfolio.data.holdings.length === 0 ? (
                <Text style={styles.emptyText}>공개 가능한 보유 종목이 없습니다.</Text>
              ) : (
                portfolio.data.holdings.slice(0, 3).map((holding, index) => (
                  <View
                    key={holding.holdingId}
                    style={[
                      styles.row,
                      index < Math.min(2, portfolio.data.holdings.length - 1) && styles.divider,
                    ]}
                  >
                    <Text style={styles.rowTitle}>
                      {holding.ticker} · {holding.name}
                    </Text>
                    <Text style={styles.rowMeta}>
                      {formatPercent(holding.returnRate)} ·{' '}
                      {formatCurrency(
                        holding.displayTotalValue ?? holding.totalValue,
                        portfolio.data.displayCurrency,
                      )}
                    </Text>
                  </View>
                ))
              )}
              <Text style={styles.statusText}>
                기준 통화 {currencyLabel(portfolio.data.displayCurrency)}
                {portfolio.data.fxStale ? ' · 환율 갱신 필요' : ''}
              </Text>
              <PrimaryButton
                label="공개 포트폴리오 전체 보기"
                onPress={() =>
                  navigation.navigate('PublicPortfolio', {
                    userId: route.params.userId,
                    nickname: profile.data.nickname,
                  })
                }
                variant="secondary"
              />
            </SurfaceCard>
          ) : null}

          <SurfaceCard>
            <SectionHeading
              title="최근 거래 미리보기"
              description={`현재 ${feed.data.trades.length}건`}
            />
            {feed.data.trades.length === 0 ? (
              <Text style={styles.emptyText}>표시할 공개 거래가 없습니다.</Text>
            ) : (
              feed.data.trades.slice(0, 3).map((trade, index) => (
                <View
                  key={trade.tradeId}
                  style={[
                    styles.row,
                    index < Math.min(2, feed.data.trades.length - 1) && styles.divider,
                  ]}
                >
                  <Text style={styles.rowTitle}>
                    {trade.ticker} · {tradeTypeLabel(trade.tradeType)}
                  </Text>
                  <Text style={styles.rowMeta}>
                    {formatCurrency(trade.quantity * trade.price, trade.market)} ·{' '}
                    {formatRelativeDate(trade.tradedAt)}
                  </Text>
                </View>
              ))
            )}
            <PrimaryButton
              label="개인 피드 전체 보기"
              onPress={() =>
                navigation.navigate('UserFeed', {
                  userId: route.params.userId,
                  nickname: profile.data.nickname,
                })
              }
              variant="secondary"
            />
          </SurfaceCard>
        </>
      ) : !profile.loading ? (
        <SurfaceCard>
          <Text style={styles.emptyText}>사용자 정보를 찾을 수 없습니다.</Text>
        </SurfaceCard>
      ) : null}
    </Page>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  headerCompact: {
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  headerText: {
    gap: 6,
    flex: 1,
  },
  name: {
    fontSize: 24,
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontWeight: '800',
  },
  bio: {
    fontSize: 14,
    lineHeight: 22,
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.body,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statusText: {
    fontSize: 14,
    lineHeight: 22,
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.body,
  },
  metricPreviewRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  row: {
    gap: 6,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(214, 224, 234, 0.8)',
    paddingBottom: 16,
    marginBottom: 16,
  },
  rowTitle: {
    fontSize: 15,
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontWeight: '700',
  },
  rowMeta: {
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
