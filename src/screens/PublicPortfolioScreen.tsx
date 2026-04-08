import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { StyleSheet, Text, View } from 'react-native';

import type { PortfolioHoldingItem } from '../api/contracts';
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
  PageBackButton,
  SectionHeading,
  SurfaceCard,
} from '../components/ui';
import { useUserPortfolioData } from '../hooks/useFoloData';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import {
  currencyLabel,
  formatCompactCurrency,
  formatCurrency,
  formatDateLabel,
  formatPercent,
  formatSignedCurrency,
  formatWeight,
} from '../lib/format';
import type { RootStackParamList } from '../navigation/types';
import { tokens } from '../theme/tokens';

const HOLDING_PALETTE = ['#2563EB', '#0F766E', '#7C3AED', '#F59E0B', '#E11D48', '#14B8A6'];
const SECTOR_PALETTE = ['#E11D48', '#F59E0B', '#4F46E5', '#0F766E', '#14B8A6', '#64748B'];

export function PublicPortfolioScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'PublicPortfolio'>>();
  const { isCompact, isNarrow } = useResponsiveLayout();
  const portfolio = useUserPortfolioData(route.params.userId);
  const title = route.params.nickname
    ? `${route.params.nickname}님의 포트폴리오`
    : '공개 포트폴리오';
  const sortedHoldings = [...portfolio.data.holdings]
    .sort(
      (left, right) => (holdingDisplayTotalValue(right) ?? 0) - (holdingDisplayTotalValue(left) ?? 0),
    );
  const allocationItems = sortedHoldings.map((holding, index) => ({
      key: `${holding.holdingId}`,
      label: holding.name,
      ratio: holding.weight,
      value: formatCurrency(holdingDisplayTotalValue(holding), portfolio.data.displayCurrency),
      meta: `${holding.ticker} · ${holding.market}`,
      color: HOLDING_PALETTE[index % HOLDING_PALETTE.length],
    }));
  const sectorAllocationItems = portfolio.data.sectorAllocations.map((item, index) => ({
    key: item.key,
    label: item.label,
    ratio: item.weight,
    value: item.value !== null ? formatCurrency(item.value, portfolio.data.displayCurrency) : undefined,
    color: SECTOR_PALETTE[index % SECTOR_PALETTE.length],
  }));
  const monthlyDividendItems = portfolio.data.monthlyDividendForecasts.map((item) => ({
    key: `month-${item.month}`,
    label: item.label,
    amount: item.amount,
  }));
  const hasDividendProjection = monthlyDividendItems.some((item) => item.amount > 0);

  return (
    <Page
      eyebrow="Public Portfolio"
      title={title}
      leading={<PageBackButton />}
    >
      <DataStatusCard error={portfolio.error} loading={portfolio.loading} />

      {portfolio.error?.includes('조회할 수 없습니다') ? (
        <SurfaceCard>
          <Text style={styles.emptyText}>현재 이 포트폴리오는 열람할 수 없습니다.</Text>
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
                    ? formatCompactCurrency(portfolio.data.totalValue, portfolio.data.displayCurrency)
                    : formatCurrency(portfolio.data.totalValue, portfolio.data.displayCurrency)
                }
                centerSubLabel="공개 자산"
                size={isCompact ? 148 : 220}
                strokeWidth={isCompact ? 20 : 28}
              />
              <View style={styles.allocationLegendWrap}>
                <AllocationLegendGrid
                  items={allocationItems.slice(0, 6)}
                  columns={isCompact ? 1 : 2}
                />
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
                <AllocationLegendGrid
                  items={sectorAllocationItems}
                  columns={isCompact ? 1 : 2}
                />
              </View>
            </View>
          </SurfaceCard>

          <SurfaceCard>
            <SectionHeading
              title="성과 스냅샷"
              description={`최근 반영 ${portfolio.data.syncedAt ? formatDateLabel(portfolio.data.syncedAt) : '기록 없음'}`}
            />
            <Text style={styles.summaryLabel}>
              총 평가금액 · {currencyLabel(portfolio.data.displayCurrency)}
            </Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(portfolio.data.totalValue, portfolio.data.displayCurrency)}
            </Text>
            <Text
              style={[
                styles.summaryDelta,
                portfolio.data.totalReturnRate < 0 && styles.summaryDeltaNegative,
              ]}
            >
              {formatPercent(portfolio.data.totalReturnRate)}
            </Text>
            <MetricGrid>
              <MetricBadge
                label="평가손익"
                value={formatSignedCurrency(portfolio.data.totalReturn, portfolio.data.displayCurrency)}
                tone={(portfolio.data.totalReturn ?? 0) >= 0 ? 'positive' : 'danger'}
              />
              <MetricBadge
                label="오늘 등락"
                value={formatSignedCurrency(portfolio.data.dayReturn, portfolio.data.displayCurrency)}
                tone={(portfolio.data.dayReturn ?? 0) >= 0 ? 'brand' : 'danger'}
              />
            </MetricGrid>
          </SurfaceCard>

          <SurfaceCard>
            <SectionHeading
              title="보유 종목"
              description="비중, 평가금액, 손익, 평균단가를 같은 규칙으로 정리합니다."
            />
            {sortedHoldings.length === 0 ? (
              <Text style={styles.emptyText}>표시할 보유 종목이 없습니다.</Text>
            ) : (
              sortedHoldings.map((holding, index) => (
                <View
                  key={holding.holdingId}
                  style={[
                    styles.holdingCard,
                    index < sortedHoldings.length - 1 && styles.divider,
                  ]}
                >
                  <View style={styles.holdingHeader}>
                    <View style={styles.holdingText}>
                      <Text ellipsizeMode="tail" numberOfLines={1} style={styles.holdingName}>
                        {holding.name}
                      </Text>
                      <Text ellipsizeMode="tail" numberOfLines={1} style={styles.holdingSubline}>
                        {holding.ticker} · {holding.market} ·{' '}
                        {holding.sectorName ?? (holding.assetType === 'ETF' ? 'ETF' : '주식')}
                      </Text>
                    </View>
                    <View style={styles.holdingWeightCard}>
                      <Text style={styles.holdingWeightLabel}>비중</Text>
                      <Text style={styles.holdingWeightValue}>{formatWeight(holding.weight)}</Text>
                    </View>
                  </View>
                  {isCompact ? (
                    <View style={styles.holdingCompactMetrics}>
                      <View style={styles.holdingCompactMetricRow}>
                        <View style={styles.holdingCompactMetricBlock}>
                          <Text style={styles.holdingStatLabel}>평가금액</Text>
                          <Text
                            adjustsFontSizeToFit
                            minimumFontScale={0.75}
                            numberOfLines={1}
                            style={styles.holdingMetricValuePrimary}
                          >
                            {formatCurrency(
                              holdingDisplayTotalValue(holding),
                              portfolio.data.displayCurrency,
                            )}
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.holdingCompactMetricBlock,
                            styles.holdingCompactMetricBlockAlignEnd,
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
                            {formatSignedCurrency(
                              holdingDisplayReturnAmount(holding),
                              portfolio.data.displayCurrency,
                            )}
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
                      </View>
                      <View style={styles.holdingCompactMetaRow}>
                        <Text style={styles.holdingCompactMetaLabel}>평균단가</Text>
                        <Text numberOfLines={1} style={styles.holdingCompactMetaValue}>
                          {formatCurrency(holding.avgPrice, holding.market)}
                        </Text>
                      </View>
                    </View>
                  ) : (
                    <View style={[styles.holdingMetricRail, isNarrow && styles.holdingMetricRailNarrow]}>
                      <View style={[styles.holdingMetricItem, styles.holdingMetricItemPrimary]}>
                        <Text style={styles.holdingStatLabel}>평가금액</Text>
                        <Text
                          adjustsFontSizeToFit
                          minimumFontScale={0.75}
                          numberOfLines={1}
                          style={styles.holdingMetricValuePrimary}
                        >
                          {formatCurrency(
                            holdingDisplayTotalValue(holding),
                            portfolio.data.displayCurrency,
                          )}
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
                          {formatSignedCurrency(
                            holdingDisplayReturnAmount(holding),
                            portfolio.data.displayCurrency,
                          )}
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
                  )}
                </View>
              ))
            )}
          </SurfaceCard>
        </>
      )}
    </Page>
  );
}

