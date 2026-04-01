import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { FeedTradeItem } from '../api/contracts';
import {
  AllocationBar,
} from '../components/portfolio-visuals';
import { DataStatusCard } from '../components/DataStatusCard';
import {
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
} from '../lib/format';
import type { RootStackParamList } from '../navigation/types';
import { tokens } from '../theme/tokens';

type HomeDestinationKey =
  | 'notifications'
  | 'reminders'
  | 'people'
  | 'feed'
  | 'portfolio';

export function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isCompact, isNarrow } = useResponsiveLayout();
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
  const latestTrade = myTrades.data.trades[0];
  const portfolioReady = portfolio.data.holdings.length > 0;
  const hasFeedPreview = feed.data.trades.length > 0;
  const hasReminders = reminders.data.reminders.length > 0;
  const portfolioUnavailable = !portfolioReady && portfolio.error !== null;
  const feedPreviewUnavailable = !hasFeedPreview && feed.error !== null;
  const remindersUnavailable = !hasReminders && reminders.error !== null;
  const tradesUnavailable = myTrades.data.totalCount === 0 && myTrades.error !== null;
  const showHeroPlaceholderValues = !portfolioReady && (portfolio.loading || portfolio.error !== null);
  const summaryTotalValue = showHeroPlaceholderValues
    ? '-'
    : formatCurrency(portfolio.data.totalValue);
  const summaryDayReturn = showHeroPlaceholderValues
    ? '-'
    : formatSignedCurrency(portfolio.data.dayReturn);
  const summaryReturnRate = showHeroPlaceholderValues
    ? '-'
    : formatPercent(portfolio.data.totalReturnRate);
  const heroState = resolveHomeHeroState({
    hasPortfolio: portfolioReady,
    hasFeedPreview,
    hasPortfolioError: portfolioUnavailable,
    dayReturn: portfolio.data.dayReturn,
    reminderSummary,
  });
  const portfolioPreviewInsight = resolvePortfolioPreviewInsight({
    hasPortfolio: portfolioReady,
    topHolding: topAllocationItems[0],
    secondHolding: topAllocationItems[1],
    holdingCount: portfolio.data.holdings.length,
    cashWeight: portfolio.data.cashWeight,
  });
  const friendActivityPreview = resolveFriendActivityPreview(feed.data.trades);
  const todayAction = resolveTodayAction({
    hasPortfolio: portfolioReady,
    hasPortfolioError: portfolioUnavailable,
    hasReminders,
    hasTrades: myTrades.data.totalCount > 0,
    hasTradeError: tradesUnavailable,
    reminderSummary,
    latestTrade,
    openReminders: () => navigation.navigate('Reminders'),
    openNotifications: () => navigation.navigate('Notifications'),
    openFeed: () => navigation.navigate('MainTabs', { screen: 'Feed' }),
    openPortfolio: () => navigation.navigate('MainTabs', { screen: 'Portfolio' }),
  });
  const quickActionCandidates = [
    {
      key: 'notifications',
      icon: 'notifications-outline' as const,
      label: '알림',
      description: '읽지 않은 상태와 변화를 확인합니다.',
      onPress: () => navigation.navigate('Notifications'),
    },
    {
      key: 'people',
      icon: 'people-outline' as const,
      label: '사람 찾기',
      description: '새로 팔로우할 투자자를 둘러봅니다.',
      onPress: () => navigation.navigate('People'),
    },
    {
      key: 'reminders',
      icon: 'repeat-outline' as const,
      label: '루틴 관리',
      description: '반복 투자 일정을 전체로 조정합니다.',
      onPress: () => navigation.navigate('Reminders'),
    },
  ];
  const quickActions = quickActionCandidates
    .filter(
      (action) =>
        action.key !== todayAction.primaryKey && action.key !== todayAction.secondaryKey,
    )
    .slice(0, 2);

  return (
    <Page
      eyebrow="Today"
      title="오늘의 투자 현황"
      subtitle="오늘 확인할 투자 상태와 다음 행동을 빠르게 정리합니다."
    >
      <SurfaceCard tone="hero">
        <Text style={styles.summaryLabel}>오늘 상태</Text>
        <Text
          adjustsFontSizeToFit
          minimumFontScale={0.7}
          numberOfLines={1}
          style={[styles.summaryValue, isNarrow && styles.summaryValueNarrow]}
        >
          {summaryTotalValue}
        </Text>
        <View style={[styles.summaryHighlights, isCompact && styles.summaryHighlightsCompact]}>
          <View
            style={[
              styles.summaryHighlight,
              (portfolio.data.dayReturn ?? 0) >= 0
                ? styles.summaryHighlightBrand
                : styles.summaryHighlightDanger,
            ]}
          >
            <Text style={styles.summaryHighlightLabel}>오늘 등락</Text>
            <Text
              style={[
                styles.summaryHighlightValue,
                (portfolio.data.dayReturn ?? 0) < 0 && styles.summaryHighlightValueDanger,
              ]}
            >
              {summaryDayReturn}
            </Text>
          </View>
          <View style={styles.summaryHighlight}>
            <Text style={styles.summaryHighlightLabel}>총 수익률</Text>
            <Text
              style={[
                styles.summaryHighlightValue,
                portfolio.data.totalReturnRate < 0 && styles.summaryHighlightValueDanger,
              ]}
            >
              {summaryReturnRate}
            </Text>
          </View>
        </View>
        <Text style={styles.summaryHeadline}>{heroState.title}</Text>
        <Text style={styles.summaryNarrative}>{heroState.description}</Text>
        <View style={[styles.summaryMetaWrap, isCompact && styles.summaryMetaWrapCompact]}>
          <View style={styles.summaryMetaPill}>
            <Ionicons color={tokens.colors.brandStrong} name="layers-outline" size={15} />
            <Text style={styles.summaryMeta}>
              {portfolioReady
                ? `보유 ${portfolio.data.holdings.length}개 종목`
                : portfolioUnavailable
                  ? '포트폴리오 상태 확인 필요'
                  : '포트폴리오 구성 대기 중'}
            </Text>
          </View>
          <View style={styles.summaryMetaPill}>
            <Ionicons color={tokens.colors.teal} name="time-outline" size={15} />
            <Text style={styles.summaryMeta}>
              {portfolioUnavailable
                ? '자산 데이터 응답을 다시 확인해 주세요.'
                : portfolio.data.syncedAt
                ? `최근 반영 ${formatDateLabel(portfolio.data.syncedAt)}`
                : '아직 반영된 자산 데이터가 없습니다.'}
            </Text>
          </View>
        </View>
        <DataStatusCard error={portfolio.error} loading={portfolio.loading} variant="inline" />
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeading title="오늘 할 일" />
        <View style={[styles.priorityHeader, isCompact && styles.priorityHeaderCompact]}>
          <View style={[styles.priorityPill, priorityToneStyles[todayAction.tone]]}>
            <Ionicons color={priorityIconColors[todayAction.tone]} name={todayAction.icon} size={14} />
            <Text style={[styles.priorityPillLabel, priorityTextToneStyles[todayAction.tone]]}>
              {todayAction.kicker}
            </Text>
          </View>
          <Text style={styles.priorityMeta}>{todayAction.meta}</Text>
        </View>
        <Text style={styles.priorityTitle}>{todayAction.title}</Text>
        <Text style={styles.priorityBody}>{todayAction.description}</Text>
        <View style={styles.priorityActions}>
          <PrimaryButton label={todayAction.primaryLabel} onPress={todayAction.primaryAction} />
        </View>
        {todayAction.secondaryLabel && todayAction.secondaryAction ? (
          <View style={styles.prioritySecondaryBlock}>
            <Text style={styles.prioritySecondaryHint}>{todayAction.secondaryHint}</Text>
            <Pressable
              accessibilityRole="button"
              onPress={todayAction.secondaryAction}
              style={({ pressed }) => [styles.prioritySecondaryLink, pressed && styles.quickActionTilePressed]}
            >
              <Text style={styles.prioritySecondaryLinkLabel}>{todayAction.secondaryLabel}</Text>
              <Ionicons color={tokens.colors.brandStrong} name="chevron-forward" size={16} />
            </Pressable>
          </View>
        ) : null}
        <DataStatusCard error={myTrades.error} loading={myTrades.loading} variant="inline" />
      </SurfaceCard>

      {quickActions.length > 0 ? (
        <SurfaceCard tone="utility">
        <SectionHeading
          title="빠른 확인"
          description="메인 행동과 겹치지 않는 조회와 관리만 남깁니다."
          tone="utility"
        />
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
              <View style={styles.quickActionText}>
                <Text style={styles.quickActionLabel}>{action.label}</Text>
                <Text style={styles.quickActionDescription}>{action.description}</Text>
              </View>
            </Pressable>
          ))}
        </View>
        </SurfaceCard>
      ) : null}

      <SurfaceCard>
        <SectionHeading
          title="포트폴리오 미리보기"
          description={
            portfolioUnavailable
              ? '요약 상태를 아직 불러오지 못했습니다.'
              : portfolio.loading && !portfolioReady
                ? '포트폴리오 요약을 준비 중입니다.'
                : portfolioReady
              ? '핵심 한 가지 신호만 먼저 읽습니다.'
              : '아직 추가된 보유 종목이 없습니다.'
          }
          actionLabel="전체 보기"
          onActionPress={() => navigation.navigate('MainTabs', { screen: 'Portfolio' })}
        />
        <DataStatusCard error={portfolio.error} loading={portfolio.loading} variant="inline" />
        {portfolioUnavailable ? (
          <Text style={styles.supportText}>
            지금은 빈 포트폴리오처럼 보여도 실제 자산이 없다는 뜻은 아닐 수 있습니다. 전체 화면에서 연결 상태를 먼저 확인하세요.
          </Text>
        ) : !portfolioReady && !portfolio.loading && !portfolio.error ? (
          <Text style={styles.emptyText}>
            첫 포트폴리오를 추가하면 보유 종목과 자산 구성이 이곳에 요약됩니다.
          </Text>
        ) : (
          portfolioReady ? (
            <>
              <View style={styles.previewInsightCard}>
                <Text style={styles.previewInsightLabel}>핵심 인사이트</Text>
                <Text style={styles.previewInsightTitle}>{portfolioPreviewInsight.title}</Text>
                <Text style={styles.previewInsightBody}>{portfolioPreviewInsight.description}</Text>
              </View>
              <AllocationBar items={topAllocationItems} height={10} />
              <View style={[styles.previewStatGrid, isCompact && styles.previewStatGridCompact]}>
                <View style={styles.previewStatCard}>
                  <Text style={styles.previewStatLabel}>최대 비중</Text>
                  <Text
                    adjustsFontSizeToFit
                    minimumFontScale={0.75}
                    numberOfLines={1}
                    style={styles.previewStatValue}
                  >
                    {topAllocationItems[0] ? formatWeight(topAllocationItems[0].ratio) : '-'}
                  </Text>
                  <Text style={styles.previewStatMeta}>
                    {topAllocationItems[0] ? topAllocationItems[0].label : '데이터 없음'}
                  </Text>
                </View>
                <View style={styles.previewStatCard}>
                  <Text style={styles.previewStatLabel}>현금 비중</Text>
                  <Text
                    adjustsFontSizeToFit
                    minimumFontScale={0.75}
                    numberOfLines={1}
                    style={styles.previewStatValue}
                  >
                    {formatWeight(portfolio.data.cashWeight)}
                  </Text>
                  <Text style={styles.previewStatMeta}>
                    {portfolio.data.cashWeight > 0
                      ? '다음 대응 여지를 보여줍니다.'
                      : '현재 대부분 투자 중입니다.'}
                  </Text>
                </View>
              </View>
            </>
          ) : null
        )}
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeading
          title="친구 활동 미리보기"
          description={
            feedPreviewUnavailable
              ? '친구 흐름을 아직 불러오지 못했습니다.'
              : feed.loading && !hasFeedPreview
                ? '친구 활동을 준비 중입니다.'
                : hasFeedPreview
              ? '거래 로그보다 왜 봐야 하는지 먼저 읽습니다.'
              : '아직 친구 피드가 비어 있습니다.'
          }
          actionLabel="피드 보기"
          onActionPress={() => navigation.navigate('MainTabs', { screen: 'Feed' })}
        />
        <DataStatusCard error={feed.error} loading={feed.loading} variant="inline" />
        {feedPreviewUnavailable ? (
          <Text style={styles.supportText}>
            친구가 없어서 비어 있는 상태와 다릅니다. 응답이 돌아오면 이 칸은 다시 사회적 신호 요약으로 채워집니다.
          </Text>
        ) : !hasFeedPreview && !feed.loading && !feed.error ? (
          <Text style={styles.emptyText}>
            아직 친구 피드가 비어 있습니다. 친구를 팔로우하면 누가 어떤 종목에 모이는지 이곳에 먼저 요약됩니다.
          </Text>
        ) : (
          hasFeedPreview ? (
            <>
              <View style={styles.previewInsightCard}>
                <Text style={styles.previewInsightLabel}>핵심 신호</Text>
                <Text style={styles.previewInsightTitle}>{friendActivityPreview.title}</Text>
                <Text style={styles.previewInsightBody}>{friendActivityPreview.description}</Text>
              </View>
              <View style={[styles.previewStatGrid, isCompact && styles.previewStatGridCompact]}>
                <View style={styles.previewStatCard}>
                  <Text style={styles.previewStatLabel}>참여한 친구</Text>
                  <Text
                    adjustsFontSizeToFit
                    minimumFontScale={0.75}
                    numberOfLines={1}
                    style={styles.previewStatValue}
                  >
                    {friendActivityPreview.friendCountValue}
                  </Text>
                  <Text style={styles.previewStatMeta}>{friendActivityPreview.friendCountMeta}</Text>
                </View>
                <View style={styles.previewStatCard}>
                  <Text style={styles.previewStatLabel}>집중 종목</Text>
                  <Text
                    adjustsFontSizeToFit
                    minimumFontScale={0.75}
                    numberOfLines={1}
                    style={styles.previewStatValue}
                  >
                    {friendActivityPreview.focusTickerValue}
                  </Text>
                  <Text style={styles.previewStatMeta}>{friendActivityPreview.focusTickerMeta}</Text>
                </View>
                <View style={styles.previewStatCard}>
                  <Text style={styles.previewStatLabel}>반응 흐름</Text>
                  <Text
                    adjustsFontSizeToFit
                    minimumFontScale={0.75}
                    numberOfLines={1}
                    style={styles.previewStatValue}
                  >
                    {friendActivityPreview.engagementValue}
                  </Text>
                  <Text style={styles.previewStatMeta}>{friendActivityPreview.engagementMeta}</Text>
                </View>
              </View>
            </>
          ) : null
        )}
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeading
          title="투자 루틴"
          description={
            remindersUnavailable
              ? '루틴 상태를 아직 불러오지 못했습니다.'
              : reminders.loading && !hasReminders
                ? '루틴 상태를 준비 중입니다.'
                : hasReminders
              ? `총 ${reminders.data.reminders.length}개 루틴`
              : '아직 등록된 투자 루틴이 없습니다.'
          }
          actionLabel="관리"
          onActionPress={() => navigation.navigate('Reminders')}
        />
        <DataStatusCard error={reminders.error} loading={reminders.loading} variant="inline" />
        {remindersUnavailable ? (
          <Text style={styles.supportText}>
            루틴이 없는 상태와 다릅니다. 응답이 돌아오면 다음 일정과 금액이 다시 이 자리에서 요약됩니다.
          </Text>
        ) : !hasReminders && !reminders.loading && !reminders.error ? (
          <Text style={styles.emptyText}>
            적립식 투자나 반복 매수 루틴을 만들면 다음 할 일이 이곳에 정리됩니다.
          </Text>
        ) : (
          hasReminders ? reminders.data.reminders.slice(0, 2).map((item, index) => (
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
          )) : null
        )}
      </SurfaceCard>
    </Page>
  );
}

