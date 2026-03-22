import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '../components/Avatar';
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
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import {
  useFeedData,
  useMyTradesData,
  usePortfolioData,
  useRemindersData,
} from '../hooks/useFoloData';
import {
  formatCurrency,
  formatNumber,
  formatPercent,
  formatRelativeDate,
  formatSignedCurrency,
  tradeTypeLabel,
} from '../lib/format';
import type { RootStackParamList } from '../navigation/types';
import { tokens } from '../theme/tokens';

export function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isCompact } = useResponsiveLayout();
  const portfolio = usePortfolioData();
  const feed = useFeedData();
  const reminders = useRemindersData();
  const myTrades = useMyTradesData();
  const reminderSummary = reminders.data.reminders[0];
  const allocationPalette = ['#2563EB', '#0F766E', '#7C3AED', '#F59E0B', '#E11D48', '#14B8A6'];
  const topAllocationItems = [...portfolio.data.holdings]
    .sort((left, right) => (right.totalValue ?? 0) - (left.totalValue ?? 0))
    .slice(0, 4)
    .map((holding, index) => ({
      key: `${holding.holdingId}`,
      label: holding.name,
      ratio: holding.weight,
      value: formatCurrency(holding.totalValue, holding.market),
      meta: `${holding.ticker} · ${holding.market}`,
      color: allocationPalette[index % allocationPalette.length],
    }));
  const combinedError =
    portfolio.error ?? reminders.error ?? myTrades.error ?? feed.error;
  const combinedLoading =
    portfolio.loading || reminders.loading || myTrades.loading || feed.loading;

  return (
    <Page
      eyebrow="Today"
      title="오늘의 투자 현황"
    >
      <DataStatusCard error={combinedError} loading={combinedLoading} />

      <SurfaceCard tone="hero">
        <View style={styles.summaryHeader}>
          <View style={styles.summaryBlock}>
            <Text style={styles.summaryLabel}>총 평가금액</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(portfolio.data.totalValue)}
            </Text>
            <Text style={styles.summarySubValue}>
              {formatSignedCurrency(portfolio.data.totalReturn)}
            </Text>
          </View>
          <Text style={styles.summaryMeta}>
            {reminderSummary
              ? `${reminderSummary.ticker} · 매월 ${reminderSummary.dayOfMonth}일`
              : '등록된 리마인더가 없습니다.'}
          </Text>
        </View>
        <MetricGrid>
          <MetricBadge
            label="총 수익률"
            value={formatPercent(portfolio.data.totalReturnRate)}
            tone="positive"
          />
          <MetricBadge
            label="오늘 등락"
            value={formatSignedCurrency(portfolio.data.dayReturn)}
            tone="brand"
          />
          <MetricBadge label="보유 종목" value={`${portfolio.data.holdings.length}개`} />
        </MetricGrid>
        {topAllocationItems.length > 0 ? (
          <View style={styles.allocationPreview}>
            <Text style={styles.summarySectionLabel}>자산 구성</Text>
            <AllocationBar items={topAllocationItems} />
            <AllocationLegend items={topAllocationItems} />
          </View>
        ) : null}
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeading title="바로 실행" />
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

      <SurfaceCard>
        <SectionHeading
          title="리마인더"
          description={`총 ${reminders.data.reminders.length}개`}
        />
        {reminders.data.reminders.length === 0 ? (
          <Text style={styles.emptyText}>
            아직 등록된 리마인더가 없습니다. 적립식 투자 루틴을 만들면 이곳에 표시됩니다.
          </Text>
        ) : (
          reminders.data.reminders.slice(0, 3).map((item, index) => (
            <View
              key={item.reminderId}
              style={[styles.listRow, index < Math.min(2, reminders.data.reminders.length - 1) && styles.divider]}
            >
              <Text style={styles.listTitle}>
                {item.ticker} · {item.name}
              </Text>
              <Text style={styles.listMeta}>
                매월 {item.dayOfMonth}일 · {formatCurrency(item.amount)}
              </Text>
            </View>
          ))
        )}
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeading
          title="내 최근 거래"
          description={`총 ${myTrades.data.totalCount}건`}
        />
        {myTrades.data.trades.length === 0 ? (
          <Text style={styles.emptyText}>
            아직 기록된 거래가 없습니다. 첫 포트폴리오는 직접 추가 흐름에서 빠르게 만들고, 이 탭의 수동 입력은 이후 개별 거래를 보정할 때 쓰는 구성이 맞습니다.
          </Text>
        ) : (
          myTrades.data.trades.slice(0, 3).map((item, index) => (
            <Pressable
              key={item.tradeId}
              onPress={() => navigation.navigate('TradeDetail', { tradeId: item.tradeId })}
              style={[styles.listRow, index < Math.min(2, myTrades.data.trades.length - 1) && styles.divider]}
            >
              <Text style={styles.listTitle}>
                {item.ticker} · {tradeTypeLabel(item.tradeType)}
              </Text>
              <Text style={styles.listMeta}>
                {formatNumber(item.totalAmount)} · {formatRelativeDate(item.tradedAt)}
              </Text>
            </Pressable>
          ))
        )}
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeading
          title="친구 피드"
          description="팔로우한 사용자의 거래가 시간순으로 쌓입니다."
        />
        {feed.data.trades.length === 0 ? (
          <Text style={styles.emptyText}>
            아직 친구 피드가 비어 있습니다. 친구를 팔로우하면 최근 거래가 여기에 표시됩니다.
          </Text>
        ) : (
          feed.data.trades.slice(0, 3).map((item, index) => (
            <View
              key={item.tradeId}
              style={[
                styles.friendRow,
                isCompact && styles.friendRowCompact,
                index < Math.min(2, feed.data.trades.length - 1) && styles.divider,
              ]}
            >
              <Pressable
                onPress={() =>
                  navigation.navigate('UserProfile', {
                    userId: item.user.userId,
                    nickname: item.user.nickname,
                  })
                }
                style={styles.friendIdentity}
              >
                <Avatar imageUrl={item.user.profileImage} name={item.user.nickname} size={42} />
                <View style={styles.friendText}>
                  <Text style={styles.friendName}>{item.user.nickname}</Text>
                  <Text style={styles.friendSummary}>
                    {item.ticker} {tradeTypeLabel(item.tradeType)} ·{' '}
                    {formatSignedCurrency(item.quantity * item.price, item.market)}
                  </Text>
                </View>
              </Pressable>
              <Pressable
                onPress={() => navigation.navigate('TradeDetail', { tradeId: item.tradeId })}
              >
                <Text style={styles.friendTime}>{formatRelativeDate(item.tradedAt)}</Text>
              </Pressable>
            </View>
          ))
        )}
      </SurfaceCard>
    </Page>
  );
}