function holdingDisplayTotalValue(holding: PortfolioHoldingItem) {
  return holding.displayTotalValue ?? holding.totalValue;
}

function holdingDisplayReturnAmount(holding: PortfolioHoldingItem) {
  return holding.displayReturnAmount ?? holding.returnAmount;
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
  summaryDeltaNegative: {
    color: tokens.colors.danger,
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
    gap: 12,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(214, 224, 234, 0.8)',
    paddingBottom: 16,
    marginBottom: 16,
  },
  holdingHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  holdingText: {
    gap: 4,
    flex: 1,
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
    minWidth: 74,
    paddingHorizontal: 10,
    paddingVertical: 8,
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
  holdingCompactMetrics: {
    backgroundColor: tokens.colors.surfaceMuted,
    borderRadius: 18,
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  holdingCompactMetricRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
  },
  holdingCompactMetricBlock: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  holdingCompactMetricBlockAlignEnd: {
    alignItems: 'flex-end',
  },
  holdingCompactMetaRow: {
    alignItems: 'center',
    borderTopColor: 'rgba(214, 224, 234, 0.82)',
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
  },
  holdingCompactMetaLabel: {
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.body,
    fontSize: 12,
  },
  holdingCompactMetaValue: {
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontSize: 13,
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
  emptyText: {
    fontSize: 14,
    lineHeight: 22,
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.body,
  },
});