function resolveHomeHeroState({
  hasPortfolio,
  hasFeedPreview,
  hasPortfolioError,
  dayReturn,
  reminderSummary,
}: {
  hasPortfolio: boolean;
  hasFeedPreview: boolean;
  hasPortfolioError: boolean;
  dayReturn: number | null;
  reminderSummary?: { ticker: string; dayOfMonth: number } | undefined;
}) {
  if (hasPortfolioError) {
    return {
      title: '포트폴리오 상태를 다시 확인하세요.',
      description:
        '지금은 비어 보일 수 있지만 실제 자산이 없다는 뜻은 아닐 수 있습니다. 응답 상태가 돌아오면 오늘 요약이 다시 이 화면에 붙습니다.',
    };
  }

  if (!hasPortfolio) {
    return {
      title: '포트폴리오 구성이 아직 비어 있습니다.',
      description:
        '첫 보유 종목을 추가하면 오늘 등락과 다음 루틴이 이 화면에서 바로 이어집니다.',
    };
  }

  if (reminderSummary) {
    return {
      title: `${reminderSummary.ticker} 루틴이 다음 체크포인트입니다.`,
      description: `매월 ${reminderSummary.dayOfMonth}일 루틴 전까지 오늘 손익만 짧게 확인하면 됩니다.`,
    };
  }

  if ((dayReturn ?? 0) > 0) {
    return {
      title: '오늘 수익 흐름은 플러스입니다.',
      description: hasFeedPreview
        ? '친구 거래 흐름까지 같이 보면 다음 행동을 더 빨리 정할 수 있습니다.'
        : '오늘은 포트폴리오 변화만 짧게 점검해도 충분합니다.',
    };
  }

  if ((dayReturn ?? 0) < 0) {
    return {
      title: '오늘 수익 흐름은 눌리고 있습니다.',
      description:
        '세부 분석은 포트폴리오에서 보고, 여기서는 오늘 대응이 필요한지만 빠르게 확인하세요.',
    };
  }

  return {
    title: '오늘 포지션은 큰 변동이 없습니다.',
    description: hasFeedPreview
      ? '친구 거래 흐름을 같이 보면 다음 아이디어를 더 빨리 찾을 수 있습니다.'
      : '오늘은 루틴과 알림만 점검해도 충분합니다.',
  };
}

