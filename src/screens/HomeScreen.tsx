import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '../components/Avatar';
import {
  AllocationBar,
} from '../components/portfolio-visuals';
import { DataStatusCard } from '../components/DataStatusCard';
import {
  MetricBadge,
  MetricGrid,
  Page,
  PrimaryButton,
  SectionHeading,
  SurfaceCard,
} from '../components/ui';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import {
  useFeedData,
  useMyTradesData,
  usePortfolioData,
  useRemindersData,
} from '../hooks/useFoloData';
import {
  formatCurrency,
  formatDateLabel,
  formatPercent,
  formatRelativeDate,
  formatSignedCurrency,
  formatWeight,
  tradeTypeLabel,
} from '../lib/format';
import type { RootStackParamList } from '../navigation/types';
import { tokens } from '../theme/tokens';

export function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isCompact } = useResponsiveLayout();
  const portfolio = usePortfolioData();
  const feed = useFeedData();
  const reminders = useRemindersData();
  const myTrades = useMyTradesData();
  const reminderSummary = reminders.data.reminders[0];
  const allocationPalette = ['#2563EB', '#0F766E', '#7C3AED', '#F59E0B', '#E11D48', '#14B8A6'];
  const topAllocationItems = [...portfolio.data.holdings]
    .sort((left, right) => (right.totalValue ?? 0) - (left.totalValue ?? 0))
    .slice(0, 3)
    .map((holding, index) => ({
      key: `${holding.holdingId}`,
      label: holding.name,
      ratio: holding.weight,
      value: formatCurrency(holding.totalValue, holding.market),
      meta: `${holding.ticker} · ${holding.market}`,
      color: allocationPalette[index % allocationPalette.length],
    }));
  const combinedError =
    portfolio.error ?? reminders.error ?? myTrades.error ?? feed.error;
  const combinedLoading =
    portfolio.loading || reminders.loading || myTrades.loading || feed.loading;
  const latestTrade = myTrades.data.trades[0];
  const portfolioReady = portfolio.data.holdings.length > 0;
  const hasFeedPreview = feed.data.trades.length > 0;
  const hasReminders = reminders.data.reminders.length > 0;
  const todayAction = resolveTodayAction({
    hasPortfolio: portfolioReady,
    hasReminders,
    hasTrades: myTrades.data.totalCount > 0,
    reminderSummary,
    latestTrade,
    openReminders: () => navigation.navigate('Reminders'),
    openNotifications: () => navigation.navigate('Notifications'),
    openFeed: () => navigation.navigate('MainTabs', { screen: 'Feed' }),
    openPortfolio: () => navigation.navigate('MainTabs', { screen: 'Portfolio' }),
  });
  const quickActions = [
    {
      key: 'notifications',
      icon: 'notifications-outline' as const,
      label: '알림',
      onPress: () => navigation.navigate('Notifications'),
    },
    {
      key: 'reminders',
      icon: 'repeat-outline' as const,
      label: '루틴',
      onPress: () => navigation.navigate('Reminders'),
    },
    {
      key: 'people',
      icon: 'people-outline' as const,
      label: '사람 찾기',
      onPress: () => navigation.navigate('People'),
    },
  ];

  return (
    <Page
      eyebrow="Today"
      title="오늘의 투자 현황"
      subtitle="오늘 확인할 투자 상태와 다음 행동을 빠르게 정리합니다."
    >
      <DataStatusCard error={combinedError} loading={combinedLoading} />

      <SurfaceCard tone="hero">
        <View style={styles.summaryHeader}>
          <View style={styles.summaryBlock}>
            <Text style={styles.summaryLabel}>총 평가금액</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(portfolio.data.totalValue)}
            </Text>
            <Text
              style={[
                styles.summarySubValue,
                (portfolio.data.totalReturn ?? 0) < 0 && styles.summarySubValueNegative,
              ]}
            >
              {formatSignedCurrency(portfolio.data.totalReturn)}
            </Text>
          </View>
          <View style={styles.summaryMetaBlock}>
            <View style={styles.summaryMetaRow}>
              <Ionicons color={tokens.colors.brandStrong} name="time-outline" size={16} />
              <Text style={styles.summaryMeta}>
                {portfolio.data.syncedAt
                  ? `최근 반영 ${formatDateLabel(portfolio.data.syncedAt)}`
                  : '아직 반영된 자산 데이터가 없습니다.'}
              </Text>
            </View>
            <View style={styles.summaryMetaRow}>
              <Ionicons color={tokens.colors.teal} name="repeat-outline" size={16} />
              <Text style={styles.summaryMeta}>
                {reminderSummary
                  ? `${reminderSummary.ticker} · 매월 ${reminderSummary.dayOfMonth}일 루틴`
                  : '등록된 투자 루틴이 없습니다.'}
              </Text>
            </View>
          </View>
        </View>
        <MetricGrid>
          {isCompact ? (
            <View style={styles.summaryMetricGrid}>
              <View style={styles.summaryMetricCellHalf}>
                <MetricBadge
                  label="총 수익률"
                  value={formatPercent(portfolio.data.totalReturnRate)}
                  tone={portfolio.data.totalReturnRate >= 0 ? 'positive' : 'danger'}
                />
              </View>
              <View style={styles.summaryMetricCellHalf}>
                <MetricBadge
                  label="오늘 등락"
                  value={formatSignedCurrency(portfolio.data.dayReturn)}
                  tone={(portfolio.data.dayReturn ?? 0) >= 0 ? 'brand' : 'danger'}
                />
              </View>
              <View style={styles.summaryMetricCellFull}>
                <MetricBadge label="보유 종목" value={`${portfolio.data.holdings.length}개`} />
              </View>
            </View>
          ) : (
            <>
              <MetricBadge
                label="총 수익률"
                value={formatPercent(portfolio.data.totalReturnRate)}
                tone={portfolio.data.totalReturnRate >= 0 ? 'positive' : 'danger'}
              />
              <MetricBadge
                label="오늘 등락"
                value={formatSignedCurrency(portfolio.data.dayReturn)}
                tone={(portfolio.data.dayReturn ?? 0) >= 0 ? 'brand' : 'danger'}
              />
              <MetricBadge label="보유 종목" value={`${portfolio.data.holdings.length}개`} />
            </>
          )}
        </MetricGrid>
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeading title="오늘 할 일" description={todayAction.title} />
        <Text style={styles.priorityBody}>{todayAction.description}</Text>
        <View style={styles.priorityActions}>
          <PrimaryButton label={todayAction.primaryLabel} onPress={todayAction.primaryAction} />
          {todayAction.secondaryLabel && todayAction.secondaryAction ? (
            <PrimaryButton
              label={todayAction.secondaryLabel}
              onPress={todayAction.secondaryAction}
              variant="secondary"
            />
          ) : null}
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeading title="빠른 실행" />
        <View style={[styles.quickActionGrid, isCompact && styles.quickActionGridCompact]}>
          {quickActions.map((action) => (
            <Pressable
              key={action.key}
              accessibilityRole="button"
              onPress={action.onPress}
              style={({ pressed }) => [styles.quickActionTile, pressed && styles.quickActionTilePressed]}
            >
              <View style={styles.quickActionIconWrap}>
                <Ionicons color={tokens.colors.navy} name={action.icon} size={22} />
              </View>
              <Text style={styles.quickActionLabel}>{action.label}</Text>
            </Pressable>
          ))}
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeading
          title="포트폴리오 미리보기"
          description={
            portfolioReady
              ? `상위 ${topAllocationItems.length}개 종목`
              : '아직 추가된 보유 종목이 없습니다.'
          }
          actionLabel="전체 보기"
          onActionPress={() => navigation.navigate('MainTabs', { screen: 'Portfolio' })}
        />
        {!portfolioReady ? (
          <Text style={styles.emptyText}>
            첫 포트폴리오를 추가하면 보유 종목과 자산 구성이 이곳에 요약됩니다.
          </Text>
        ) : (
          <>
            <AllocationBar items={topAllocationItems} height={14} />
            <View style={styles.previewList}>
              {topAllocationItems.map((item, index) => (
                <View
                  key={item.key}
                  style={[styles.previewRow, index < topAllocationItems.length - 1 && styles.divider]}
                >
                  <View style={styles.previewIdentity}>
                    <View style={[styles.previewDot, { backgroundColor: item.color }]} />
                    <View style={styles.previewText}>
                      <Text style={styles.listTitle}>{item.label}</Text>
                      <Text style={styles.listMeta}>{item.meta}</Text>
                    </View>
                  </View>
                  <View style={styles.previewValueBlock}>
                    <Text style={styles.previewValue}>{item.value}</Text>
                    <Text style={styles.previewRatio}>{formatWeight(item.ratio)}</Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeading
          title="친구 활동 미리보기"
          description={hasFeedPreview ? '최신 공개 거래 2건' : '아직 친구 피드가 비어 있습니다.'}
          actionLabel="피드 보기"
          onActionPress={() => navigation.navigate('MainTabs', { screen: 'Feed' })}
        />
        {!hasFeedPreview ? (
          <Text style={styles.emptyText}>
            아직 친구 피드가 비어 있습니다. 친구를 팔로우하면 최근 거래가 여기에 표시됩니다.
          </Text>
        ) : (
          feed.data.trades.slice(0, 2).map((item, index) => (
            <View
              key={item.tradeId}
              style={[
                styles.friendRow,
                index < Math.min(1, feed.data.trades.length - 1) && styles.divider,
              ]}
            >
              <Pressable
                onPress={() =>
                  navigation.navigate('UserProfile', {
                    userId: item.user.userId,
                    nickname: item.user.nickname,
                  })
                }
                style={styles.friendIdentity}
              >
                <Avatar imageUrl={item.user.profileImage} name={item.user.nickname} size={42} />
                <View style={styles.friendText}>
                  <Text style={styles.friendName}>{item.user.nickname}</Text>
                  <Text style={styles.friendSummary}>
                    {item.ticker} {tradeTypeLabel(item.tradeType)} · {formatSignedCurrency(item.quantity * item.price, item.market)}
                  </Text>
                  <Text style={styles.friendComment} numberOfLines={2}>
                    {item.comment ?? '작성된 코멘트가 없습니다.'}
                  </Text>
                </View>
              </Pressable>
              <Pressable
                onPress={() => navigation.navigate('TradeDetail', { tradeId: item.tradeId })}
              >
                <Text style={styles.friendTime}>{formatRelativeDate(item.tradedAt)}</Text>
              </Pressable>
            </View>
          ))
        )}
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeading
          title="투자 루틴"
          description={
            hasReminders
              ? `총 ${reminders.data.reminders.length}개 루틴`
              : '아직 등록된 투자 루틴이 없습니다.'
          }
          actionLabel="관리"
          onActionPress={() => navigation.navigate('Reminders')}
        />
        {!hasReminders ? (
          <Text style={styles.emptyText}>
            적립식 투자나 반복 매수 루틴을 만들면 다음 할 일이 이곳에 정리됩니다.
          </Text>
        ) : (
          reminders.data.reminders.slice(0, 2).map((item, index) => (
            <View
              key={item.reminderId}
              style={[styles.listRow, index < Math.min(1, reminders.data.reminders.length - 1) && styles.divider]}
            >
              <Text style={styles.listTitle}>
                {item.ticker} · {item.name}
              </Text>
              <Text style={styles.listMeta}>
                매월 {item.dayOfMonth}일 · {formatCurrency(item.amount)}
              </Text>
            </View>
          ))
        )}
      </SurfaceCard>
    </Page>
  );
}

function resolveTodayAction({
  hasPortfolio,
  hasReminders,
  hasTrades,
  reminderSummary,
  latestTrade,
  openReminders,
  openNotifications,
  openFeed,
  openPortfolio,
}: {
  hasPortfolio: boolean;
  hasReminders: boolean;
  hasTrades: boolean;
  reminderSummary?: { ticker: string; dayOfMonth: number } | undefined;
  latestTrade?: { ticker: string; tradedAt: string } | undefined;
  openReminders: () => void;
  openNotifications: () => void;
  openFeed: () => void;
  openPortfolio: () => void;
}) {
  if (!hasPortfolio) {
    return {
      title: '첫 포트폴리오 상태를 확인하세요.',
      description:
        '보유 종목 추가는 하단 + 버튼에서 진행하고, 이 화면에서는 오늘 필요한 흐름만 빠르게 확인합니다.',
      primaryLabel: '포트폴리오 보기',
      primaryAction: openPortfolio,
      secondaryLabel: '알림 보기',
      secondaryAction: openNotifications,
    };
  }

  if (hasReminders && reminderSummary) {
    return {
      title: `${reminderSummary.ticker} 루틴을 확인하세요.`,
      description: `다음 반복 일정은 매월 ${reminderSummary.dayOfMonth}일입니다. 오늘 투자 루틴을 점검하고 필요하면 금액을 조정하세요.`,
      primaryLabel: '리마인더 보기',
      primaryAction: openReminders,
      secondaryLabel: '포트폴리오 보기',
      secondaryAction: openPortfolio,
    };
  }

  if (!hasTrades) {
    return {
      title: '첫 거래 흐름을 준비하세요.',
      description:
        '새 거래 입력은 하단 + 버튼에서 진행하고, 이 화면에서는 피드와 포트폴리오 흐름만 빠르게 점검합니다.',
      primaryLabel: '포트폴리오 보기',
      primaryAction: openPortfolio,
      secondaryLabel: '피드 보기',
      secondaryAction: openFeed,
    };
  }

  return {
    title: latestTrade ? `${latestTrade.ticker} 이후 흐름을 확인하세요.` : '오늘 시장 흐름을 확인하세요.',
    description: latestTrade
      ? `최근 거래는 ${formatRelativeDate(latestTrade.tradedAt)} 기록되었습니다. 친구들의 반응과 내 포트폴리오 변화를 함께 확인해 보세요.`
      : '친구 피드와 내 포트폴리오를 함께 보며 오늘 흐름을 빠르게 확인하세요.',
    primaryLabel: '피드 보기',
    primaryAction: openFeed,
    secondaryLabel: '포트폴리오 보기',
    secondaryAction: openPortfolio,
  };
}

const styles = StyleSheet.create({
  summaryHeader: {
    gap: 16,
  },
  summaryBlock: {
    gap: 8,
  },
  summaryLabel: {
    fontSize: 13,
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.body,
  },
  summaryValue: {
    fontSize: 34,
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontWeight: '800',
  },
  summarySubValue: {
    fontSize: 15,
    color: tokens.colors.positive,
    fontFamily: tokens.typography.heading,
    fontWeight: '700',
  },
  summarySubValueNegative: {
    color: tokens.colors.danger,
  },
  summaryMetaBlock: {
    gap: 8,
  },
  summaryMetaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  summaryMeta: {
    fontSize: 13,
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.body,
    flex: 1,
  },
  priorityBody: {
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.body,
    fontSize: 14,
    lineHeight: 22,
  },
  priorityActions: {
    gap: 10,
  },
  quickActionGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionGridCompact: {
    flexDirection: 'column',
  },
  quickActionTile: {
    flex: 1,
    minHeight: 104,
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(214, 224, 234, 0.84)',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 16,
  },
  quickActionTilePressed: {
    opacity: 0.88,
  },
  quickActionIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: tokens.colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionLabel: {
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontSize: 15,
    fontWeight: '700',
  },
  summaryMetricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    width: '100%',
  },
  summaryMetricCellHalf: {
    minWidth: 0,
    width: '48%',
  },
  summaryMetricCellFull: {
    minWidth: 0,
    width: '100%',
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(214, 224, 234, 0.8)',
    paddingBottom: 16,
    marginBottom: 16,
  },
  listRow: {
    gap: 6,
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
  friendRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 14,
  },
  friendIdentity: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  friendText: {
    flex: 1,
    gap: 4,
  },
  friendName: {
    fontSize: 15,
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontWeight: '700',
  },
  friendSummary: {
    fontSize: 13,
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.body,
  },
  friendComment: {
    fontSize: 13,
    lineHeight: 20,
    color: tokens.colors.inkMute,
    fontFamily: tokens.typography.body,
  },
  friendTime: {
    fontSize: 12,
    color: tokens.colors.inkMute,
    fontFamily: tokens.typography.body,
  },
  previewList: {
    gap: 0,
  },
  previewRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  previewIdentity: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 10,
    minWidth: 0,
  },
  previewDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
  previewText: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  previewValueBlock: {
    alignItems: 'flex-end',
    gap: 4,
  },
  previewValue: {
    fontSize: 13,
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontWeight: '700',
  },
  previewRatio: {
    fontSize: 12,
    color: tokens.colors.inkMute,
    fontFamily: tokens.typography.body,
  },
});
