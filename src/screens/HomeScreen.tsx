import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { DataStatusCard } from '../components/DataStatusCard';
import {
  Chip,
  MetricBadge,
  Page,
  PrimaryButton,
  SectionHeading,
  SurfaceCard,
} from '../components/ui';
import { quickActions, todoItems } from '../data/mock';
import { useFeedData, usePortfolioData, useRemindersData } from '../hooks/useFoloData';
import {
  formatCurrency,
  formatPercent,
  formatRelativeDate,
  formatSignedCurrency,
  tradeTypeLabel,
} from '../lib/format';
import type { RootStackParamList } from '../navigation/types';
import { tokens } from '../theme/tokens';

const toneMap = {
  caution: 'danger',
  brand: 'brand',
  teal: 'positive',
} as const;

export function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const portfolio = usePortfolioData();
  const feed = useFeedData();
  const reminders = useRemindersData();

  const isApiConnected =
    portfolio.source === 'api' &&
    feed.source === 'api' &&
    reminders.source === 'api';
  const reminderSummary = reminders.data.reminders[0];

  return (
    <Page
      eyebrow="Today"
      title="오늘의 투자 루틴"
      subtitle="기획서의 HOME 탭을 기준으로 요약, TODO, 친구 활동 미리보기를 백엔드 계약과 함께 묶었습니다."
      action={
        <Chip
          active
          label={isApiConnected ? 'API 연결' : '샘플 데이터'}
          tone={isApiConnected ? 'positive' : 'brand'}
        />
      }
    >
      <DataStatusCard
        error={portfolio.error ?? feed.error ?? reminders.error}
        loading={portfolio.loading || feed.loading || reminders.loading}
        source={isApiConnected ? 'api' : 'fallback'}
      />

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
          <Chip
            active
            label={
              reminderSummary
                ? `${reminderSummary.ticker} · ${reminderSummary.dayOfMonth}일`
                : '리마인더 없음'
            }
            tone="brand"
          />
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

      <SectionHeading
        title="바로 이어서"
        description="토스처럼 행동 유도는 가볍게, 하지만 흐름은 명확하게 이어지도록 설계했습니다."
      />
      <SurfaceCard>
        <View style={styles.actionRow}>
          {quickActions.map((action) => (
            <Chip
              key={action}
              label={action}
              onPress={() => {
                if (action === '리마인더') {
                  navigation.navigate('Reminders');
                  return;
                }
                navigation.navigate('MainTabs', { screen: 'AddTrade' });
              }}
            />
          ))}
        </View>
        <PrimaryButton
          label="거래 기록 추가로 이동"
          onPress={() => navigation.navigate('MainTabs', { screen: 'AddTrade' })}
        />
      </SurfaceCard>

      <SectionHeading
        title="투자 TODO"
        description="계획을 카드로 보이고 완료 여부를 직관적으로 읽을 수 있게 구성했습니다."
      />
      <SurfaceCard>
        {todoItems.map((item, index) => (
          <View
            key={item.title}
            style={[styles.todoRow, index < todoItems.length - 1 && styles.divider]}
          >
            <View style={styles.todoText}>
              <Text style={styles.todoTitle}>{item.title}</Text>
              <Text style={styles.todoMeta}>{item.meta}</Text>
            </View>
            <Chip label={item.status} tone={toneMap[item.tone]} />
          </View>
        ))}
      </SurfaceCard>

      <SectionHeading
        title="최근 친구 활동"
        description="Feed 진입을 유도하는 미리보기 섹션입니다."
      />
      <SurfaceCard>
        {feed.data.trades.slice(0, 3).map((item, index) => (
          <Pressable
            key={item.tradeId}
            onPress={() => navigation.navigate('TradeDetail', { tradeId: item.tradeId })}
            style={[styles.friendRow, index < 2 && styles.divider]}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.user.nickname.slice(0, 1)}</Text>
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
        ))}
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
  metricRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  todoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2,
    gap: 12,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(214, 224, 234, 0.8)',
    paddingBottom: 16,
    marginBottom: 16,
  },
  todoText: {
    flex: 1,
    gap: 6,
  },
  todoTitle: {
    fontSize: 16,
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontWeight: '700',
  },
  todoMeta: {
    fontSize: 13,
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
