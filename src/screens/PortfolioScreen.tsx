import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  AllocationBar,
  AllocationDonutChart,
  AllocationLegendGrid,
  MonthlyDividendChart,
  type AllocationVisualItem,
} from '../components/portfolio-visuals';
import { DataStatusCard } from '../components/DataStatusCard';
import { Heatmap } from '../components/Heatmap';
import {
  MetricBadge,
  MetricGrid,
  Page,
  SectionHeading,
  SurfaceCard,
} from '../components/ui';
import {
  useMyTradesData,
  usePortfolioData,
  useRemindersData,
} from '../hooks/useFoloData';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import {
  formatCompactCurrency,
  formatCurrency,
  formatPercent,
  formatSignedCurrency,
  formatWeight,
} from '../lib/format';
import type { RootStackParamList } from '../navigation/types';
import { tokens } from '../theme/tokens';

const ALLOCATION_PALETTE = ['#2563EB', '#0F766E', '#7C3AED', '#F59E0B', '#E11D48', '#14B8A6'];
const SECTOR_PALETTE = ['#E11D48', '#F59E0B', '#4F46E5', '#0F766E', '#14B8A6', '#64748B'];

export function PortfolioScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isCompact, isLarge, isNarrow } = useResponsiveLayout();
  const portfolio = usePortfolioData();
  const reminders = useRemindersData();
  const myTrades = useMyTradesData();

  const holdings = [...portfolio.data.holdings].sort(
    (left, right) => (right.totalValue ?? 0) - (left.totalValue ?? 0),
  );
  const hasHoldings = holdings.length > 0;
  const showEmptyState = !portfolio.loading && !portfolio.error && !hasHoldings;
  const allocationItems = holdings.map((holding, index) => ({
    key: `${holding.holdingId}`,
    label: holding.name,
    ratio: holding.weight,
    value: formatCurrency(holding.totalValue, holding.market),
    meta: `${holding.ticker} · ${holding.market}`,
    color: ALLOCATION_PALETTE[index % ALLOCATION_PALETTE.length],
  }));
  const compactTopHoldings = allocationItems.slice(0, isCompact ? 3 : 6);
  const remainingCompactHoldingCount = Math.max(holdings.length - compactTopHoldings.length, 0);
  const compositionItems = buildCompositionItems({
    sectorAllocations: portfolio.data.sectorAllocations,
    cashValue: portfolio.data.cashValue,
    cashWeight: portfolio.data.cashWeight,
  });
  const monthlyDividendItems = portfolio.data.monthlyDividendForecasts.map((item) => ({
    key: `month-${item.month}`,
    label: item.label,
    amount: item.amount,
  }));
  const hasDividendProjection = monthlyDividendItems.some((item) => item.amount > 0);
  const dividendTotal = monthlyDividendItems.reduce((sum, item) => sum + item.amount, 0);
  const dividendMonths = monthlyDividendItems.filter((item) => item.amount > 0).length;
  const bestHolding =
    holdings.length > 0
      ? [...holdings].sort((left, right) => right.returnRate - left.returnRate)[0]
      : null;
  const weakestHolding =
    holdings.length > 0
      ? [...holdings].sort((left, right) => left.returnRate - right.returnRate)[0]
      : null;

  const activeReminders = [...reminders.data.reminders]
    .filter((item) => item.isActive)
    .sort(
      (left, right) =>
        new Date(left.nextReminderDate).getTime() -
        new Date(right.nextReminderDate).getTime(),
    );
  const trades = [...myTrades.data.trades].sort(
    (left, right) => new Date(right.tradedAt).getTime() - new Date(left.tradedAt).getTime(),
  );
  const tradeCountByDate = buildTradeCountByDate(trades);
  const tradeHeatmapWeeks = buildTradeHeatmapWeeks(tradeCountByDate, 12);
  const hasTradeHeatmap = tradeHeatmapWeeks.some((week) =>
    week.days.some((day) => day.count > 0),
  );
  const monthlyTradeCount = trades.filter((item) =>
    isSameCalendarMonth(new Date(item.tradedAt), new Date()),
  ).length;
  const monthlyTradeDays = countTradeDaysInMonth(tradeCountByDate, new Date());
  const activityGoalDays =
    activeReminders.length > 0
      ? Math.max(6, Math.min(12, activeReminders.length * 3))
      : 8;
  const goalProgressRate = Math.min(
    100,
    Math.round((monthlyTradeDays / Math.max(activityGoalDays, 1)) * 100),
  );
  const dayStreak = calculateTrailingDayStreak(tradeCountByDate, new Date());
  const routineLoading = reminders.loading || myTrades.loading;
  const routineError = reminders.error ?? myTrades.error;
  const showPortfolioSupportCard =
    !hasHoldings && (portfolio.loading || portfolio.error !== null);
  const leadHolding = allocationItems[0] ?? null;
  const secondaryHolding = allocationItems[1] ?? null;
  const overviewNarrative = !leadHolding
    ? '첫 보유 종목이 들어오면 자산 구성과 성과 핵심이 이 위쪽에서 먼저 정리됩니다.'
    : portfolio.data.cashWeight >= 0.12
      ? `${leadHolding.label} 비중이 ${formatWeight(leadHolding.ratio)}로 가장 크고, 현금 ${formatWeight(portfolio.data.cashWeight)}가 다음 대응 여지를 남기고 있습니다.`
      : bestHolding && bestHolding.returnRate > 0
        ? `${leadHolding.label} 비중이 가장 크고 ${bestHolding.ticker}가 현재 성과 선두입니다. 세부 기여와 배당 흐름은 아래에서 이어집니다.`
        : secondaryHolding
          ? `${holdings.length}개 종목 중 ${leadHolding.label}이 가장 크고, 다음은 ${secondaryHolding.label}입니다.`
          : `${leadHolding.label} 한 종목이 현재 포트폴리오 중심입니다.`;

  const overviewCard = (
    <SurfaceCard tone="hero">
      <Text style={styles.overviewLabel}>총 평가금액</Text>
      <Text
        adjustsFontSizeToFit
        minimumFontScale={0.7}
        numberOfLines={1}
        style={[styles.overviewValue, isNarrow && styles.overviewValueNarrow]}
      >
        {isCompact
          ? formatCompactCurrency(portfolio.data.totalValue)
          : formatCurrency(portfolio.data.totalValue)}
      </Text>
      <View style={[styles.overviewHighlightGrid, isCompact && styles.overviewHighlightGridCompact]}>
        <View
          style={[
            styles.overviewHighlightCard,
            (portfolio.data.dayReturn ?? 0) >= 0
              ? styles.overviewHighlightCardBrand
              : styles.overviewHighlightCardDanger,
          ]}
        >
          <Text style={styles.overviewHighlightLabel}>오늘 등락</Text>
          <Text
            adjustsFontSizeToFit
            minimumFontScale={0.78}
            numberOfLines={1}
            style={[
              styles.overviewHighlightValue,
              (portfolio.data.dayReturn ?? 0) < 0 && styles.overviewHighlightValueNegative,
            ]}
          >
            {formatSignedCurrency(portfolio.data.dayReturn)}
          </Text>
        </View>
        <View style={styles.overviewHighlightCard}>
          <Text style={styles.overviewHighlightLabel}>총 수익률</Text>
          <Text
            adjustsFontSizeToFit
            minimumFontScale={0.78}
            numberOfLines={1}
            style={[
              styles.overviewHighlightValue,
              portfolio.data.totalReturnRate < 0 && styles.overviewHighlightValueNegative,
            ]}
          >
            {formatPercent(portfolio.data.totalReturnRate)}
          </Text>
        </View>
      </View>
      <Text style={styles.overviewNarrative}>{overviewNarrative}</Text>
      <View style={[styles.overviewMetaWrap, isCompact && styles.overviewMetaWrapCompact]}>
        <View style={styles.overviewMetaPill}>
          <Ionicons color={tokens.colors.brandStrong} name="layers-outline" size={15} />
          <Text style={styles.overviewMetaText}>보유 {holdings.length}개 종목</Text>
        </View>
        <View style={styles.overviewMetaPill}>
          <Ionicons color={tokens.colors.teal} name="wallet-outline" size={15} />
          <Text style={styles.overviewMetaText}>현금 비중 {formatWeight(portfolio.data.cashWeight)}</Text>
        </View>
      </View>
      <DataStatusCard error={portfolio.error} loading={portfolio.loading} variant="inline" />
    </SurfaceCard>
  );

  const allocationOverviewCard = (
    <SurfaceCard>
      <SectionHeading
        title="자산 구성"
        description={
          isCompact
            ? '큰 비중과 현금 위치를 먼저 읽습니다.'
            : '비중, 섹터, 현금 구성을 먼저 읽습니다.'
        }
      />
      <View style={[styles.allocationBoard, isCompact && styles.allocationBoardCompact]}>
        <AllocationDonutChart
          items={allocationItems}
          centerLabel={
            isCompact
              ? formatCompactCurrency(portfolio.data.totalValue)
              : formatCurrency(portfolio.data.totalValue)
          }
          centerSubLabel="총 평가금액"
          size={isCompact ? 148 : 216}
          strokeWidth={isCompact ? 18 : 26}
        />
        <View style={styles.allocationLegendWrap}>
          <Text style={styles.analyticsLabel}>{isCompact ? '대표 비중' : '상위 비중 종목'}</Text>
          <View style={[styles.allocationSnapshotGrid, isCompact && styles.allocationSnapshotGridCompact]}>
            <View style={styles.allocationSnapshotCard}>
              <Text style={styles.allocationSnapshotLabel}>최대 비중</Text>
              <Text style={styles.allocationSnapshotValue}>
                {leadHolding ? formatWeight(leadHolding.ratio) : '-'}
              </Text>
              <Text style={styles.allocationSnapshotMeta}>
                {leadHolding ? leadHolding.label : '표시할 종목이 없습니다.'}
              </Text>
            </View>
            <View style={styles.allocationSnapshotCard}>
              <Text style={styles.allocationSnapshotLabel}>현금 비중</Text>
              <Text style={styles.allocationSnapshotValue}>
                {formatWeight(portfolio.data.cashWeight)}
              </Text>
              <Text style={styles.allocationSnapshotMeta}>
                {portfolio.data.cashWeight > 0
                  ? '다음 대응 여지가 남아 있습니다.'
                  : '현재 대부분 투자 중입니다.'}
              </Text>
            </View>
          </View>
          <AllocationLegendGrid items={compactTopHoldings} columns={isCompact ? 1 : 2} />
          {remainingCompactHoldingCount > 0 ? (
            <Text style={styles.helperText}>외 {remainingCompactHoldingCount}개 종목이 더 있습니다.</Text>
          ) : null}
        </View>
      </View>
    </SurfaceCard>
  );

  const compositionCard = (
    <SurfaceCard tone="utility">
      <SectionHeading
        title="섹터 / 현금 상세"
        description="구성 세부는 이 아래에서 이어서 읽습니다."
        tone="utility"
      />
      <View style={styles.analyticsSection}>
        <View style={styles.allocationBarSection}>
          <AllocationBar items={compositionItems} height={isCompact ? 14 : 18} />
          <AllocationLegendGrid items={compositionItems} columns={isCompact ? 1 : 2} />
        </View>
      </View>
    </SurfaceCard>
  );

  const performanceCard = (
    <SurfaceCard>
      <SectionHeading
        title="성과 디테일"
        description="수익 기여 종목과 배당 흐름을 깊게 봅니다."
      />
      <MetricGrid>
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
        <MetricBadge
          label="투자원금"
          value={formatCurrency(portfolio.data.totalInvested)}
        />
        <MetricBadge
          label="예상 배당"
          value={formatCurrency(dividendTotal)}
          tone={hasDividendProjection ? 'brand' : 'default'}
        />
      </MetricGrid>
      <Text style={styles.sideNote}>지급 월 {dividendMonths}개월 · 총 평가금액 {formatCurrency(portfolio.data.totalValue)}</Text>

      <View
        style={[
          styles.performanceInsightGrid,
          isCompact && styles.performanceInsightGridCompact,
        ]}
      >
        <View style={styles.performanceInsightCard}>
          <Text style={styles.performanceLabel}>성과 선두</Text>
          <Text style={styles.performanceTicker}>
            {bestHolding ? bestHolding.ticker : '데이터 없음'}
          </Text>
          <Text
            style={[
              styles.performanceValue,
              bestHolding && bestHolding.returnRate < 0 && styles.performanceValueNegative,
            ]}
          >
            {bestHolding
              ? `${formatPercent(bestHolding.returnRate)} · ${formatSignedCurrency(
                  bestHolding.returnAmount,
                  bestHolding.market,
                )}`
              : '-'}
          </Text>
          <Text style={styles.performanceMeta}>
            {bestHolding
              ? `${bestHolding.name} · ${bestHolding.sectorName ?? assetTypeLabel(bestHolding.assetType)}`
              : '표시할 보유 종목이 없습니다.'}
          </Text>
        </View>

        <View style={styles.performanceInsightCard}>
          <Text style={styles.performanceLabel}>주의 종목</Text>
          <Text style={styles.performanceTicker}>
            {weakestHolding ? weakestHolding.ticker : '데이터 없음'}
          </Text>
          <Text
            style={[
              styles.performanceValue,
              weakestHolding && weakestHolding.returnRate < 0
                ? styles.performanceValueNegative
                : styles.performanceValuePositive,
            ]}
          >
            {weakestHolding
              ? `${formatPercent(weakestHolding.returnRate)} · ${formatSignedCurrency(
                  weakestHolding.returnAmount,
                  weakestHolding.market,
                )}`
              : '-'}
          </Text>
          <Text style={styles.performanceMeta}>
            {weakestHolding
              ? `${weakestHolding.name} · ${weakestHolding.sectorName ?? assetTypeLabel(weakestHolding.assetType)}`
              : '표시할 보유 종목이 없습니다.'}
          </Text>
        </View>
      </View>

      <View style={styles.analyticsSection}>
        <Text style={styles.analyticsLabel}>월별 배당 흐름</Text>
        {hasDividendProjection ? (
          <MonthlyDividendChart items={monthlyDividendItems} />
        ) : (
          <Text style={styles.helperText}>
            배당 수익률과 지급 월 데이터가 있는 종목부터 이 영역에 쌓입니다.
          </Text>
        )}
      </View>
    </SurfaceCard>
  );

  const routineCard = (
    <SurfaceCard>
      <SectionHeading
        title="투자 루틴"
        description={
          activeReminders[0]
            ? `다음 일정 ${formatShortDate(activeReminders[0].nextReminderDate)} · 잔디와 함께 리듬을 봅니다.`
            : 'GitHub 잔디처럼 거래 기록과 반복 루틴을 함께 점검합니다.'
        }
        actionLabel="루틴 관리"
        onActionPress={() => navigation.navigate('Reminders')}
      />
      <DataStatusCard error={routineError} loading={routineLoading} variant="inline" />
      <View style={styles.analyticsSection}>
        <Text style={styles.analyticsLabel}>최근 12주 거래 잔디</Text>
        {hasTradeHeatmap ? (
          <>
            <Heatmap
              cellSize={isCompact ? 12 : 14}
              gap={isCompact ? 4 : 6}
              weeks={tradeHeatmapWeeks}
            />
            <Text style={styles.helperText}>
              진한 칸일수록 같은 날 거래 기록이 많습니다. 이번 달 {monthlyTradeCount}건,
              활동일 {monthlyTradeDays}일입니다.
            </Text>
          </>
        ) : (
          <Text style={styles.helperText}>
            거래를 기록하면 GitHub 잔디처럼 날짜별 활동이 이곳에 쌓입니다.
          </Text>
        )}
      </View>

      <View style={[styles.routineSnapshotGrid, isCompact && styles.routineSnapshotGridCompact]}>
        <View style={styles.routineSnapshotCard}>
          <Text style={styles.routineSnapshotLabel}>연속 기록</Text>
          <Text style={styles.routineSnapshotValue}>{dayStreak}일</Text>
          <Text style={styles.routineSnapshotMeta}>
            {dayStreak > 0 ? '오늘까지 기록 흐름이 이어지고 있습니다.' : '오늘부터 다시 잔디를 채울 수 있습니다.'}
          </Text>
        </View>
        <View style={styles.routineSnapshotCard}>
          <Text style={styles.routineSnapshotLabel}>이번 달 활동일</Text>
          <Text style={styles.routineSnapshotValue}>{monthlyTradeDays}일</Text>
          <Text style={styles.routineSnapshotMeta}>총 거래 {monthlyTradeCount}건이 기록되었습니다.</Text>
        </View>
        <View style={styles.routineSnapshotCard}>
          <Text style={styles.routineSnapshotLabel}>목표 달성률</Text>
          <Text style={styles.routineSnapshotValue}>{goalProgressRate}%</Text>
          <Text style={styles.routineSnapshotMeta}>월 {activityGoalDays}일 기록 목표 기준입니다.</Text>
        </View>
        <View style={styles.routineSnapshotCard}>
          <Text style={styles.routineSnapshotLabel}>다음 루틴</Text>
          <Text style={styles.routineSnapshotValue}>
            {activeReminders[0] ? formatShortDate(activeReminders[0].nextReminderDate) : '미설정'}
          </Text>
          <Text style={styles.routineSnapshotMeta}>
            {activeReminders[0]
              ? `${activeReminders[0].ticker} · ${formatCurrency(activeReminders[0].amount)}`
              : '반복 투자 루틴을 만들면 다음 일정이 여기에 잡힙니다.'}
          </Text>
        </View>
      </View>
    </SurfaceCard>
  );

  const holdingsCard = (
    <SurfaceCard>
      <SectionHeading
        title="보유 종목"
        description="비중 순으로 보고 평가금액, 손익, 평균단가를 같은 자리에서 비교합니다."
      />
      {holdings.map((holding, index) => (
        <Pressable
          key={holding.holdingId}
          accessibilityRole="button"
          onPress={() => navigation.navigate('HoldingDetail', { holdingId: holding.holdingId })}
          style={({ pressed }) => [
            styles.holdingCard,
            index < holdings.length - 1 && styles.divider,
            pressed && styles.buttonPressed,
          ]}
        >
          <View style={[styles.holdingHeader, isCompact && styles.holdingHeaderCompact]}>
            <View style={styles.holdingText}>
              <Text ellipsizeMode="tail" numberOfLines={1} style={styles.holdingName}>
                {holding.name}
              </Text>
              <Text ellipsizeMode="tail" numberOfLines={1} style={styles.holdingSubline}>
                {holding.ticker} · {holding.market} ·{' '}
                {holding.sectorName ?? assetTypeLabel(holding.assetType)}
              </Text>
            </View>
            <View style={[styles.holdingWeightCard, isCompact && styles.holdingWeightCardCompact]}>
              <Text style={styles.holdingWeightLabel}>비중</Text>
              <Text style={styles.holdingWeightValue}>{formatWeight(holding.weight)}</Text>
            </View>
          </View>
          <View style={[styles.holdingMetricRail, isNarrow && styles.holdingMetricRailNarrow]}>
            <View style={[styles.holdingMetricItem, styles.holdingMetricItemPrimary]}>
              <Text style={styles.holdingStatLabel}>평가금액</Text>
              <Text
                adjustsFontSizeToFit
                minimumFontScale={0.75}
                numberOfLines={1}
                style={styles.holdingMetricValuePrimary}
              >
                {formatCurrency(holding.totalValue, holding.market)}
              </Text>
            </View>
            <View
              style={[
                styles.holdingMetricItem,
                styles.holdingMetricDivider,
                isNarrow && styles.holdingMetricDividerNarrow,
              ]}
            >
              <Text style={styles.holdingStatLabel}>손익</Text>
              <Text
                adjustsFontSizeToFit
                minimumFontScale={0.72}
                numberOfLines={1}
                style={[
                  styles.holdingStatValue,
                  (holding.returnAmount ?? 0) < 0 && styles.holdingStatValueNegative,
                ]}
              >
                {formatSignedCurrency(holding.returnAmount, holding.market)}
              </Text>
              <Text
                numberOfLines={1}
                style={[
                  styles.holdingStatMeta,
                  holding.returnRate < 0 && styles.holdingStatMetaNegative,
                ]}
              >
                {formatPercent(holding.returnRate)}
              </Text>
            </View>
            <View
              style={[
                styles.holdingMetricItem,
                styles.holdingMetricDivider,
                isNarrow && styles.holdingMetricDividerNarrow,
              ]}
            >
              <Text style={styles.holdingStatLabel}>평균단가</Text>
              <Text
                adjustsFontSizeToFit
                minimumFontScale={0.72}
                numberOfLines={1}
                style={styles.holdingStatValue}
              >
                {formatCurrency(holding.avgPrice, holding.market)}
              </Text>
            </View>
          </View>
        </Pressable>
      ))}
    </SurfaceCard>
  );

  const managementActions = [
    {
      key: 'kis',
      icon: 'link-outline' as const,
      label: 'KIS 연결',
      description: '연동 상태와 자동 동기화 준비를 확인합니다.',
      meta: '연동',
      onPress: () => navigation.navigate('KisConnect'),
    },
    {
      key: 'reminders',
      icon: 'repeat-outline' as const,
      label: '루틴 관리',
      description: '반복 투자 일정과 금액을 조정합니다.',
      meta: '설정',
      onPress: () => navigation.navigate('Reminders'),
    },
  ];

  const managementCard = (
    <SurfaceCard tone="utility">
      <SectionHeading
        title="관리 작업"
        description="거래 입력은 하단 +에서 하고, 여기서는 연동과 루틴 설정만 다룹니다."
        tone="utility"
      />
      <Text style={styles.managementHelperText}>분석 흐름과 분리된 지원 작업입니다.</Text>
      <View style={styles.managementStack}>
        {managementActions.map((action, index) => (
          <Pressable
            key={action.key}
            accessibilityRole="button"
            onPress={action.onPress}
            style={({ pressed }) => [
              styles.managementTile,
              index < managementActions.length - 1 && styles.managementTileDivider,
              pressed && styles.buttonPressed,
            ]}
          >
            <View style={styles.managementIconWrap}>
              <Ionicons color={tokens.colors.inkSoft} name={action.icon} size={16} />
            </View>
            <View style={styles.managementText}>
              <View style={styles.managementLabelRow}>
                <Text style={styles.managementLabel}>{action.label}</Text>
                <Text style={styles.managementMeta}>{action.meta}</Text>
              </View>
              <Text style={styles.managementDescription}>{action.description}</Text>
            </View>
            <Ionicons color={tokens.colors.inkMute} name="chevron-forward" size={16} />
          </Pressable>
        ))}
      </View>
    </SurfaceCard>
  );

  const emptyStatePreviewItems = [
    {
      key: 'allocation',
      label: '자산 구성',
      description: '종목 비중과 현금 위치를 한 번에 정리합니다.',
    },
    {
      key: 'performance',
      label: '성과 요약',
      description: '오늘 등락과 총 수익률을 먼저 보여줍니다.',
    },
    {
      key: 'routine',
      label: '거래 루틴',
      description: '거래 잔디와 다음 리마인더가 쌓이기 시작합니다.',
    },
  ] as const;

  const emptyStateActions = [
    {
      key: 'add-trade',
      eyebrow: '직접 시작',
      title: '첫 거래 기록',
      description: '하단 +와 같은 흐름으로 가장 빠르게 포트폴리오를 시작합니다.',
      icon: 'add-circle-outline' as const,
      onPress: () => navigation.navigate('AddTrade'),
    },
    {
      key: 'kis-connect',
      eyebrow: '자동 연결',
      title: 'KIS 연결',
      description: '기존 보유 자산을 불러와 구성과 손익을 한 번에 채웁니다.',
      icon: 'link-outline' as const,
      onPress: () => navigation.navigate('KisConnect'),
    },
  ] as const;

  return (
    <Page
      eyebrow="Portfolio"
      title="내 포트폴리오"
      subtitle="자산 구성, 성과, 루틴을 한 화면에서 읽습니다."
    >
      {showPortfolioSupportCard ? (
        <SurfaceCard tone="utility">
          <Text style={styles.supportTitle}>
            {portfolio.loading
              ? '포트폴리오를 반영하는 중입니다.'
              : '포트폴리오 상태를 먼저 확인해 주세요.'}
          </Text>
          <Text style={styles.supportDescription}>
            {portfolio.loading
              ? '분석 카드보다 먼저 현재 상태만 가볍게 안내합니다.'
              : '연결 또는 응답 상태를 확인한 뒤 다시 시도하면 분석 화면이 이어집니다.'}
          </Text>
          <DataStatusCard error={portfolio.error} loading={portfolio.loading} variant="inline" />
        </SurfaceCard>
      ) : null}

      {showEmptyState ? (
        <SurfaceCard tone="hero">
          <SectionHeading
            title="보유 종목이 아직 없습니다"
            description="첫 종목을 추가하면 자산 구성과 수익률이 정리됩니다."
          />
          <Text style={styles.emptyText}>
            첫 거래가 들어오면 이 화면이 자산 구성, 성과, 거래 루틴을 누적해서 보여주는 운영 화면으로 바뀝니다.
          </Text>
          <View style={[styles.emptyPreviewGrid, isCompact && styles.emptyPreviewGridCompact]}>
            {emptyStatePreviewItems.map((item) => (
              <View key={item.key} style={styles.emptyPreviewCard}>
                <Text style={styles.emptyPreviewLabel}>{item.label}</Text>
                <Text style={styles.emptyPreviewDescription}>{item.description}</Text>
              </View>
            ))}
          </View>
          <View style={styles.emptyActionStack}>
            {emptyStateActions.map((action) => (
              <Pressable
                key={action.key}
                accessibilityRole="button"
                onPress={action.onPress}
                style={({ pressed }) => [
                  styles.emptyActionCard,
                  pressed && styles.buttonPressed,
                ]}
              >
                <View style={styles.emptyActionIconWrap}>
                  <Ionicons color={tokens.colors.navy} name={action.icon} size={18} />
                </View>
                <View style={styles.emptyActionText}>
                  <Text style={styles.emptyActionEyebrow}>{action.eyebrow}</Text>
                  <Text style={styles.emptyActionTitle}>{action.title}</Text>
                  <Text style={styles.emptyActionDescription}>{action.description}</Text>
                </View>
                <Ionicons color={tokens.colors.inkMute} name="chevron-forward" size={16} />
              </Pressable>
            ))}
          </View>
        </SurfaceCard>
      ) : null}

      {hasHoldings ? (
        <>
          {overviewCard}
          {isLarge ? (
            <View style={styles.contentColumns}>
              <View style={styles.mainColumn}>
                {allocationOverviewCard}
                {compositionCard}
                {holdingsCard}
              </View>
              <View style={styles.sideColumn}>
                {performanceCard}
                {routineCard}
                {managementCard}
              </View>
            </View>
          ) : (
            <>
              {allocationOverviewCard}
              {performanceCard}
              {compositionCard}
              {routineCard}
              {holdingsCard}
              {managementCard}
            </>
          )}
        </>
      ) : null}
    </Page>
  );
}

