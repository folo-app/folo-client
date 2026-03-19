import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { DataStatusCard } from '../components/DataStatusCard';
import { MetricBadge, Page, PrimaryButton, SectionHeading, SurfaceCard } from '../components/ui';
import { usePortfolioData } from '../hooks/useFoloData';
import {
  formatCurrency,
  formatDateLabel,
  formatPercent,
  formatSignedCurrency,
  formatWeight,
} from '../lib/format';
import type { RootStackParamList } from '../navigation/types';
import { tokens } from '../theme/tokens';

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
      title="수익률과 자산배분"
      subtitle="실제 포트폴리오 합산 결과와 보유 종목 정보를 백엔드 계산값 그대로 보여줍니다."
    >
      <DataStatusCard error={portfolio.error} loading={portfolio.loading} />

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
          title="포트폴리오 상태"
          description="합산 값과 마지막 반영 시점을 확인할 수 있습니다."
        />
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>보유 종목 수</Text>
          <Text style={styles.statusValue}>{portfolio.data.holdings.length}개</Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>공개 상태</Text>
          <Text style={styles.statusValue}>
            {portfolio.data.isFullyVisible ? '전체 공개 가능' : '일부 제한'}
          </Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>최근 반영 시각</Text>
          <Text style={styles.statusValue}>
            {portfolio.data.syncedAt ? formatDateLabel(portfolio.data.syncedAt) : '반영 기록 없음'}
          </Text>
        </View>
        <View style={styles.actionStack}>
          <PrimaryButton
            label="CSV/OCR로 시작"
            onPress={() => navigation.navigate('ImportOnboarding')}
          />
          <PrimaryButton
            label="KIS 연결 준비 상태"
            onPress={() => navigation.navigate('KisConnect')}
            variant="secondary"
          />
        </View>
      </SurfaceCard>

      {portfolio.data.holdings.length === 0 ? (
        <SurfaceCard>
          <SectionHeading
            title="보유 종목"
            description="거래를 추가하면 실제 보유 종목이 여기에 집계됩니다."
          />
          <Text style={styles.emptyText}>
            아직 보유 종목이 없습니다. 초기 포트폴리오는 CSV/OCR 가져오기로 채우고, 수동 입력은 누락 거래를 보정하는 용도로 사용하는 흐름을 권장합니다.
          </Text>
          <PrimaryButton
            label="포트폴리오 시작하기"
            onPress={() => navigation.navigate('ImportOnboarding')}
          />
        </SurfaceCard>
      ) : (
        <>
          <SurfaceCard>
            <SectionHeading
              title="자산 배분"
              description="현재 보유 종목 비중을 시각적으로 확인합니다."
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
              description="항목을 누르면 종목별 상세 지표로 이동합니다."
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
  actionStack: {
    gap: 10,
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
  emptyText: {
    fontSize: 14,
    lineHeight: 22,
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.body,
  },
});
