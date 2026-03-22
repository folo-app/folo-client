import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AllocationBar, AllocationLegend } from '../components/portfolio-visuals';
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
  formatCurrency,
  formatDateLabel,
  formatPercent,
  formatSignedCurrency,
} from '../lib/format';
import type { RootStackParamList } from '../navigation/types';
import { tokens } from '../theme/tokens';

const ALLOCATION_PALETTE = ['#2563EB', '#0F766E', '#7C3AED', '#F59E0B', '#E11D48', '#14B8A6'];

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
            <SectionHeading title="자산 구성" description="비중이 큰 종목부터 정리했습니다." />
            <AllocationBar items={allocationItems} height={22} />
            <AllocationLegend items={topHoldings} />
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
