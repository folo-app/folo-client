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
import {
  MetricBadge,
  MetricGrid,
  Page,
  PrimaryButton,
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
  formatRelativeDate,
  formatSignedCurrency,
  formatWeight,
} from '../lib/format';
import type { RootStackParamList } from '../navigation/types';
import { tokens } from '../theme/tokens';

const ALLOCATION_PALETTE = ['#2563EB', '#0F766E', '#7C3AED', '#F59E0B', '#E11D48', '#14B8A6'];
const SECTOR_PALETTE = ['#E11D48', '#F59E0B', '#4F46E5', '#0F766E', '#14B8A6', '#64748B'];

export function PortfolioScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isCompact, isLarge } = useResponsiveLayout();
  const portfolio = usePortfolioData();
  const reminders = useRemindersData();
  const myTrades = useMyTradesData();

  const holdings = [...portfolio.data.holdings].sort(
    (left, right) => (right.totalValue ?? 0) - (left.totalValue ?? 0),
  );
  const hasHoldings = holdings.length > 0;
  const showEmptyState = !portfolio.loading && !hasHoldings;
  const allocationItems = holdings.map((holding, index) => ({
    key: `${holding.holdingId}`,
    label: holding.name,
    ratio: holding.weight,
    value: formatCurrency(holding.totalValue, holding.market),
    meta: `${holding.ticker} · ${holding.market}`,
    color: ALLOCATION_PALETTE[index % ALLOCATION_PALETTE.length],
  }));
  const topHoldings = allocationItems.slice(0, 6);
  const remainingHoldingCount = Math.max(holdings.length - topHoldings.length, 0);
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
  const recentTrade = trades[0] ?? null;
  const monthlyTradeCount = trades.filter((item) =>
    isSameCalendarMonth(new Date(item.tradedAt), new Date()),
  ).length;
  const recentWeekActivity = buildWeeklyTradeActivity(trades);
  const activeWeeks = recentWeekActivity.filter((item) => item.count > 0).length;
  const streakWeeks = calculateTrailingWeekStreak(recentWeekActivity);
  const routineLoading = reminders.loading || myTrades.loading;
  const routineError = reminders.error ?? myTrades.error;

  const allocationCard = (
    <SurfaceCard>
      <SectionHeading
        title="자산 구성"
        description="비중, 섹터, 현금 구성을 먼저 읽습니다."
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
          size={isCompact ? 156 : 216}
          strokeWidth={isCompact ? 20 : 26}
        />
        <View style={styles.allocationLegendWrap}>
          <Text style={styles.analyticsLabel}>상위 비중 종목</Text>
          <AllocationLegendGrid items={topHoldings} columns={isCompact ? 1 : 2} />
          {remainingHoldingCount > 0 ? (
            <Text style={styles.helperText}>외 {remainingHoldingCount}개 종목이 더 있습니다.</Text>
          ) : null}
        </View>
      </View>
      <View style={styles.analyticsSection}>
        <Text style={styles.analyticsLabel}>섹터 / 현금 구성</Text>
        <View style={styles.allocationBarSection}>
          <AllocationBar items={compositionItems} height={18} />
          <AllocationLegendGrid items={compositionItems} columns={isCompact ? 1 : 2} />
        </View>
      </View>
    </SurfaceCard>
  );

  const performanceCard = (
    <SurfaceCard>
      <SectionHeading
        title="성과와 현금흐름"
        description="배당 흐름과 수익 기여 종목을 함께 봅니다."
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
            ? `다음 일정 ${formatShortDate(activeReminders[0].nextReminderDate)}`
            : '반복 매수와 실제 기록을 함께 점검합니다.'
        }
        actionLabel="루틴 관리"
        onActionPress={() => navigation.navigate('Reminders')}
      />
      <DataStatusCard error={routineError} loading={routineLoading} variant="inline" />
      <MetricGrid>
        <MetricBadge label="활성 루틴" value={`${activeReminders.length}개`} />
        <MetricBadge label="이번 달 기록" value={`${monthlyTradeCount}건`} tone="brand" />
        <MetricBadge
          label="연속 주간"
          value={`${streakWeeks}주`}
          tone={streakWeeks > 0 ? 'positive' : 'default'}
        />
        <MetricBadge
          label="최근 거래"
          value={recentTrade ? formatRelativeDate(recentTrade.tradedAt) : '기록 없음'}
        />
      </MetricGrid>

      <View style={styles.analyticsSection}>
        <Text style={styles.analyticsLabel}>최근 6주 투자 기록</Text>
        {activeWeeks > 0 ? (
          <View style={styles.weeklyChart}>
            {recentWeekActivity.map((item) => (
              <View key={item.key} style={styles.weeklyColumn}>
                <Text style={styles.weeklyCount}>{item.count > 0 ? `${item.count}` : ''}</Text>
                <View style={styles.weeklyTrack}>
                  <View
                    style={[
                      styles.weeklyBar,
                      item.isCurrent && styles.weeklyBarCurrent,
                      {
                        height: 14 + (item.count / Math.max(...recentWeekActivity.map((entry) => entry.count), 1)) * 54,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.weeklyLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.helperText}>최근 6주간 기록된 거래가 아직 없습니다.</Text>
        )}
      </View>

      <View style={styles.analyticsSection}>
        <Text style={styles.analyticsLabel}>다음 루틴</Text>
        {activeReminders.length === 0 ? (
          <Text style={styles.helperText}>
            반복 투자 루틴을 만들면 다음 일정과 금액을 이 영역에서 바로 확인할 수 있습니다.
          </Text>
        ) : (
          activeReminders.slice(0, 2).map((item, index) => (
            <View
              key={item.reminderId}
              style={[
                styles.routineRow,
                index < Math.min(activeReminders.length, 2) - 1 && styles.divider,
              ]}
            >
              <View style={styles.routineText}>
                <Text style={styles.routineTitle}>
                  {item.ticker} · {item.name}
                </Text>
                <Text style={styles.routineMeta}>
                  매월 {item.dayOfMonth}일 · {formatCurrency(item.amount)}
                </Text>
              </View>
              <Text style={styles.routineDate}>{formatShortDate(item.nextReminderDate)}</Text>
            </View>
          ))
        )}
      </View>
    </SurfaceCard>
  );

  const holdingsCard = (
    <SurfaceCard>
      <SectionHeading
        title="보유 종목"
        description="성과를 확인한 뒤 개별 종목 상세로 이어집니다."
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
              <Text style={styles.holdingTicker}>{holding.ticker}</Text>
              <Text style={styles.holdingName}>{holding.name}</Text>
              <Text style={styles.holdingMeta}>
                {holding.market} · {holding.sectorName ?? assetTypeLabel(holding.assetType)}
              </Text>
            </View>
            <View style={styles.weightPill}>
              <Text style={styles.weightPillText}>{formatWeight(holding.weight)}</Text>
            </View>
          </View>
          <View style={[styles.holdingStatsRow, isCompact && styles.holdingStatsRowCompact]}>
            <View style={styles.holdingStat}>
              <Text style={styles.holdingStatLabel}>평가금액</Text>
              <Text style={styles.holdingStatValue}>
                {formatCurrency(holding.totalValue, holding.market)}
              </Text>
            </View>
            <View style={styles.holdingStat}>
              <Text style={styles.holdingStatLabel}>손익</Text>
              <Text
                style={[
                  styles.holdingStatValue,
                  (holding.returnAmount ?? 0) < 0 && styles.holdingStatValueNegative,
                ]}
              >
                {formatSignedCurrency(holding.returnAmount, holding.market)}
              </Text>
              <Text
                style={[
                  styles.holdingStatMeta,
                  holding.returnRate < 0 && styles.holdingStatMetaNegative,
                ]}
              >
                {formatPercent(holding.returnRate)}
              </Text>
            </View>
            <View style={styles.holdingStat}>
              <Text style={styles.holdingStatLabel}>평균단가</Text>
              <Text style={styles.holdingStatValue}>
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
      description: '연동 상태를 확인하고 자동 동기화를 준비합니다.',
      onPress: () => navigation.navigate('KisConnect'),
    },
    {
      key: 'reminders',
      icon: 'repeat-outline' as const,
      label: '루틴 관리',
      description: '반복 투자 일정과 금액을 조정합니다.',
      onPress: () => navigation.navigate('Reminders'),
    },
  ];

  const managementCard = (
    <SurfaceCard tone="muted">
      <SectionHeading
        title="관리 작업"
        description="분석이 끝난 뒤 필요한 입력과 연동만 아래에 둡니다."
      />
      <View style={styles.managementStack}>
        {managementActions.map((action) => (
          <Pressable
            key={action.key}
            accessibilityRole="button"
            onPress={action.onPress}
            style={({ pressed }) => [
              styles.managementTile,
              pressed && styles.buttonPressed,
            ]}
          >
            <View style={styles.managementIconWrap}>
              <Ionicons color={tokens.colors.navy} name={action.icon} size={18} />
            </View>
            <View style={styles.managementText}>
              <Text style={styles.managementLabel}>{action.label}</Text>
              <Text style={styles.managementDescription}>{action.description}</Text>
            </View>
          </Pressable>
        ))}
      </View>
    </SurfaceCard>
  );

  return (
    <Page
      eyebrow="Portfolio"
      title="내 포트폴리오"
      subtitle="자산 구성, 성과, 루틴을 한 화면에서 읽습니다."
    >
      <DataStatusCard error={portfolio.error} loading={portfolio.loading} />

      {showEmptyState ? (
        <SurfaceCard tone="hero">
          <SectionHeading
            title="보유 종목이 아직 없습니다"
            description="첫 종목을 추가하면 자산 구성과 수익률이 정리됩니다."
          />
          <Text style={styles.emptyText}>
            첫 추가와 거래 기록은 하단 + 버튼에서 진행하고, 이 화면은 이후 분석과 루틴 확인용으로 유지합니다.
          </Text>
          <View style={styles.actionStack}>
            <PrimaryButton
              label="KIS 연결"
              onPress={() => navigation.navigate('KisConnect')}
              variant="secondary"
            />
          </View>
        </SurfaceCard>
      ) : null}

      {hasHoldings ? (
        <>
          {isLarge ? (
            <View style={styles.contentColumns}>
              <View style={styles.mainColumn}>
                {allocationCard}
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
              {allocationCard}
              {performanceCard}
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

function buildWeeklyTradeActivity(trades: { tradedAt: string }[], weeks = 6) {
  const currentWeekStart = startOfWeek(new Date());

  return Array.from({ length: weeks }, (_, index) => {
    const offset = weeks - 1 - index;
    const start = addDays(currentWeekStart, -7 * offset);
    const end = addDays(start, 7);
    const count = trades.filter((item) => {
      const tradedAt = new Date(item.tradedAt).getTime();
      return tradedAt >= start.getTime() && tradedAt < end.getTime();
    }).length;

    return {
      key: start.toISOString(),
      label: `${start.getMonth() + 1}/${start.getDate()}`,
      count,
      isCurrent: offset === 0,
    };
  });
}

function calculateTrailingWeekStreak(items: { count: number }[]) {
  let streak = 0;

  for (let index = items.length - 1; index >= 0; index -= 1) {
    if (items[index].count > 0) {
      streak += 1;
      continue;
    }
    break;
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
  actionStack: {
    gap: 10,
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
  weeklyChart: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  weeklyColumn: {
    alignItems: 'center',
    flex: 1,
    gap: 6,
  },
  weeklyCount: {
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontSize: 12,
    fontWeight: '700',
    minHeight: 16,
  },
  weeklyTrack: {
    alignItems: 'center',
    backgroundColor: 'rgba(214, 224, 234, 0.5)',
    borderRadius: 999,
    height: 84,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    width: '100%',
  },
  weeklyBar: {
    backgroundColor: tokens.colors.navy,
    borderRadius: 999,
    width: '100%',
  },
  weeklyBarCurrent: {
    backgroundColor: tokens.colors.brandStrong,
  },
  weeklyLabel: {
    color: tokens.colors.inkMute,
    fontFamily: tokens.typography.body,
    fontSize: 11,
  },
  routineRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  routineText: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  routineTitle: {
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontSize: 14,
    fontWeight: '700',
  },
  routineMeta: {
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.body,
    fontSize: 13,
  },
  routineDate: {
    color: tokens.colors.inkMute,
    fontFamily: tokens.typography.body,
    fontSize: 12,
  },
  holdingCard: {
    gap: 14,
  },
  holdingHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  holdingHeaderCompact: {
    alignItems: 'flex-start',
    flexDirection: 'column',
  },
  holdingText: {
    flex: 1,
    gap: 6,
    minWidth: 0,
  },
  holdingTicker: {
    fontSize: 17,
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontWeight: '800',
  },
  holdingName: {
    fontSize: 13,
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.body,
  },
  holdingMeta: {
    color: tokens.colors.inkMute,
    fontFamily: tokens.typography.body,
    fontSize: 12,
  },
  weightPill: {
    backgroundColor: tokens.colors.brandSoft,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  weightPillText: {
    color: tokens.colors.brandStrong,
    fontFamily: tokens.typography.heading,
    fontSize: 13,
    fontWeight: '700',
  },
  holdingStatsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  holdingStatsRowCompact: {
    flexDirection: 'column',
  },
  holdingStat: {
    backgroundColor: tokens.colors.surfaceMuted,
    borderRadius: 18,
    flex: 1,
    gap: 4,
    minWidth: 0,
    padding: 14,
  },
  holdingStatLabel: {
    color: tokens.colors.inkMute,
    fontFamily: tokens.typography.body,
    fontSize: 12,
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
    gap: 12,
  },
  managementTile: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.74)',
    borderColor: 'rgba(214, 224, 234, 0.88)',
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  managementIconWrap: {
    alignItems: 'center',
    backgroundColor: tokens.colors.brandSoft,
    borderRadius: 14,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  managementText: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  managementLabel: {
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontSize: 14,
    fontWeight: '700',
  },
  managementDescription: {
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.body,
    fontSize: 13,
    lineHeight: 20,
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
});
