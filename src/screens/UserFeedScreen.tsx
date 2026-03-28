import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { FeedTradeItem } from '../api/contracts';
import { Avatar } from '../components/Avatar';
import { DataStatusCard } from '../components/DataStatusCard';
import {
  Chip,
  MetricBadge,
  MetricGrid,
  Page,
  PageBackButton,
  PrimaryButton,
  SectionHeading,
  SurfaceCard,
} from '../components/ui';
import { useUserFeedData } from '../hooks/useFoloData';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import {
  formatCurrency,
  formatNumber,
  formatRelativeDate,
  reactionEmojiLabel,
  tradeTypeLabel,
} from '../lib/format';
import type { RootStackParamList } from '../navigation/types';
import { tokens } from '../theme/tokens';

export function UserFeedScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'UserFeed'>>();
  const { isCompact, isLarge } = useResponsiveLayout();
  const feed = useUserFeedData(route.params.userId);
  const trades = [...feed.data.trades].sort(
    (left, right) => new Date(right.tradedAt).getTime() - new Date(left.tradedAt).getTime(),
  );
  const latestTrade = trades[0] ?? null;
  const displayName = route.params.nickname ?? latestTrade?.user.nickname ?? '개인 피드';
  const title = `${displayName}님의 거래 흐름`;
  const tradeSummary = {
    buyCount: trades.filter((item) => item.tradeType === 'BUY').length,
    sellCount: trades.filter((item) => item.tradeType === 'SELL').length,
    krCount: trades.filter((item) => item.market === 'KRX').length,
    usCount: trades.filter((item) => item.market !== 'KRX').length,
    totalEngagement: trades.reduce((sum, item) => sum + tradeEngagement(item), 0),
  };
  const highlightTrade =
    trades.length > 0
      ? [...trades].sort((left, right) => {
          const engagementDiff = tradeEngagement(right) - tradeEngagement(left);
          if (engagementDiff !== 0) {
            return engagementDiff;
          }

          return new Date(right.tradedAt).getTime() - new Date(left.tradedAt).getTime();
        })[0]
      : null;
  const highlightReason =
    highlightTrade && tradeEngagement(highlightTrade) > 0
      ? '반응이 가장 모인 거래'
      : '가장 최근 거래';

  const highlightCard = highlightTrade ? (
    <SurfaceCard tone="muted">
      <SectionHeading
        title="대표 거래"
        description={highlightReason}
        actionLabel="거래 보기"
        onActionPress={() =>
          navigation.navigate('TradeDetail', { tradeId: highlightTrade.tradeId })
        }
      />
      <View style={[styles.highlightHeader, isCompact && styles.highlightHeaderCompact]}>
        <View style={styles.highlightMetaBlock}>
          <Text style={styles.highlightTime}>
            {formatRelativeDate(highlightTrade.tradedAt)} · {marketLabel(highlightTrade.market)}
          </Text>
          <Text style={styles.highlightTicker}>{highlightTrade.ticker}</Text>
          <Text style={styles.company}>{highlightTrade.name}</Text>
        </View>
        <Chip
          label={tradeTypeLabel(highlightTrade.tradeType)}
          tone={highlightTrade.tradeType === 'BUY' ? 'brand' : 'danger'}
        />
      </View>

      <View style={[styles.metricStrip, isCompact && styles.metricStripCompact]}>
        <View style={styles.metricTile}>
          <Text style={styles.metricLabel}>수량</Text>
          <Text style={styles.metricValue}>{formatNumber(highlightTrade.quantity)}주</Text>
        </View>
        <View style={styles.metricTile}>
          <Text style={styles.metricLabel}>가격</Text>
          <Text style={styles.metricValue}>
            {formatCurrency(highlightTrade.price, highlightTrade.market)}
          </Text>
        </View>
        <View style={styles.metricTile}>
          <Text style={styles.metricLabel}>거래금액</Text>
          <Text style={styles.metricValue}>
            {formatCurrency(
              highlightTrade.quantity * highlightTrade.price,
              highlightTrade.market,
            )}
          </Text>
        </View>
      </View>

      <View style={styles.commentCard}>
        <Text style={styles.commentLabel}>코멘트</Text>
        <Text numberOfLines={3} style={styles.comment}>
          {highlightTrade.comment ?? '작성된 코멘트가 없습니다.'}
        </Text>
      </View>

      <View style={styles.highlightFooter}>
        <Chip label={`반응 ${tradeEngagement(highlightTrade)}`} tone="brand" />
        <Chip label={`댓글 ${highlightTrade.commentCount}`} />
      </View>
    </SurfaceCard>
  ) : null;

  const summaryCard =
    trades.length > 0 ? (
      <SurfaceCard>
        <SectionHeading title="거래 흐름 요약" description="한 사람의 공개 기록만 집계합니다." />
        <MetricGrid>
          <MetricBadge label="전체" value={`${trades.length}건`} />
          <MetricBadge label="매수" value={`${tradeSummary.buyCount}건`} tone="brand" />
          <MetricBadge label="매도" value={`${tradeSummary.sellCount}건`} tone="danger" />
          <MetricBadge label="반응" value={`${tradeSummary.totalEngagement}`} />
        </MetricGrid>
        <Text style={styles.sideNote}>
          국내 {tradeSummary.krCount}건 · 미국 {tradeSummary.usCount}건
        </Text>
      </SurfaceCard>
    ) : null;

  const timelineCard =
    trades.length > 0 ? (
      <SurfaceCard>
        <SectionHeading title="타임라인" description={`시간순 거래 ${trades.length}건`} />
        {trades.map((item, index) => (
          <Pressable
            key={item.tradeId}
            accessibilityRole="button"
            onPress={() => navigation.navigate('TradeDetail', { tradeId: item.tradeId })}
            style={({ pressed }) => [
              styles.timelineItem,
              item.tradeType === 'BUY' ? styles.timelineItemBuy : styles.timelineItemSell,
              index < trades.length - 1 && styles.divider,
              pressed && styles.buttonPressed,
            ]}
          >
            <View style={[styles.timelineHeader, isCompact && styles.timelineHeaderCompact]}>
              <View style={styles.timelineMetaBlock}>
                <Text style={styles.timelineMeta}>
                  {formatRelativeDate(item.tradedAt)} · {marketLabel(item.market)}
                </Text>
                <Text style={styles.timelineSubMeta}>댓글 {item.commentCount} · 반응 {tradeEngagement(item)}</Text>
              </View>
              <Chip
                label={tradeTypeLabel(item.tradeType)}
                tone={item.tradeType === 'BUY' ? 'brand' : 'danger'}
              />
            </View>

            <View style={[styles.timelineHeadline, isCompact && styles.timelineHeadlineCompact]}>
              <View style={styles.symbolText}>
                <Text style={styles.ticker}>{item.ticker}</Text>
                <Text style={styles.company}>{item.name}</Text>
              </View>
              <Text style={styles.tradeTotal}>
                {formatCurrency(item.quantity * item.price, item.market)}
              </Text>
            </View>

            <View style={styles.metricStrip}>
              <View style={styles.metricTile}>
                <Text style={styles.metricLabel}>수량</Text>
                <Text style={styles.metricValue}>{formatNumber(item.quantity)}주</Text>
              </View>
              <View style={styles.metricTile}>
                <Text style={styles.metricLabel}>가격</Text>
                <Text style={styles.metricValue}>{formatCurrency(item.price, item.market)}</Text>
              </View>
              <View style={styles.metricTile}>
                <Text style={styles.metricLabel}>거래금액</Text>
                <Text style={styles.metricValue}>
                  {formatCurrency(item.quantity * item.price, item.market)}
                </Text>
              </View>
            </View>

            <View style={styles.commentCard}>
              <Text style={styles.commentLabel}>코멘트</Text>
              <Text numberOfLines={2} style={styles.comment}>
                {item.comment ?? '작성된 코멘트가 없습니다.'}
              </Text>
            </View>

            <View style={[styles.timelineFooter, isCompact && styles.timelineFooterCompact]}>
              <View style={styles.reactionRow}>
                {item.reactions.length > 0 ? (
                  item.reactions.map((reaction) => (
                    <Chip
                      key={`${item.tradeId}-${reaction.emoji}`}
                      label={`${reactionEmojiLabel(reaction.emoji)} ${reaction.count}`}
                    />
                  ))
                ) : (
                  <Chip label="아직 반응 없음" />
                )}
                <Chip label={`댓글 ${item.commentCount}`} tone="brand" />
              </View>
              <Text style={styles.timelineHint}>눌러서 거래 상세 보기</Text>
            </View>
          </Pressable>
        ))}
        {feed.data.hasNext ? (
          <Text style={styles.paginationHint}>
            더 많은 거래는 다음 페이지 연결이 추가되면 이어서 볼 수 있습니다.
          </Text>
        ) : null}
      </SurfaceCard>
    ) : null;

  return (
    <Page
      eyebrow="Public Feed"
      title={title}
      subtitle="한 사람의 거래 흐름을 시간순으로 살펴봅니다."
      leading={<PageBackButton />}
    >
      <SurfaceCard tone="hero">
        <SectionHeading
          title="공개 거래 흐름"
          description={
            latestTrade
              ? `최근 거래 ${formatRelativeDate(latestTrade.tradedAt)} · 총 ${trades.length}건`
              : '아직 공개 거래가 없습니다.'
          }
        />
        <View style={[styles.profileSummary, isCompact && styles.profileSummaryCompact]}>
          <View style={styles.profileIdentity}>
            <Avatar
              imageUrl={latestTrade?.user.profileImage ?? null}
              name={displayName}
              size={52}
            />
            <View style={styles.profileText}>
              <Text style={styles.profileName}>{displayName}</Text>
              <Text style={styles.profileMeta}>
                {latestTrade
                  ? `${tradeSummary.buyCount}건 매수 · ${tradeSummary.sellCount}건 매도`
                  : '첫 거래가 등록되면 이 화면에 시간순으로 쌓입니다.'}
              </Text>
            </View>
          </View>
          {trades.length > 0 ? (
            <Chip label={`반응 ${tradeSummary.totalEngagement}`} tone="brand" />
          ) : null}
        </View>

        <View style={styles.utilityRow}>
          <Pressable
            accessibilityRole="button"
            onPress={() =>
              navigation.navigate('UserProfile', {
                userId: route.params.userId,
                nickname: route.params.nickname,
              })
            }
            style={({ pressed }) => [styles.utilityPill, pressed && styles.buttonPressed]}
          >
            <Ionicons color={tokens.colors.navy} name="person-circle-outline" size={16} />
            <Text style={styles.utilityLabel}>프로필 보기</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={feed.refresh}
            style={({ pressed }) => [styles.utilityPill, pressed && styles.buttonPressed]}
          >
            <Ionicons color={tokens.colors.navy} name="refresh-outline" size={16} />
            <Text style={styles.utilityLabel}>새로고침</Text>
          </Pressable>
        </View>

        <DataStatusCard error={feed.error} loading={feed.loading} variant="inline" />
      </SurfaceCard>

      {trades.length === 0 ? (
        <SurfaceCard>
          <SectionHeading
            title="아직 공개 거래가 없습니다"
            description="첫 거래를 올리면 이 화면이 타임라인으로 채워집니다."
          />
          <Text style={styles.emptyText}>
            프로필은 보이지만 공개된 거래 기록이 없으면 시간순 피드는 비어 있습니다.
          </Text>
          <View style={styles.emptyActionStack}>
            <PrimaryButton
              label="프로필 보기"
              onPress={() =>
                navigation.navigate('UserProfile', {
                  userId: route.params.userId,
                  nickname: route.params.nickname,
                })
              }
            />
            <PrimaryButton
              label="전체 피드 보기"
              onPress={() => navigation.navigate('MainTabs', { screen: 'Feed' })}
              variant="secondary"
            />
          </View>
        </SurfaceCard>
      ) : isLarge ? (
        <View style={styles.contentColumns}>
          <View style={styles.mainColumn}>{timelineCard}</View>
          <View style={styles.sideColumn}>
            {highlightCard}
            {summaryCard}
          </View>
        </View>
      ) : (
        <>
          {highlightCard}
          {summaryCard}
          {timelineCard}
        </>
      )}
    </Page>
  );
}

