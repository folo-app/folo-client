import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';

import { DataStatusCard } from '../components/DataStatusCard';
import {
  DetailRow,
  MetricGrid,
  Page,
  PageBackButton,
  PrimaryButton,
  SectionHeading,
  SurfaceCard,
} from '../components/ui';
import { usePortfolioData } from '../hooks/useFoloData';
import { formatCurrency, formatPercent, formatWeight } from '../lib/format';
import type { RootStackParamList } from '../navigation/types';
import { tokens } from '../theme/tokens';

export function HoldingDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'HoldingDetail'>>();
  const portfolio = usePortfolioData();
  const holding = portfolio.data.holdings.find(
    (item) => item.holdingId === route.params.holdingId,
  );

  return (
    <Page
      eyebrow="Holding Detail"
      title={holding ? `${holding.ticker} 상세` : '보유 종목 상세'}
      leading={<PageBackButton />}
    >
      <DataStatusCard error={portfolio.error} loading={portfolio.loading} />

      {!holding && !portfolio.loading ? (
        <SurfaceCard>
          <Text style={styles.emptyText}>표시할 보유 종목이 없습니다.</Text>
          <PrimaryButton
            label="거래 기록 추가"
            onPress={() => navigation.navigate('MainTabs', { screen: 'AddTrade' })}
          />
        </SurfaceCard>
      ) : holding ? (
        <>
          <SurfaceCard tone="hero">
            <Text style={styles.ticker}>{holding.ticker}</Text>
            <Text style={styles.name}>{holding.name}</Text>
            <MetricGrid>
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
            </MetricGrid>
          </SurfaceCard>

          <SurfaceCard>
            <SectionHeading title="보유 정보" />
            <DetailRow label="수량" value={String(holding.quantity)} />
            <DetailRow label="평균단가" value={formatCurrency(holding.avgPrice, holding.market)} />
            <DetailRow label="현재가" value={formatCurrency(holding.currentPrice, holding.market)} />
            <DetailRow
              label="투자원금"
              value={formatCurrency(holding.totalInvested, holding.market)}
            />
            <DetailRow
              label="평가손익"
              value={formatCurrency(holding.returnAmount, holding.market)}
            />
          </SurfaceCard>
        </>
      ) : null}
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
  emptyText: {
    fontSize: 14,
    lineHeight: 22,
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.body,
  },
});
