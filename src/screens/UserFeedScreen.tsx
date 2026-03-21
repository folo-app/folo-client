import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '../components/Avatar';
import { DataStatusCard } from '../components/DataStatusCard';
import { Chip, Page, SectionHeading, SurfaceCard } from '../components/ui';
import { useUserFeedData } from '../hooks/useFoloData';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import {
  formatCurrency,
  formatRelativeDate,
  reactionEmojiLabel,
  tradeTypeLabel,
} from '../lib/format';
import type { RootStackParamList } from '../navigation/types';
import { tokens } from '../theme/tokens';

export function UserFeedScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'UserFeed'>>();
  const { isCompact } = useResponsiveLayout();
  const feed = useUserFeedData(route.params.userId);
  const title = route.params.nickname
    ? `${route.params.nickname}님의 거래 기록`
    : '개인 피드';

  return (
    <Page
      eyebrow="Public Feed"
      title={title}
      subtitle="공개 범위에 따라 노출 가능한 거래만 시간순으로 표시합니다."
    >
      <DataStatusCard error={feed.error} loading={feed.loading} />

      <SurfaceCard tone="hero">
        <SectionHeading
          title="피드 요약"
          description={`현재 ${feed.data.trades.length}건이 보입니다.`}
        />
      </SurfaceCard>

      {feed.data.trades.length === 0 ? (
        <SurfaceCard>
          <Text style={styles.emptyText}>표시할 공개 거래가 없습니다.</Text>
        </SurfaceCard>
      ) : (
        feed.data.trades.map((item) => (
          <Pressable
            key={item.tradeId}
            onPress={() => navigation.navigate('TradeDetail', { tradeId: item.tradeId })}
          >
            <SurfaceCard>
              <View style={styles.cardHeader}>
                <View style={styles.identity}>
                  <Avatar imageUrl={item.user.profileImage} name={item.user.nickname} size={44} />
                  <View style={styles.identityText}>
                    <Text style={styles.user}>{item.user.nickname}</Text>
                    <Text style={styles.handle}>
                      {item.market} · {formatRelativeDate(item.tradedAt)}
                    </Text>
                  </View>
                </View>
                <View style={styles.chipWrap}>
                  <Chip
                    label={`${tradeTypeLabel(item.tradeType)} · ${item.market}`}
                    tone={item.tradeType === 'BUY' ? 'brand' : 'danger'}
                  />
                </View>
              </View>

              <View style={[styles.tradeRow, isCompact && styles.tradeRowCompact]}>
                <View style={styles.tradeHero}>
                  <Text style={styles.ticker}>{item.ticker}</Text>
                  <Text style={styles.company}>{item.name}</Text>
                </View>
                <View style={styles.tradeMeta}>
                  <Text style={styles.metaLabel}>수량</Text>
                  <Text style={styles.metaValue}>{item.quantity}주</Text>
                </View>
                <View style={styles.tradeMeta}>
                  <Text style={styles.metaLabel}>가격</Text>
                  <Text style={styles.metaValue}>{formatCurrency(item.price, item.market)}</Text>
                </View>
              </View>

              <Text style={styles.comment}>{item.comment ?? '작성된 코멘트가 없습니다.'}</Text>

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
        ))
      )}
    </Page>
  );
}

const styles = StyleSheet.create({
  emptyText: {
    fontSize: 14,
    lineHeight: 22,
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.body,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    flexWrap: 'wrap',
  },
  identity: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    flex: 1,
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
  tradeRowCompact: {
    flexDirection: 'column',
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
    minWidth: 120,
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
  chipWrap: {
    maxWidth: '100%',
  },
});