function tradeEngagement(item: FeedTradeItem) {
  return item.reactions.reduce((sum, reaction) => sum + reaction.count, 0) + item.commentCount;
}

function marketLabel(market: string) {
  return market === 'KRX' ? '국내' : '미국';
}

const styles = StyleSheet.create({
  contentColumns: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 18,
  },
  mainColumn: {
    flex: 1.65,
    minWidth: 0,
  },
  sideColumn: {
    flex: 1,
    gap: 18,
    maxWidth: 360,
    minWidth: 280,
  },
  profileSummary: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'space-between',
  },
  profileSummaryCompact: {
    alignItems: 'flex-start',
    flexDirection: 'column',
  },
  profileIdentity: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 14,
  },
  profileText: {
    flex: 1,
    gap: 4,
  },
  profileName: {
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontSize: 18,
    fontWeight: '800',
  },
  profileMeta: {
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.body,
    fontSize: 13,
    lineHeight: 20,
  },
  utilityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  utilityPill: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderColor: 'rgba(214, 224, 234, 0.9)',
    borderRadius: tokens.radius.pill,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  utilityLabel: {
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontSize: 14,
    fontWeight: '700',
  },
  highlightHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  highlightHeaderCompact: {
    flexDirection: 'column',
  },
  highlightMetaBlock: {
    flex: 1,
    gap: 4,
  },
  highlightTime: {
    color: tokens.colors.inkMute,
    fontFamily: tokens.typography.body,
    fontSize: 12,
  },
  highlightTicker: {
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontSize: 28,
    fontWeight: '800',
  },
  company: {
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.body,
    fontSize: 13,
  },
  sideNote: {
    color: tokens.colors.inkMute,
    fontFamily: tokens.typography.body,
    fontSize: 12,
    lineHeight: 18,
  },
  timelineItem: {
    borderLeftWidth: 4,
    gap: 14,
    paddingLeft: 14,
  },
  timelineItemBuy: {
    borderLeftColor: tokens.colors.brand,
  },
  timelineItemSell: {
    borderLeftColor: tokens.colors.danger,
  },
  timelineHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  timelineHeaderCompact: {
    flexDirection: 'column',
  },
  timelineMetaBlock: {
    gap: 4,
  },
  timelineMeta: {
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontSize: 14,
    fontWeight: '700',
  },
  timelineSubMeta: {
    color: tokens.colors.inkMute,
    fontFamily: tokens.typography.body,
    fontSize: 12,
  },
  timelineHeadline: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'space-between',
  },
  timelineHeadlineCompact: {
    flexDirection: 'column',
    gap: 8,
  },
  symbolText: {
    gap: 4,
    minWidth: 0,
  },
  ticker: {
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontSize: 24,
    fontWeight: '800',
  },
  tradeTotal: {
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'right',
  },
  metricStrip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metricStripCompact: {
    flexDirection: 'column',
  },
  metricTile: {
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(214, 224, 234, 0.84)',
    flex: 1,
    gap: 4,
    minWidth: 96,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  metricLabel: {
    color: tokens.colors.inkMute,
    fontFamily: tokens.typography.body,
    fontSize: 12,
  },
  metricValue: {
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontSize: 15,
    fontWeight: '700',
  },
  commentCard: {
    backgroundColor: tokens.colors.surfaceMuted,
    borderRadius: 18,
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  commentLabel: {
    color: tokens.colors.inkMute,
    fontFamily: tokens.typography.body,
    fontSize: 12,
  },
  comment: {
    color: tokens.colors.ink,
    fontFamily: tokens.typography.body,
    fontSize: 14,
    lineHeight: 22,
  },
  highlightFooter: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  timelineFooter: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  timelineFooterCompact: {
    alignItems: 'flex-start',
    flexDirection: 'column',
  },
  reactionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  timelineHint: {
    color: tokens.colors.inkMute,
    fontFamily: tokens.typography.body,
    fontSize: 12,
  },
  emptyText: {
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.body,
    fontSize: 14,
    lineHeight: 22,
  },
  emptyActionStack: {
    gap: 10,
  },
  divider: {
    borderBottomColor: 'rgba(214, 224, 234, 0.8)',
    borderBottomWidth: 1,
    paddingBottom: 18,
  },
  paginationHint: {
    color: tokens.colors.inkMute,
    fontFamily: tokens.typography.body,
    fontSize: 12,
    lineHeight: 18,
  },
  buttonPressed: {
    opacity: 0.86,
  },
});