function resolveTodayAction({
  hasPortfolio,
  hasPortfolioError,
  hasReminders,
  hasTrades,
  hasTradeError,
  reminderSummary,
  latestTrade,
  openReminders,
  openNotifications,
  openFeed,
  openPortfolio,
}: {
  hasPortfolio: boolean;
  hasPortfolioError: boolean;
  hasReminders: boolean;
  hasTrades: boolean;
  hasTradeError: boolean;
  reminderSummary?: { ticker: string; dayOfMonth: number } | undefined;
  latestTrade?: { ticker: string; tradedAt: string } | undefined;
  openReminders: () => void;
  openNotifications: () => void;
  openFeed: () => void;
  openPortfolio: () => void;
}) {
  if (hasPortfolioError) {
    return {
      kicker: '상태 확인',
      icon: 'alert-circle-outline' as const,
      tone: 'default' as const,
      meta: '오늘 우선순위 · 포트폴리오 응답 확인',
      title: '포트폴리오 상태를 다시 확인하세요.',
      description:
        '지금은 빈 상태처럼 보여도 실제 자산이 없다는 뜻은 아닐 수 있습니다. 포트폴리오 화면에서 응답 상태만 먼저 확인하면 됩니다.',
      primaryKey: 'portfolio' as HomeDestinationKey,
      primaryLabel: '포트폴리오 보기',
      primaryAction: openPortfolio,
      secondaryKey: 'notifications' as HomeDestinationKey,
      secondaryLabel: '알림 보기',
      secondaryAction: openNotifications,
      secondaryHint: '상태 알림부터 먼저 보고 싶다면',
    };
  }

  if (!hasPortfolio) {
    return {
      kicker: '시작 필요',
      icon: 'flag-outline' as const,
      tone: 'brand' as const,
      meta: '오늘 우선순위 · 포트폴리오 기초 세팅',
      title: '첫 포트폴리오 상태부터 확인하세요.',
      description:
        '하단 + 버튼에서 바로 입력하기 전에, 먼저 내 자산 구조가 비어 있는지만 확인하면 됩니다. 이 한 번이 끝나야 홈이 대시보드처럼 작동합니다.',
      primaryKey: 'portfolio' as HomeDestinationKey,
      primaryLabel: '포트폴리오 보기',
      primaryAction: openPortfolio,
      secondaryKey: 'notifications' as HomeDestinationKey,
      secondaryLabel: '알림 보기',
      secondaryAction: openNotifications,
      secondaryHint: '급한 상태 알림만 먼저 보고 싶다면',
    };
  }

  if (hasTradeError) {
    return {
      kicker: '상태 확인',
      icon: 'pulse-outline' as const,
      tone: 'default' as const,
      meta: '최근 기록 상태를 다시 확인',
      title: '최근 거래 요약을 아직 불러오지 못했습니다.',
      description:
        '오늘 할 일 카드는 기록 요약이 돌아오면 다시 선명해집니다. 지금은 포트폴리오와 루틴만 먼저 확인하세요.',
      primaryKey: 'portfolio' as HomeDestinationKey,
      primaryLabel: '포트폴리오 보기',
      primaryAction: openPortfolio,
      secondaryKey: hasReminders ? ('reminders' as HomeDestinationKey) : ('feed' as HomeDestinationKey),
      secondaryLabel: hasReminders ? '리마인더 보기' : '피드 보기',
      secondaryAction: hasReminders ? openReminders : openFeed,
      secondaryHint: hasReminders ? '루틴 상태를 먼저 보려면' : '친구 흐름부터 먼저 보려면',
    };
  }

  if (hasReminders && reminderSummary) {
    return {
      kicker: '오늘 루틴',
      icon: 'repeat-outline' as const,
      tone: 'teal' as const,
      meta: `다음 반복 일정 · 매월 ${reminderSummary.dayOfMonth}일`,
      title: `${reminderSummary.ticker} 루틴을 먼저 확인하세요.`,
      description: `오늘은 성과를 길게 읽기보다 반복 일정과 금액만 점검하면 됩니다. 루틴을 확인한 뒤 나머지는 필요할 때만 보면 됩니다.`,
      primaryKey: 'reminders' as HomeDestinationKey,
      primaryLabel: '리마인더 보기',
      primaryAction: openReminders,
      secondaryKey: 'portfolio' as HomeDestinationKey,
      secondaryLabel: '포트폴리오 보기',
      secondaryAction: openPortfolio,
      secondaryHint: '성과 흐름까지 같이 보려면',
    };
  }

  if (!hasTrades) {
    return {
      kicker: '기록 준비',
      icon: 'sparkles-outline' as const,
      tone: 'brand' as const,
      meta: '오늘 우선순위 · 구조 점검 후 첫 기록',
      title: '첫 거래 흐름을 준비하세요.',
      description:
        '새 거래 입력은 하단 + 버튼에서 진행하고, 여기서는 포트폴리오 구조와 피드 흐름이 준비됐는지만 빠르게 보면 됩니다.',
      primaryKey: 'portfolio' as HomeDestinationKey,
      primaryLabel: '포트폴리오 보기',
      primaryAction: openPortfolio,
      secondaryKey: 'feed' as HomeDestinationKey,
      secondaryLabel: '피드 보기',
      secondaryAction: openFeed,
      secondaryHint: '친구 흐름까지 먼저 훑어보려면',
    };
  }

  return {
    kicker: '다음 확인',
    icon: 'pulse-outline' as const,
    tone: 'default' as const,
    meta: latestTrade
      ? `최근 기록 · ${formatRelativeDate(latestTrade.tradedAt)}`
      : '오늘 우선순위 · 시장과 친구 흐름 확인',
    title: latestTrade ? `${latestTrade.ticker} 이후 반응을 확인하세요.` : '오늘 시장 흐름을 확인하세요.',
    description: latestTrade
      ? `최근 거래는 ${formatRelativeDate(latestTrade.tradedAt)} 기록되었습니다. 지금은 친구들의 반응을 먼저 보고, 내 포트폴리오는 두 번째로 확인하면 됩니다.`
      : '친구 피드와 내 포트폴리오를 함께 보며 오늘 흐름을 빠르게 확인하세요.',
    primaryKey: 'feed' as HomeDestinationKey,
    primaryLabel: '피드 보기',
    primaryAction: openFeed,
    secondaryKey: 'portfolio' as HomeDestinationKey,
    secondaryLabel: '포트폴리오 보기',
    secondaryAction: openPortfolio,
    secondaryHint: '내 손익부터 먼저 보려면',
  };
}

