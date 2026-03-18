import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { DataStatusCard } from '../components/DataStatusCard';
import { Heatmap } from '../components/Heatmap';
import { Chip, MetricBadge, Page, PrimaryButton, SectionHeading, SurfaceCard } from '../components/ui';
import { heatmap } from '../data/mock';
import { usePortfolioData } from '../hooks/useFoloData';
import {
  formatCurrency,
  formatPercent,
  formatSignedCurrency,
  formatWeight,
} from '../lib/format';
import type { RootStackParamList } from '../navigation/types';
import { tokens } from '../theme/tokens';

const ranking = [
  { rank: 1, user: '서연', returnRate: '+18.2%' },
  { rank: 2, user: '민준', returnRate: '+15.6%' },
  { rank: 3, user: '지수', returnRate: '+13.1%' },
] as const;

export function PortfolioScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const portfolio = usePortfolioData();

  const allocation = portfolio.data.holdings.map((item) => ({
    name: item.name,
    ratio: Number(formatWeight(item.weight).replace('%', '')),
    value: formatCurrency(item.totalValue, item.market),
    color: item.market === 'KRX' ? '#0F766E' : '#2563EB',
  }));

  return (
    <Page
      eyebrow="Portfolio"
      title="수익률, 자산배분, 잔디를 한 번에"
      subtitle="토스식 숫자 표현을 기본으로 두고, 장기투자 맥락은 잔디와 랭킹으로 확장한 메인 대시보드입니다."
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
        <Text style={styles.summaryLabel}>총 평가금액</Text>
        <Text style={styles.summaryValue}>{formatCurrency(portfolio.data.totalValue)}</Text>
        <Text style={styles.summaryDelta}>{formatPercent(portfolio.data.totalReturnRate)}</Text>
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
          title="자산 배분"
          description="차트 대신 먼저 막대형 정보 구조로 시작해 데이터 연동 전에도 의도가 잘 보이도록 만들었습니다."
        />
        {allocation.map((item) => (
          <View key={item.name} style={styles.allocationRow}>
            <View style={styles.allocationMeta}>
              <Text style={styles.allocationName}>{item.name}</Text>
              <Text style={styles.allocationValue}>{item.value}</Text>
            </View>
            <View style={styles.allocationBarTrack}>
              <View
                style={[
                  styles.allocationBarFill,
                  { width: `${item.ratio}%`, backgroundColor: item.color },
                ]}
              />
            </View>
            <Text style={styles.allocationRatio}>{item.ratio}%</Text>
          </View>
        ))}
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeading
          title="보유 종목"
          description="상세 화면으로 이어질 카드를 백엔드 holding projection 기준으로 구성했습니다."
        />
        {portfolio.data.holdings.map((holding, index) => (
          <Pressable
            key={holding.holdingId}
            onPress={() =>
              navigation.navigate('HoldingDetail', { holdingId: holding.holdingId })
            }
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
        ))}
        <PrimaryButton
          label="프로필 설정 보기"
          onPress={() => navigation.navigate('MainTabs', { screen: 'Profile' })}
          variant="secondary"
        />
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeading
          title="잔디 & 랭킹"
          description="기획서의 GRASS, Ranking 기능을 빠르게 검토할 수 있는 목업입니다."
        />
        <Heatmap values={heatmap} />
        <View style={styles.rankingCard}>
          {ranking.map((item) => (
            <View key={item.user} style={styles.rankingRow}>
              <Text style={styles.rankingRank}>{item.rank}</Text>
              <Text style={styles.rankingUser}>{item.user}</Text>
              <Text style={styles.rankingReturn}>{item.returnRate}</Text>
            </View>
          ))}
        </View>
      </SurfaceCard>
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
  allocationRow: {
    gap: 8,
  },
  allocationMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  allocationName: {
    fontSize: 15,
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontWeight: '700',
  },
  allocationValue: {
    fontSize: 13,
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.body,
  },
  allocationBarTrack: {
    width: '100%',
    height: 10,
    borderRadius: 999,
    backgroundColor: tokens.colors.surfaceMuted,
    overflow: 'hidden',
  },
  allocationBarFill: {
    height: '100%',
    borderRadius: 999,
  },
  allocationRatio: {
    fontSize: 12,
    color: tokens.colors.inkMute,
    fontFamily: tokens.typography.body,
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
  rankingCard: {
    backgroundColor: tokens.colors.surfaceMuted,
    borderRadius: 18,
    padding: 16,
    gap: 12,
  },
  rankingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rankingRank: {
    width: 20,
    fontSize: 14,
    color: tokens.colors.brandStrong,
    fontFamily: tokens.typography.heading,
    fontWeight: '800',
  },
  rankingUser: {
    flex: 1,
    fontSize: 14,
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontWeight: '700',
  },
  rankingReturn: {
    fontSize: 14,
    color: tokens.colors.positive,
    fontFamily: tokens.typography.heading,
    fontWeight: '700',
  },
});
