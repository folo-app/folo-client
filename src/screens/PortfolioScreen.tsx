import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  AllocationBar,
  AllocationDonutChart,
  AllocationLegendGrid,
  MonthlyDividendChart,
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
import { usePortfolioData } from '../hooks/useFoloData';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import {
  formatCompactCurrency,
  formatCurrency,
  formatDateLabel,
  formatPercent,
  formatSignedCurrency,
} from '../lib/format';
import type { RootStackParamList } from '../navigation/types';
import { tokens } from '../theme/tokens';

const ALLOCATION_PALETTE = ['#2563EB', '#0F766E', '#7C3AED', '#F59E0B', '#E11D48', '#14B8A6'];
const SECTOR_PALETTE = ['#E11D48', '#F59E0B', '#4F46E5', '#0F766E', '#14B8A6', '#64748B'];

export function PortfolioScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isCompact } = useResponsiveLayout();
  const portfolio = usePortfolioData();

  const allocationItems = [...portfolio.data.holdings]
    .sort((left, right) => (right.totalValue ?? 0) - (left.totalValue ?? 0))
    .map((holding, index) => ({
      key: `${holding.holdingId}`,
      label: holding.name,
      ratio: holding.weight,
      value: formatCurrency(holding.totalValue, holding.market),
      meta: `${holding.ticker} · ${holding.market}`,
      color: ALLOCATION_PALETTE[index % ALLOCATION_PALETTE.length],
    }));
  const topHoldings = allocationItems.slice(0, 6);
  const remainingHoldingCount = Math.max(portfolio.data.holdings.length - topHoldings.length, 0);
  const sectorAllocationItems = portfolio.data.sectorAllocations.map((item, index) => ({
    key: item.key,
    label: item.label,
    ratio: item.weight,
    value: item.value !== null ? formatCurrency(item.value) : undefined,
    color: SECTOR_PALETTE[index % SECTOR_PALETTE.length],
  }));
  const monthlyDividendItems = portfolio.data.monthlyDividendForecasts.map((item) => ({
    key: `month-${item.month}`,
    label: item.label,
    amount: item.amount,
  }));
  const hasDividendProjection = monthlyDividendItems.some((item) => item.amount > 0);

  return (
    <Page eyebrow="Portfolio" title="내 포트폴리오">
      <DataStatusCard error={portfolio.error} loading={portfolio.loading} />

      <SurfaceCard tone="hero">
        <Text style={styles.summaryLabel}>총 평가금액</Text>
        <Text style={styles.summaryValue}>{formatCurrency(portfolio.data.totalValue)}</Text>
        <Text style={styles.summaryDelta}>
          {formatSignedCurrency(portfolio.data.totalReturn)} ·{' '}
          {formatPercent(portfolio.data.totalReturnRate)}
        </Text>
        <MetricGrid>
          <MetricBadge
            label="투자원금"
            value={formatCurrency(portfolio.data.totalInvested)}
            tone="positive"
          />
          <MetricBadge
            label="오늘 등락"
            value={formatSignedCurrency(portfolio.data.dayReturn)}
            tone="brand"
          />
          <MetricBadge label="보유 종목" value={`${portfolio.data.holdings.length}개`} />
          <MetricBadge
            label="최근 반영"
            value={portfolio.data.syncedAt ? formatDateLabel(portfolio.data.syncedAt) : '기록 없음'}
          />
        </MetricGrid>
      </SurfaceCard>

      {portfolio.data.holdings.length === 0 ? (
        <SurfaceCard>
          <SectionHeading title="보유 종목이 아직 없습니다" />
          <Text style={styles.emptyText}>
            첫 종목을 추가하면 자산 구성과 수익률이 이 화면에서 바로 정리됩니다.
          </Text>
          <View style={styles.actionStack}>
            <PrimaryButton
              label="포트폴리오 직접 추가"
              onPress={() => navigation.navigate('PortfolioSetup')}
            />
            <PrimaryButton
              label="CSV / OCR 가져오기"
              onPress={() => navigation.navigate('ImportOnboarding')}
              variant="secondary"
            />
          </View>
        </SurfaceCard>
      ) : (
        <>
          <SurfaceCard>
            <SectionHeading title="자산 구성" description="보유 종목, 섹터, 예상 배당을 함께 봅니다." />
            <View style={[styles.allocationBoard, isCompact && styles.allocationBoardCompact]}>
              <AllocationDonutChart
                items={allocationItems}
                centerLabel={
                  isCompact
                    ? formatCompactCurrency(portfolio.data.totalValue)
                    : formatCurrency(portfolio.data.totalValue)
                }
                centerSubLabel="총 평가금액"
                size={isCompact ? 148 : 220}
                strokeWidth={isCompact ? 20 : 28}
              />
              <View style={styles.allocationLegendWrap}>
                <AllocationLegendGrid items={topHoldings} columns={isCompact ? 1 : 2} />
              </View>
            </View>
            <View style={styles.analyticsSection}>
              <Text style={styles.analyticsLabel}>예상 배당금</Text>
              {hasDividendProjection ? (
                <MonthlyDividendChart items={monthlyDividendItems} />
              ) : (
                <Text style={styles.helperText}>
                  배당 수익률과 지급 월 데이터가 있는 종목부터 표시됩니다.
                </Text>
              )}
            </View>
            <View style={styles.analyticsSection}>
              <Text style={styles.analyticsLabel}>섹터 / 현금 구성</Text>
              <View style={styles.allocationBarSection}>
                <AllocationBar items={sectorAllocationItems} height={18} />
                <AllocationLegendGrid items={sectorAllocationItems} columns={isCompact ? 1 : 2} />
              </View>
            </View>
            {remainingHoldingCount > 0 ? (
              <Text style={styles.moreText}>외 {remainingHoldingCount}개 종목</Text>
            ) : null}
          </SurfaceCard>

          <SurfaceCard>
            <SectionHeading
              title="보유 종목"
              description="평가금액, 손익, 평균단가를 한 번에 확인합니다."
            />
            {portfolio.data.holdings.map((holding, index) => (
              <Pressable
                key={holding.holdingId}
                onPress={() =>
                  navigation.navigate('HoldingDetail', { holdingId: holding.holdingId })
                }
                style={[
                  styles.holdingCard,
                  index < portfolio.data.holdings.length - 1 && styles.divider,
                ]}
              >
                <View style={[styles.holdingHeader, isCompact && styles.holdingHeaderCompact]}>
                  <View style={styles.holdingText}>
                    <Text style={styles.holdingTicker}>{holding.ticker}</Text>
                    <Text style={styles.holdingName}>{holding.name}</Text>
                  </View>
                  <View style={styles.weightPill}>
                    <Text style={styles.weightPillText}>
                      {holding.weight > 1
                        ? `${holding.weight.toFixed(1)}%`
                        : `${(holding.weight * 100).toFixed(1)}%`}
                    </Text>
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
                    <Text style={styles.holdingStatValue}>
                      {formatSignedCurrency(holding.returnAmount, holding.market)}
                    </Text>
                    <Text style={styles.holdingStatMeta}>
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

          <SurfaceCard tone="muted">
            <SectionHeading title="포트폴리오 관리" />
            <View style={styles.actionStack}>
              <PrimaryButton
                label="직접 추가"
                onPress={() => navigation.navigate('PortfolioSetup')}
              />
              <PrimaryButton
                label="CSV / OCR 가져오기"
                onPress={() => navigation.navigate('ImportOnboarding')}
                variant="secondary"
              />
            </View>
          </SurfaceCard>
        </>
      )}
    </Page>
  );
}

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
  summaryDelta: {
    fontSize: 16,
    color: tokens.colors.positive,
    fontFamily: tokens.typography.heading,
    fontWeight: '700',
  },
  actionStack: {
    gap: 10,
  },
  moreText: {
    fontSize: 12,
    color: tokens.colors.inkMute,
    fontFamily: tokens.typography.body,
  },
  allocationBoard: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 18,
  },
  allocationBoardCompact: {
    alignItems: 'center',
    gap: 12,
  },
  allocationLegendWrap: {
    flex: 1,
    minWidth: 0,
    width: '100%',
  },
  allocationBarSection: {
    gap: 10,
  },
  allocationBarLabel: {
    fontSize: 12,
    color: tokens.colors.inkMute,
    fontFamily: tokens.typography.body,
  },
  analyticsSection: {
    gap: 12,
  },
  analyticsLabel: {
    fontSize: 13,
    color: tokens.colors.inkMute,
    fontFamily: tokens.typography.body,
  },
  helperText: {
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.body,
    fontSize: 13,
    lineHeight: 20,
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
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(214, 224, 234, 0.8)',
    paddingBottom: 16,
    marginBottom: 16,
  },
  holdingText: {
    gap: 6,
    flex: 1,
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
  holdingStatMeta: {
    color: tokens.colors.positive,
    fontFamily: tokens.typography.body,
    fontSize: 12,
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 22,
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.body,
  },
});
