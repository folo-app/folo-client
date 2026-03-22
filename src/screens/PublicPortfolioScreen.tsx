import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AllocationBar, AllocationLegend } from '../components/portfolio-visuals';
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
  formatCurrency,
  formatDateLabel,
  formatPercent,
  formatSignedCurrency,
  formatWeight,
} from '../lib/format';
import type { RootStackParamList } from '../navigation/types';
import { tokens } from '../theme/tokens';

export function PublicPortfolioScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'PublicPortfolio'>>();
  const { isCompact } = useResponsiveLayout();
  const portfolio = useUserPortfolioData(route.params.userId);
  const title = route.params.nickname
    ? `${route.params.nickname}님의 포트폴리오`
    : '공개 포트폴리오';
  const allocationPalette = ['#2563EB', '#0F766E', '#7C3AED', '#F59E0B', '#E11D48', '#14B8A6'];
  const allocationItems = [...portfolio.data.holdings]
    .sort((left, right) => (right.totalValue ?? 0) - (left.totalValue ?? 0))
    .map((holding, index) => ({
      key: `${holding.holdingId}`,
      label: holding.name,
      ratio: holding.weight,
      value: formatCurrency(holding.totalValue, holding.market),
      meta: `${holding.ticker} · ${holding.market}`,
      color: allocationPalette[index % allocationPalette.length],
    }));

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
          <SurfaceCard tone="hero">
            <Text style={styles.summaryLabel}>총 평가금액</Text>
            <Text style={styles.summaryValue}>{formatCurrency(portfolio.data.totalValue)}</Text>
            <Text style={styles.summaryDelta}>
              {formatPercent(portfolio.data.totalReturnRate)}
            </Text>
            <MetricGrid>
              <MetricBadge
                label="평가손익"
                value={formatSignedCurrency(portfolio.data.totalReturn)}
                tone="positive"
              />
              <MetricBadge
                label="오늘 등락"
                value={formatSignedCurrency(portfolio.data.dayReturn)}
                tone="brand"
              />
            </MetricGrid>
          </SurfaceCard>

          <SurfaceCard>
            <SectionHeading title="자산 구성" />
            <AllocationBar items={allocationItems} height={22} />
            <AllocationLegend items={allocationItems.slice(0, 6)} />
          </SurfaceCard>

          <SurfaceCard>
            <SectionHeading title="보유 종목" description={`최근 반영 ${portfolio.data.syncedAt ? formatDateLabel(portfolio.data.syncedAt) : '기록 없음'}`} />
            {portfolio.data.holdings.length === 0 ? (
              <Text style={styles.emptyText}>표시할 보유 종목이 없습니다.</Text>
            ) : (
              portfolio.data.holdings.map((holding, index) => (
                <Pressable
                  key={holding.holdingId}
                  style={[
                    styles.holdingRow,
                    isCompact && styles.holdingRowCompact,
                    index < portfolio.data.holdings.length - 1 && styles.divider,
                  ]}
                >
                  <View style={styles.holdingText}>
                    <Text style={styles.holdingTicker}>{holding.ticker}</Text>
                    <Text style={styles.holdingName}>
                      {holding.name} · {formatWeight(holding.weight)}
                    </Text>
                  </View>
                  <View style={styles.holdingMetrics}>
                    <Text style={styles.holdingReturn}>{formatPercent(holding.returnRate)}</Text>
                    <Text style={styles.holdingValue}>
                      {formatCurrency(holding.totalValue, holding.market)}
                    </Text>
                  </View>
                </Pressable>
              ))
            )}
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
  holdingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  holdingRowCompact: {
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
  holdingMetrics: {
    alignItems: 'flex-end',
    gap: 6,
  },
  holdingReturn: {
    fontSize: 16,
    color: tokens.colors.positive,
    fontFamily: tokens.typography.heading,
    fontWeight: '700',
  },
  holdingValue: {
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
