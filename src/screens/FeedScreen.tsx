import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '../components/Avatar';
import { DataStatusCard } from '../components/DataStatusCard';
import { Chip, Page, PrimaryButton, SectionHeading, SurfaceCard } from '../components/ui';
import { useFeedData } from '../hooks/useFoloData';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import {
  formatCurrency,
  formatRelativeDate,
  reactionEmojiLabel,
  tradeTypeLabel,
} from '../lib/format';
import type { RootStackParamList } from '../navigation/types';
import { tokens } from '../theme/tokens';

export function FeedScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isCompact } = useResponsiveLayout();
  const feed = useFeedData();

  return (
    <Page
      eyebrow="Feed"
      title="친구 거래 타임라인"
    >
      <DataStatusCard error={feed.error} loading={feed.loading} />

      <SurfaceCard tone="muted">
        <SectionHeading title="피드 상태" description={`${feed.data.trades.length}건의 거래`} />
        <View style={styles.actionStack}>
          <PrimaryButton label="피드 새로고침" onPress={feed.refresh} variant="secondary" />
          <PrimaryButton
            label="사람 찾기"
            onPress={() => navigation.navigate('People')}
            variant="secondary"
          />
          <PrimaryButton
            label="거래 추가로 이동"
            onPress={() => navigation.navigate('MainTabs', { screen: 'AddTrade' })}
            variant="secondary"
          />
        </View>
      </SurfaceCard>

      {feed.data.trades.length === 0 ? (
        <SurfaceCard>
          <Text style={styles.emptyText}>
            팔로우한 사용자의 거래가 아직 없습니다. 친구를 팔로우하면 피드가 채워집니다.
          </Text>
        </SurfaceCard>
      ) : (
        feed.data.trades.map((item) => (
          <SurfaceCard key={item.tradeId}>
            <View style={styles.cardHeader}>
              <Pressable
                onPress={() =>
                  navigation.navigate('UserProfile', {
                    userId: item.user.userId,
                    nickname: item.user.nickname,
                  })
                }
                style={styles.identity}
              >
                <Avatar imageUrl={item.user.profileImage} name={item.user.nickname} size={44} />
                <View style={styles.identityText}>
                  <Text style={styles.user}>{item.user.nickname}</Text>
                  <Text style={styles.handle}>
                    {item.market} · {formatRelativeDate(item.tradedAt)}
                  </Text>
                </View>
              </Pressable>
              <View style={styles.chipWrap}>
                <Chip
                  label={`${tradeTypeLabel(item.tradeType)} · ${item.market}`}
                  tone={item.tradeType === 'BUY' ? 'brand' : 'danger'}
                />
              </View>
            </View>

            <Pressable
              onPress={() => navigation.navigate('TradeDetail', { tradeId: item.tradeId })}
              style={styles.tradeCardAction}
            >
              <View style={[styles.tradeRow, isCompact && styles.tradeRowCompact]}>
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
            </Pressable>
          </SurfaceCard>
        ))
      )}
    </Page>
  );
}

const styles = StyleSheet.create({
  actionStack: {
    gap: 10,
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 22,
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.body,
  },
  tradeCardAction: {
    gap: 16,
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
