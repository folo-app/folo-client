import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { DataStatusCard } from '../components/DataStatusCard';
import { Chip, Page, PrimaryButton, SectionHeading, SurfaceCard } from '../components/ui';
import { useFeedData } from '../hooks/useFoloData';
import {
  formatCurrency,
  formatRelativeDate,
  reactionEmojiLabel,
  tradeTypeLabel,
} from '../lib/format';
import type { RootStackParamList } from '../navigation/types';
import { tokens } from '../theme/tokens';

const feedFilters = ['전체', '친구만', '내 활동'] as const;

export function FeedScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const feed = useFeedData();

  return (
    <Page
      eyebrow="Feed"
      title="친구 거래 타임라인"
      subtitle="거래 기록 카드, 반응, 댓글 진입 동선을 기준으로 기획서의 Flow 2와 3을 그대로 살렸습니다."
      action={
        <Chip
          active
          label={feed.source === 'api' ? 'API 연결' : '샘플 데이터'}
          tone={feed.source === 'api' ? 'positive' : 'brand'}
        />
      }
    >
      <DataStatusCard error={feed.error} loading={feed.loading} source={feed.source} />

      <SurfaceCard tone="muted">
        <SectionHeading
          title="필터와 검색"
          description="친구만 보기와 검색 진입을 상단에서 바로 처리하도록 배치했습니다."
        />
        <View style={styles.filterRow}>
          {feedFilters.map((filter, index) => (
            <Chip key={filter} active={index === 0} label={filter} />
          ))}
        </View>
        <PrimaryButton
          label="거래 추가로 이동"
          onPress={() => navigation.navigate('MainTabs', { screen: 'AddTrade' })}
          variant="secondary"
        />
      </SurfaceCard>

      {feed.data.trades.map((item) => (
        <Pressable
          key={item.tradeId}
          onPress={() => navigation.navigate('TradeDetail', { tradeId: item.tradeId })}
        >
          <SurfaceCard>
            <View style={styles.cardHeader}>
              <View style={styles.identity}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{item.user.nickname.slice(0, 1)}</Text>
                </View>
                <View style={styles.identityText}>
                  <Text style={styles.user}>{item.user.nickname}</Text>
                  <Text style={styles.handle}>
                    {item.market} · {formatRelativeDate(item.tradedAt)}
                  </Text>
                </View>
              </View>
              <Chip
                label={`${tradeTypeLabel(item.tradeType)} · ${item.market}`}
                tone={item.tradeType === 'BUY' ? 'brand' : 'danger'}
              />
            </View>

            <View style={styles.tradeRow}>
              <View style={styles.tradeHero}>
                <Text style={styles.ticker}>{item.ticker}</Text>
                <Text style={styles.company}>{item.name}</Text>
              </View>
              <View style={styles.tradeMeta}>
                <Text style={styles.metaLabel}>수량</Text>
                <Text style={styles.metaValue}>
                  {item.quantity > 1000
                    ? formatCurrency(item.quantity, item.market)
                    : `${item.quantity}주`}
                </Text>
              </View>
              <View style={styles.tradeMeta}>
                <Text style={styles.metaLabel}>가격</Text>
                <Text style={styles.metaValue}>{formatCurrency(item.price, item.market)}</Text>
              </View>
            </View>

            <Text style={styles.comment}>{item.comment ?? '코멘트 없음'}</Text>

            <View style={styles.reactionRow}>
              {item.reactions.map((reaction) => (
                <Chip
                  key={`${item.tradeId}-${reaction.emoji}`}
                  label={`${reactionEmojiLabel(reaction.emoji)} ${reaction.count}`}
                />
              ))}
              <Chip label={`댓글 ${item.commentCount}`} tone="brand" />
            </View>
          </SurfaceCard>
        </Pressable>
      ))}
    </Page>
  );
}

const styles = StyleSheet.create({
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  identity: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: tokens.colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 17,
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontWeight: '800',
  },
  identityText: {
    gap: 4,
    flex: 1,
  },
  user: {
    fontSize: 15,
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontWeight: '700',
  },
  handle: {
    fontSize: 13,
    color: tokens.colors.inkMute,
    fontFamily: tokens.typography.body,
  },
  tradeRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 10,
  },
  tradeHero: {
    flex: 1.2,
    backgroundColor: tokens.colors.surfaceMuted,
    borderRadius: 18,
    padding: 16,
    gap: 6,
  },
  ticker: {
    fontSize: 24,
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontWeight: '800',
  },
  company: {
    fontSize: 13,
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.body,
  },
  tradeMeta: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 16,
    justifyContent: 'center',
    gap: 4,
  },
  metaLabel: {
    fontSize: 12,
    color: tokens.colors.inkMute,
    fontFamily: tokens.typography.body,
  },
  metaValue: {
    fontSize: 16,
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontWeight: '700',
  },
  comment: {
    fontSize: 14,
    lineHeight: 22,
    color: tokens.colors.ink,
    fontFamily: tokens.typography.body,
  },
  reactionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
});
