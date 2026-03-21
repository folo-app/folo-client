import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { DataStatusCard } from '../components/DataStatusCard';
import { MetricBadge, Page, SectionHeading, SurfaceCard } from '../components/ui';
import { useUserPortfolioData } from '../hooks/useFoloData';
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
  const portfolio = useUserPortfolioData(route.params.userId);
  const title = route.params.nickname
    ? `${route.params.nickname}님의 포트폴리오`
    : '공개 포트폴리오';

  return (
    <Page
      eyebrow="Public Portfolio"
      title={title}
      subtitle="공개 범위에 따라 노출 가능한 자산 요약과 보유 종목을 보여줍니다."
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
            <View style={styles.metricRow}>
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
            </View>
          </SurfaceCard>

          <SurfaceCard>
            <SectionHeading
              title="포트폴리오 상태"
              description="공개 범위에 따라 숫자 일부가 숨겨질 수 있습니다."
            />
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>보유 종목 수</Text>
              <Text style={styles.statusValue}>{portfolio.data.holdings.length}개</Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>최근 반영 시각</Text>
              <Text style={styles.statusValue}>
                {portfolio.data.syncedAt ? formatDateLabel(portfolio.data.syncedAt) : '반영 기록 없음'}
              </Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>상세 금액 공개</Text>
              <Text style={styles.statusValue}>
                {portfolio.data.isFullyVisible ? '표시됨' : '일부 숨김'}
              </Text>
            </View>
          </SurfaceCard>

          <SurfaceCard>
            <SectionHeading
              title="보유 종목"
              description="보유 비중과 공개 가능한 지표를 확인합니다."
            />
            {portfolio.data.holdings.length === 0 ? (
              <Text style={styles.emptyText}>표시할 보유 종목이 없습니다.</Text>
            ) : (
              portfolio.data.holdings.map((holding, index) => (
                <Pressable
                  key={holding.holdingId}
                  style={[
                    styles.holdingRow,
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
  metricRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statusLabel: {
    fontSize: 14,
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.body,
  },
  statusValue: {
    fontSize: 14,
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontWeight: '700',
  },
  holdingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(214, 224, 234, 0.8)',
    paddingBottom: 16,
    marginBottom: 16,
  },
  holdingText: {
    gap: 6,
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