function buildCompositionItems({
  sectorAllocations,
  cashValue,
  cashWeight,
}: {
  sectorAllocations: {
    key: string;
    label: string;
    weight: number;
    value: number | null;
  }[];
  cashValue: number | null;
  cashWeight: number;
}): AllocationVisualItem[] {
  const items = sectorAllocations.map((item, index) => ({
    key: item.key,
    label: item.label,
    ratio: item.weight,
    value: item.value !== null ? formatCurrency(item.value) : undefined,
    color: SECTOR_PALETTE[index % SECTOR_PALETTE.length],
  }));
  const hasCashItem = items.some(
    (item) =>
      item.key.toLowerCase().includes('cash') || item.label.includes('현금'),
  );

  if (!hasCashItem && cashWeight > 0) {
    items.push({
      key: 'cash',
      label: '현금',
      ratio: cashWeight,
      value: formatCurrency(cashValue),
      color: '#94A3B8',
    });
  }

  return items;
}

function buildTradeCountByDate(trades: { tradedAt: string }[]) {
  const counts = new Map<string, number>();

  trades.forEach((item) => {
    const key = toDateKey(new Date(item.tradedAt));
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });

  return counts;
}

function buildTradeHeatmapWeeks(countByDate: Map<string, number>, weeks = 12) {
  const currentWeekStart = startOfWeek(new Date());
  const rawWeeks = Array.from({ length: weeks }, (_, index) => {
    const offset = weeks - 1 - index;
    const start = addDays(currentWeekStart, -7 * offset);
    const days = Array.from({ length: 7 }, (_, dayIndex) => {
      const date = addDays(start, dayIndex);
      const key = toDateKey(date);
      return {
        key,
        date,
        count: countByDate.get(key) ?? 0,
      };
    });

    return {
      key: start.toISOString(),
      start,
      days,
    };
  });
  const maxCount = rawWeeks.reduce(
    (currentMax, week) =>
      Math.max(currentMax, ...week.days.map((day) => day.count)),
    0,
  );

  return rawWeeks.map((week, index) => {
    const previousWeek = rawWeeks[index - 1];
    const showMonthLabel =
      index === 0 || previousWeek.start.getMonth() !== week.start.getMonth();

    return {
      key: week.key,
      label: showMonthLabel ? `${week.start.getMonth() + 1}월` : undefined,
      days: week.days.map((day) => ({
        key: day.key,
        count: day.count,
        dateLabel: `${day.date.getMonth() + 1}/${day.date.getDate()}`,
        level: heatmapLevelForCount(day.count, maxCount),
      })),
    };
  });
}