const styles = StyleSheet.create({
  summaryHeader: {
    gap: 14,
  },
  summaryBlock: {
    gap: 8,
  },
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
  summarySubValue: {
    fontSize: 15,
    color: tokens.colors.positive,
    fontFamily: tokens.typography.heading,
    fontWeight: '700',
  },
  summaryMeta: {
    fontSize: 13,
    color: tokens.colors.brandStrong,
    fontFamily: tokens.typography.body,
  },
  summarySectionLabel: {
    fontSize: 13,
    color: tokens.colors.inkMute,
    fontFamily: tokens.typography.body,
  },
  allocationPreview: {
    gap: 12,
  },
  actionStack: {
    gap: 10,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(214, 224, 234, 0.8)',
    paddingBottom: 16,
    marginBottom: 16,
  },
  listRow: {
    gap: 6,
  },
  listTitle: {
    fontSize: 15,
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontWeight: '700',
  },
  listMeta: {
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
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  friendRowCompact: {
    alignItems: 'flex-start',
    flexDirection: 'column',
  },
  friendIdentity: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  friendText: {
    flex: 1,
    gap: 4,
  },
  friendName: {
    fontSize: 15,
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontWeight: '700',
  },
  friendSummary: {
    fontSize: 13,
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.body,
  },
  friendTime: {
    fontSize: 12,
    color: tokens.colors.inkMute,
    fontFamily: tokens.typography.body,
  },
});
