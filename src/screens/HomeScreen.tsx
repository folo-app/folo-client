import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { DataStatusCard } from '../components/DataStatusCard';
import {
  MetricBadge,
  Page,
  PrimaryButton,
  SectionHeading,
  SurfaceCard,
} from '../components/ui';
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
  const portfolio = usePortfolioData();
  const feed = useFeedData();
  const reminders = useRemindersData();
  const myTrades = useMyTradesData();
  const reminderSummary = reminders.data.reminders[0];
  const combinedError =
    portfolio.error ?? reminders.error ?? myTrades.error ?? feed.error;
  const combinedLoading =
    portfolio.loading || reminders.loading || myTrades.loading || feed.loading;

  return (
    <Page
      eyebrow="Today"
      title="오늘의 투자 현황"
      subtitle="포트폴리오 요약, 리마인더, 내 거래, 친구 피드를 실제 백엔드 응답 기준으로 묶었습니다."
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
        <View style={styles.metricRow}>
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
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeading
          title="바로 실행"
          description="초기 세팅은 직접 포트폴리오 추가가 메인이고, CSV/OCR는 빠른 보조 수단으로 둡니다."
        />
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
            <Pressable
              key={item.tradeId}
              onPress={() => navigation.navigate('TradeDetail', { tradeId: item.tradeId })}
              style={[styles.friendRow, index < Math.min(2, feed.data.trades.length - 1) && styles.divider]}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {item.user.nickname.slice(0, 1).toUpperCase()}
                </Text>
              </View>
              <View style={styles.friendText}>
                <Text style={styles.friendName}>{item.user.nickname}</Text>
                <Text style={styles.friendSummary}>
                  {item.ticker} {tradeTypeLabel(item.tradeType)} ·{' '}
                  {formatSignedCurrency(item.quantity * item.price, item.market)}
                </Text>
              </View>
              <Text style={styles.friendTime}>{formatRelativeDate(item.tradedAt)}</Text>
            </Pressable>
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
  metricRow: {
    flexDirection: 'row',
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
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 16,
    backgroundColor: tokens.colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: tokens.colors.navy,
    fontSize: 15,
    fontFamily: tokens.typography.heading,
    fontWeight: '800',
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