function countTradeDaysInMonth(countByDate: Map<string, number>, reference: Date) {
  let total = 0;

  countByDate.forEach((count, key) => {
    if (count <= 0) {
      return;
    }

    const value = new Date(`${key}T00:00:00`);
    if (isSameCalendarMonth(value, reference)) {
      total += 1;
    }
  });

  return total;
}

function calculateTrailingDayStreak(countByDate: Map<string, number>, reference: Date) {
  let streak = 0;
  let cursor = startOfDay(reference);

  while ((countByDate.get(toDateKey(cursor)) ?? 0) > 0) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }

  return streak;
}

function startOfWeek(date: Date) {
  const result = new Date(date);
  const day = result.getDay();
  const diff = day === 0 ? -6 : 1 - day;

  result.setHours(0, 0, 0, 0);
  result.setDate(result.getDate() + diff);
  return result;
}

function addDays(date: Date, amount: number) {
  const result = new Date(date);

  result.setDate(result.getDate() + amount);
  return result;
}

function startOfDay(date: Date) {
  const result = new Date(date);

  result.setHours(0, 0, 0, 0);
  return result;
}

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function heatmapLevelForCount(count: number, maxCount: number) {
  if (count <= 0) {
    return 0;
  }

  if (maxCount <= 1) {
    return 4;
  }

  return Math.max(1, Math.ceil((count / maxCount) * 4));
}

