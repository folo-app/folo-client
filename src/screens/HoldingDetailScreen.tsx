import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { StyleSheet, Text, View } from 'react-native';

import { DataStatusCard } from '../components/DataStatusCard';
import { Chip, Page, SectionHeading, SurfaceCard } from '../components/ui';
import { usePortfolioData } from '../hooks/useFoloData';
import { formatCurrency, formatPercent, formatWeight } from '../lib/format';
import type { RootStackParamList } from '../navigation/types';
import { tokens } from '../theme/tokens';

export function HoldingDetailScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'HoldingDetail'>>();
  const portfolio = usePortfolioData();
  const holding =
    portfolio.data.holdings.find((item) => item.holdingId === route.params.holdingId) ??
    portfolio.data.holdings[0];

  return (
    <Page
      eyebrow="Holding Detail"
      title={`${holding.ticker} 상세`}
      subtitle="Holding 전용 API는 아직 없어서 Portfolio projection에서 상세 뷰를 분리했습니다."
      action={
        <Chip
          active
          label={portfolio.source === 'api' ? 'API 연결' : '샘플 데이터'}
          tone={portfolio.source === 'api' ? 'positive' : 'brand'}
        />
      }
    >
      <DataStatusCard error={portfolio.error} loading={portfolio.loading} source={portfolio.source} />

      <SurfaceCard tone="hero">
        <Text style={styles.ticker}>{holding.ticker}</Text>
        <Text style={styles.name}>{holding.name}</Text>
        <View style={styles.metricRow}>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>평가금액</Text>
            <Text style={styles.metricValue}>
              {formatCurrency(holding.totalValue, holding.market)}
            </Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>수익률</Text>
            <Text style={styles.metricValue}>{formatPercent(holding.returnRate)}</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>비중</Text>
            <Text style={styles.metricValue}>{formatWeight(holding.weight)}</Text>
          </View>
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeading
          title="보유 정보"
          description="PortfolioHoldingItem에 포함된 숫자를 그대로 노출합니다."
        />
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>수량</Text>
          <Text style={styles.detailValue}>{holding.quantity}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>평균단가</Text>
          <Text style={styles.detailValue}>
            {formatCurrency(holding.avgPrice, holding.market)}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>현재가</Text>
          <Text style={styles.detailValue}>
            {formatCurrency(holding.currentPrice, holding.market)}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>투자원금</Text>
          <Text style={styles.detailValue}>
            {formatCurrency(holding.totalInvested, holding.market)}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>평가손익</Text>
          <Text style={styles.detailValue}>
            {formatCurrency(holding.returnAmount, holding.market)}
          </Text>
        </View>
      </SurfaceCard>
    </Page>
  );
}

const styles = StyleSheet.create({
  ticker: {
    fontSize: 30,
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontWeight: '800',
  },
  name: {
    fontSize: 14,
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.body,
  },
  metricRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metric: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.78)',
    borderRadius: 18,
    padding: 14,
    gap: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: tokens.colors.inkMute,
    fontFamily: tokens.typography.body,
  },
  metricValue: {
    fontSize: 15,
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontWeight: '700',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.body,
  },
  detailValue: {
    fontSize: 14,
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontWeight: '700',
  },
});