function resolvePortfolioPreviewInsight({
  hasPortfolio,
  topHolding,
  secondHolding,
  holdingCount,
  cashWeight,
}: {
  hasPortfolio: boolean;
  topHolding?: {
    label: string;
    ratio: number;
    meta: string;
  };
  secondHolding?: {
    label: string;
    ratio: number;
  };
  holdingCount: number;
  cashWeight: number;
}) {
  if (!hasPortfolio || !topHolding) {
    return {
      title: '첫 종목이 들어오면 핵심 신호가 바로 보입니다.',
      description: 'Home에서는 긴 목록 대신 가장 중요한 한 가지 변화만 먼저 보여줍니다.',
    };
  }

  if (topHolding.ratio >= 0.4) {
    return {
      title: `${topHolding.label} 비중이 가장 큽니다.`,
      description: `현재 자산의 ${formatWeight(topHolding.ratio)}가 ${topHolding.meta}에 모여 있습니다. 세부 비중 조정은 Portfolio에서 이어서 보면 됩니다.`,
    };
  }

  if (cashWeight >= 0.12) {
    return {
      title: `현금 비중이 ${formatWeight(cashWeight)}입니다.`,
      description: `${topHolding.label}이 가장 큰 포지션이고, 현금이 다음 대응 여지를 남기고 있습니다.`,
    };
  }

  if (secondHolding) {
    return {
      title: `${topHolding.label}이 가장 큰 포지션입니다.`,
      description: `${holdingCount}개 보유 종목 중 ${formatWeight(topHolding.ratio)}로 가장 크고, 다음은 ${secondHolding.label} ${formatWeight(secondHolding.ratio)}입니다.`,
    };
  }

  return {
    title: `${topHolding.label} 한 종목이 중심입니다.`,
    description: `현재는 단일 포지션 중심 구조입니다. 전체 흐름과 세부 분석은 Portfolio에서 바로 이어집니다.`,
  };
}