function isSameCalendarMonth(target: Date, reference: Date) {
  return (
    target.getFullYear() === reference.getFullYear() &&
    target.getMonth() === reference.getMonth()
  );
}

function assetTypeLabel(value: 'STOCK' | 'ETF') {
  return value === 'ETF' ? 'ETF' : '주식';
}

function formatShortDate(iso: string) {
  if (!iso) {
    return '';
  }

  const value = new Date(iso);
  return `${value.getMonth() + 1}/${value.getDate()}`;
}

const styles = StyleSheet.create({
  contentColumns: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 18,
  },
  mainColumn: {
    flex: 1.65,
    minWidth: 0,
  },
  sideColumn: {
    flex: 1,
    gap: 18,
    maxWidth: 360,
    minWidth: 280,
  },
  emptyPreviewGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  emptyPreviewGridCompact: {
    flexDirection: 'column',
  },
  emptyPreviewCard: {
    backgroundColor: 'rgba(255,255,255,0.66)',
    borderColor: 'rgba(214, 224, 234, 0.82)',
    borderRadius: 18,
    borderWidth: 1,
    flex: 1,
    gap: 6,
    minWidth: 0,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  emptyPreviewLabel: {
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontSize: 13,
    fontWeight: '700',
  },
  emptyPreviewDescription: {
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.body,
    fontSize: 12,
    lineHeight: 18,
  },
  emptyActionStack: {
    gap: 10,
  },
  emptyActionCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.76)',
    borderColor: 'rgba(214, 224, 234, 0.88)',
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  emptyActionIconWrap: {
    alignItems: 'center',
    backgroundColor: tokens.colors.brandSoft,
    borderRadius: 14,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  emptyActionText: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  emptyActionEyebrow: {
    color: tokens.colors.inkMute,
    fontFamily: tokens.typography.body,
    fontSize: 11,
  },
  emptyActionTitle: {
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontSize: 15,
    fontWeight: '700',
  },
  emptyActionDescription: {
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.body,
    fontSize: 12,
    lineHeight: 18,
  },
  overviewLabel: {
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.body,
    fontSize: 13,
  },
  overviewValue: {
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontSize: 34,
    fontWeight: '800',
  },
  overviewValueNarrow: {
    fontSize: 30,
  },
  overviewHighlightGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  overviewHighlightGridCompact: {
    flexDirection: 'column',
  },
  overviewHighlightCard: {
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderColor: 'rgba(214, 224, 234, 0.84)',
    borderRadius: 18,
    borderWidth: 1,
    flex: 1,
    gap: 6,
    minWidth: 0,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  overviewHighlightCardBrand: {
    backgroundColor: tokens.colors.brandSoft,
    borderColor: 'rgba(37, 99, 235, 0.12)',
  },
  overviewHighlightCardDanger: {
    backgroundColor: tokens.colors.dangerSoft,
    borderColor: 'rgba(225, 29, 72, 0.12)',
  },
  overviewHighlightLabel: {
    color: tokens.colors.inkMute,
    fontFamily: tokens.typography.body,
    fontSize: 12,
  },
  overviewHighlightValue: {
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontSize: 16,
    fontWeight: '700',
  },
  overviewHighlightValueNegative: {
    color: tokens.colors.danger,
  },
  overviewNarrative: {
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.body,
    fontSize: 14,
    lineHeight: 22,
  },
  overviewMetaWrap: {
    flexDirection: 'row',
    gap: 8,
  },
  overviewMetaWrapCompact: {
    flexDirection: 'column',
  },
  overviewMetaPill: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.64)',
    borderColor: 'rgba(214, 224, 234, 0.82)',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  overviewMetaText: {
    color: tokens.colors.inkSoft,
    flex: 1,
    fontFamily: tokens.typography.body,
    fontSize: 12,
  },
  allocationBoard: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 18,
  },
  allocationBoardCompact: {
    flexDirection: 'column',
    gap: 14,
  },
  allocationLegendWrap: {
    flex: 1,
    gap: 12,
    minWidth: 0,
    width: '100%',
  },
  allocationSnapshotGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  allocationSnapshotGridCompact: {
    flexDirection: 'column',
  },
  allocationSnapshotCard: {
    backgroundColor: tokens.colors.surfaceMuted,
    borderRadius: 18,
    flex: 1,
    gap: 4,
    minWidth: 0,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  allocationSnapshotLabel: {
    color: tokens.colors.inkMute,
    fontFamily: tokens.typography.body,
    fontSize: 12,
  },
  allocationSnapshotValue: {
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontSize: 16,
    fontWeight: '700',
  },
  allocationSnapshotMeta: {
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.body,
    fontSize: 12,
    lineHeight: 18,
  },
  allocationBarSection: {
    gap: 10,
  },
  analyticsSection: {
    gap: 12,
  },
  analyticsLabel: {
    color: tokens.colors.inkMute,
    fontFamily: tokens.typography.body,
    fontSize: 13,
  },
  helperText: {
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.body,
    fontSize: 13,
    lineHeight: 20,
  },
  sideNote: {
    color: tokens.colors.inkMute,
    fontFamily: tokens.typography.body,
    fontSize: 12,
    lineHeight: 18,
  },
  performanceInsightGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  performanceInsightGridCompact: {
    flexDirection: 'column',
  },
  performanceInsightCard: {
    backgroundColor: tokens.colors.surfaceMuted,
    borderRadius: 20,
    flex: 1,
    gap: 6,
    minWidth: 0,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  performanceLabel: {
    color: tokens.colors.inkMute,
    fontFamily: tokens.typography.body,
    fontSize: 12,
  },
  performanceTicker: {
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontSize: 22,
    fontWeight: '800',
  },
  performanceValue: {
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontSize: 14,
    fontWeight: '700',
  },
  performanceValuePositive: {
    color: tokens.colors.positive,
  },
  performanceValueNegative: {
    color: tokens.colors.danger,
  },
  performanceMeta: {
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.body,
    fontSize: 13,
    lineHeight: 20,
  },
  routineSnapshotGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  routineSnapshotGridCompact: {
    flexDirection: 'column',
  },
  routineSnapshotCard: {
    backgroundColor: tokens.colors.surfaceMuted,
    borderRadius: 18,
    flex: 1,
    gap: 4,
    minWidth: 0,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  routineSnapshotLabel: {
    color: tokens.colors.inkMute,
    fontFamily: tokens.typography.body,
    fontSize: 12,
  },
  routineSnapshotValue: {
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontSize: 18,
    fontWeight: '700',
  },
  routineSnapshotMeta: {
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.body,
    fontSize: 12,
    lineHeight: 18,
  },
  holdingCard: {
    gap: 14,
  },
  holdingHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  holdingHeaderCompact: {
    flexDirection: 'column',
  },
  holdingText: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  holdingName: {
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontSize: 16,
    fontWeight: '800',
  },
  holdingSubline: {
    color: tokens.colors.inkMute,
    fontFamily: tokens.typography.body,
    fontSize: 12,
  },
  holdingWeightCard: {
    alignItems: 'flex-end',
    backgroundColor: tokens.colors.brandSoft,
    borderRadius: 16,
    gap: 2,
    minWidth: 86,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  holdingWeightCardCompact: {
    alignItems: 'flex-start',
  },
  holdingWeightLabel: {
    color: tokens.colors.inkMute,
    fontFamily: tokens.typography.body,
    fontSize: 11,
  },
  holdingWeightValue: {
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontSize: 15,
    fontWeight: '700',
  },
  holdingMetricRail: {
    backgroundColor: tokens.colors.surfaceMuted,
    borderRadius: 18,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  holdingMetricRailNarrow: {
    flexDirection: 'column',
  },
  holdingMetricItem: {
    flex: 1,
    gap: 4,
    minWidth: 0,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  holdingMetricItemPrimary: {
    flex: 1.2,
  },
  holdingMetricDivider: {
    borderLeftColor: 'rgba(214, 224, 234, 0.82)',
    borderLeftWidth: 1,
  },
  holdingMetricDividerNarrow: {
    borderLeftWidth: 0,
    borderTopColor: 'rgba(214, 224, 234, 0.82)',
    borderTopWidth: 1,
  },
  holdingStatLabel: {
    color: tokens.colors.inkMute,
    fontFamily: tokens.typography.body,
    fontSize: 12,
  },
  holdingMetricValuePrimary: {
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontSize: 16,
    fontWeight: '700',
  },
  holdingStatValue: {
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontSize: 15,
    fontWeight: '700',
  },
  holdingStatValueNegative: {
    color: tokens.colors.danger,
  },
  holdingStatMeta: {
    color: tokens.colors.positive,
    fontFamily: tokens.typography.body,
    fontSize: 12,
  },
  holdingStatMetaNegative: {
    color: tokens.colors.danger,
  },
  managementStack: {
    backgroundColor: 'rgba(255,255,255,0.44)',
    borderColor: 'rgba(214, 224, 234, 0.82)',
    borderRadius: 18,
    borderWidth: 1,
  },
  managementHelperText: {
    color: tokens.colors.inkMute,
    fontFamily: tokens.typography.body,
    fontSize: 12,
    lineHeight: 18,
  },
  managementTile: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  managementTileDivider: {
    borderBottomColor: 'rgba(214, 224, 234, 0.82)',
    borderBottomWidth: 1,
  },
  managementIconWrap: {
    alignItems: 'center',
    backgroundColor: 'rgba(214, 224, 234, 0.46)',
    borderRadius: 12,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  managementText: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  managementLabelRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  managementLabel: {
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontSize: 14,
    fontWeight: '700',
  },
  managementMeta: {
    color: tokens.colors.inkMute,
    fontFamily: tokens.typography.body,
    fontSize: 11,
  },
  managementDescription: {
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.body,
    fontSize: 12,
    lineHeight: 18,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(214, 224, 234, 0.8)',
    marginBottom: 16,
    paddingBottom: 16,
  },
  buttonPressed: {
    opacity: 0.86,
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 22,
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.body,
  },
  supportTitle: {
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontSize: 16,
    fontWeight: '700',
  },
  supportDescription: {
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.body,
    fontSize: 13,
    lineHeight: 20,
  },
});