function resolveFriendActivityPreview(items: FeedTradeItem[]) {
  if (items.length === 0) {
    return {
      title: '친구 흐름이 쌓이면 여기서 먼저 읽힙니다.',
      description: 'Home에서는 최신 거래 로그 대신, 누가 어디에 모이는지 한눈에 요약합니다.',
      friendCountValue: '-',
      friendCountMeta: '아직 참여한 친구가 없습니다.',
      focusTickerValue: '-',
      focusTickerMeta: '아직 집중 종목이 없습니다.',
      engagementValue: '0개',
      engagementMeta: '반응 흐름이 아직 없습니다.',
    };
  }

  const people = new Map<
    number,
    {
      user: FeedTradeItem['user'];
      tradeCount: number;
      engagement: number;
      latestTradedAt: string;
    }
  >();
  const tickers = new Map<
    string,
    {
      ticker: string;
      market: string;
      name: string;
      tradeCount: number;
      engagement: number;
      latestTradedAt: string;
    }
  >();
  let totalEngagement = 0;

  items.forEach((item) => {
    const engagement = tradeEngagement(item);
    totalEngagement += engagement;

    const currentPerson = people.get(item.user.userId);
    if (!currentPerson) {
      people.set(item.user.userId, {
        user: item.user,
        tradeCount: 1,
        engagement,
        latestTradedAt: item.tradedAt,
      });
    } else {
      currentPerson.tradeCount += 1;
      currentPerson.engagement += engagement;

      if (new Date(item.tradedAt).getTime() > new Date(currentPerson.latestTradedAt).getTime()) {
        currentPerson.latestTradedAt = item.tradedAt;
      }
    }

    const tickerKey = `${item.market}:${item.ticker}`;
    const currentTicker = tickers.get(tickerKey);
    if (!currentTicker) {
      tickers.set(tickerKey, {
        ticker: item.ticker,
        market: item.market,
        name: item.name,
        tradeCount: 1,
        engagement,
        latestTradedAt: item.tradedAt,
      });
    } else {
      currentTicker.tradeCount += 1;
      currentTicker.engagement += engagement;

      if (new Date(item.tradedAt).getTime() > new Date(currentTicker.latestTradedAt).getTime()) {
        currentTicker.latestTradedAt = item.tradedAt;
      }
    }
  });

  const topPerson = [...people.values()].sort((left, right) => {
    const engagementDiff = right.engagement - left.engagement;
    if (engagementDiff !== 0) {
      return engagementDiff;
    }

    const tradeCountDiff = right.tradeCount - left.tradeCount;
    if (tradeCountDiff !== 0) {
      return tradeCountDiff;
    }

    return (
      new Date(right.latestTradedAt).getTime() - new Date(left.latestTradedAt).getTime()
    );
  })[0];

  const topTicker = [...tickers.values()].sort((left, right) => {
    const tradeCountDiff = right.tradeCount - left.tradeCount;
    if (tradeCountDiff !== 0) {
      return tradeCountDiff;
    }

    const engagementDiff = right.engagement - left.engagement;
    if (engagementDiff !== 0) {
      return engagementDiff;
    }

    return (
      new Date(right.latestTradedAt).getTime() - new Date(left.latestTradedAt).getTime()
    );
  })[0];

  const uniquePeopleCount = people.size;
  const socialSignalTitle =
    topTicker.tradeCount >= 2
      ? `${topTicker.ticker}에 시선이 모이고 있습니다.`
      : `${topPerson.user.nickname}님이 지금 가장 활발합니다.`;
  const socialSignalDescription =
    topTicker.tradeCount >= 2
      ? totalEngagement > 0
        ? `${uniquePeopleCount}명의 친구가 ${marketLabel(topTicker.market)} ${topTicker.ticker} 관련 공개 거래 ${topTicker.tradeCount}건을 남겼고, 반응과 댓글 ${totalEngagement}개가 이어졌습니다.`
        : `${uniquePeopleCount}명의 친구가 ${marketLabel(topTicker.market)} ${topTicker.ticker} 관련 공개 거래 ${topTicker.tradeCount}건을 남겼습니다. 아직 반응보다 거래 공유가 먼저 쌓이는 흐름입니다.`
      : totalEngagement > 0
        ? `${topPerson.user.nickname}님을 포함해 ${uniquePeopleCount}명의 친구가 공개 거래 ${items.length}건을 남겼고, 반응과 댓글 ${totalEngagement}개가 붙었습니다.`
        : `${topPerson.user.nickname}님을 포함해 ${uniquePeopleCount}명의 친구가 공개 거래 ${items.length}건을 남기며 오늘 흐름을 만들고 있습니다.`;

  return {
    title: socialSignalTitle,
    description: socialSignalDescription,
    friendCountValue: `${uniquePeopleCount}명`,
    friendCountMeta: `${topPerson.user.nickname}님 최근 기록 ${formatRelativeDate(topPerson.latestTradedAt)}`,
    focusTickerValue: topTicker.ticker,
    focusTickerMeta:
      topTicker.tradeCount > 1
        ? `공개 거래 ${topTicker.tradeCount}건이 모였습니다.`
        : `${marketLabel(topTicker.market)} ${topTicker.name}`,
    engagementValue: `${totalEngagement}개`,
    engagementMeta:
      totalEngagement > 0
        ? '댓글과 리액션이 이어졌습니다.'
        : '아직 반응보다 기록 공유 중심입니다.',
  };
}

function tradeEngagement(item: FeedTradeItem) {
  return item.reactions.reduce((sum, reaction) => sum + reaction.count, 0) + item.commentCount;
}

function marketLabel(market: string) {
  return market === 'KRX' ? '국내' : '미국';
}

const priorityToneStyles = StyleSheet.create({
  default: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderColor: 'rgba(214, 224, 234, 0.9)',
  },
  brand: {
    backgroundColor: tokens.colors.brandSoft,
    borderColor: 'rgba(37, 99, 235, 0.14)',
  },
  teal: {
    backgroundColor: tokens.colors.tealSoft,
    borderColor: 'rgba(15, 118, 110, 0.14)',
  },
});

const priorityTextToneStyles = StyleSheet.create({
  default: {
    color: tokens.colors.navy,
  },
  brand: {
    color: tokens.colors.brandStrong,
  },
  teal: {
    color: tokens.colors.teal,
  },
});

const priorityIconColors = {
  default: tokens.colors.navy,
  brand: tokens.colors.brandStrong,
  teal: tokens.colors.teal,
} as const;

const styles = StyleSheet.create({
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
  summaryValueNarrow: {
    fontSize: 30,
  },
  summaryHighlights: {
    flexDirection: 'row',
    gap: 10,
  },
  summaryHighlightsCompact: {
    flexDirection: 'column',
  },
  summaryHighlight: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderColor: 'rgba(214, 224, 234, 0.84)',
    borderRadius: 18,
    borderWidth: 1,
    flex: 1,
    gap: 6,
    minWidth: 0,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  summaryHighlightBrand: {
    backgroundColor: tokens.colors.brandSoft,
    borderColor: 'rgba(37, 99, 235, 0.12)',
  },
  summaryHighlightDanger: {
    backgroundColor: tokens.colors.dangerSoft,
    borderColor: 'rgba(225, 29, 72, 0.12)',
  },
  summaryHighlightLabel: {
    color: tokens.colors.inkMute,
    fontFamily: tokens.typography.body,
    fontSize: 12,
  },
  summaryHighlightValue: {
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontSize: 16,
    fontWeight: '700',
  },
  summaryHighlightValueDanger: {
    color: tokens.colors.danger,
  },
  summaryHeadline: {
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontSize: 20,
    fontWeight: '800',
  },
  summaryNarrative: {
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.body,
    fontSize: 14,
    lineHeight: 22,
  },
  summaryMetaWrap: {
    flexDirection: 'row',
    gap: 8,
  },
  summaryMetaWrapCompact: {
    flexDirection: 'column',
  },
  summaryMetaPill: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: tokens.radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(214, 224, 234, 0.82)',
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  summaryMeta: {
    fontSize: 12,
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
  priorityHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  priorityHeaderCompact: {
    alignItems: 'flex-start',
    flexDirection: 'column',
  },
  priorityPill: {
    alignItems: 'center',
    borderRadius: tokens.radius.pill,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  priorityPillLabel: {
    fontFamily: tokens.typography.heading,
    fontSize: 12,
    fontWeight: '700',
  },
  priorityMeta: {
    color: tokens.colors.inkMute,
    fontFamily: tokens.typography.body,
    fontSize: 12,
  },
  priorityTitle: {
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontSize: 21,
    fontWeight: '800',
  },
  priorityActions: {
    gap: 10,
  },
  prioritySecondaryBlock: {
    gap: 6,
  },
  prioritySecondaryHint: {
    color: tokens.colors.inkMute,
    fontFamily: tokens.typography.body,
    fontSize: 12,
    lineHeight: 18,
  },
  prioritySecondaryLink: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    gap: 4,
  },
  prioritySecondaryLinkLabel: {
    color: tokens.colors.brandStrong,
    fontFamily: tokens.typography.heading,
    fontSize: 13,
    fontWeight: '700',
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
    minHeight: 82,
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(214, 224, 234, 0.76)',
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
    alignItems: 'flex-start',
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
  quickActionText: {
    gap: 4,
    minWidth: 0,
  },
  quickActionLabel: {
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontSize: 14,
    fontWeight: '700',
  },
  quickActionDescription: {
    color: tokens.colors.inkMute,
    fontFamily: tokens.typography.body,
    fontSize: 12,
    lineHeight: 18,
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
  supportText: {
    fontSize: 13,
    lineHeight: 20,
    color: tokens.colors.inkMute,
    fontFamily: tokens.typography.body,
  },
  previewInsightCard: {
    backgroundColor: tokens.colors.surfaceMuted,
    borderRadius: 18,
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  previewInsightLabel: {
    color: tokens.colors.brandStrong,
    fontFamily: tokens.typography.heading,
    fontSize: 12,
    fontWeight: '700',
  },
  previewInsightTitle: {
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontSize: 18,
    fontWeight: '800',
  },
  previewInsightBody: {
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.body,
    fontSize: 13,
    lineHeight: 20,
  },
  previewStatGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  previewStatGridCompact: {
    flexDirection: 'column',
  },
  previewStatCard: {
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(214, 224, 234, 0.76)',
    flex: 1,
    gap: 4,
    minWidth: 0,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  previewStatLabel: {
    color: tokens.colors.inkMute,
    fontFamily: tokens.typography.body,
    fontSize: 12,
  },
  previewStatValue: {
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontSize: 16,
    fontWeight: '700',
  },
  previewStatMeta: {
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.body,
    fontSize: 12,
    lineHeight: 18,
  },
});
