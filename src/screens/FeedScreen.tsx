import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import type { FeedTradeItem } from '../api/contracts';
import { Avatar } from '../components/Avatar';
import { DataStatusCard } from '../components/DataStatusCard';
import {
  Chip,
  MetricBadge,
  MetricGrid,
  Page,
  PrimaryButton,
  SectionHeading,
  SurfaceCard,
} from '../components/ui';
import { useFeedData } from '../hooks/useFoloData';
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

const FILTER_OPTIONS = [
  { key: 'all', label: '전체' },
  { key: 'buy', label: '매수' },
  { key: 'sell', label: '매도' },
  { key: 'kr', label: '국내' },
  { key: 'us', label: '미국' },
] as const;

type FeedFilter = (typeof FILTER_OPTIONS)[number]['key'];

export function FeedScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isCompact, isLarge } = useResponsiveLayout();
  const feed = useFeedData();
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FeedFilter>('all');

  const normalizedQuery = query.trim().toLowerCase();
  const filteredTrades = feed.data.trades.filter(
    (item) => matchesFilter(item, activeFilter) && matchesQuery(item, normalizedQuery),
  );
  const highlightTrade =
    filteredTrades.length > 0
      ? [...filteredTrades].sort((left, right) => {
          const engagementDiff = tradeEngagement(right) - tradeEngagement(left);
          if (engagementDiff !== 0) {
            return engagementDiff;
          }
          return new Date(right.tradedAt).getTime() - new Date(left.tradedAt).getTime();
        })[0]
      : null;
  const activeFilterLabel =
    FILTER_OPTIONS.find((option) => option.key === activeFilter)?.label ?? '전체';
  const listDescription = normalizedQuery
    ? `검색 결과 ${filteredTrades.length}건`
    : activeFilter === 'all'
      ? `전체 거래 ${filteredTrades.length}건`
      : `${activeFilterLabel} 거래 ${filteredTrades.length}건`;
  const hasActiveControls = activeFilter !== 'all' || normalizedQuery.length > 0;
  const resetControls = () => {
    setQuery('');
    setActiveFilter('all');
  };
  const highlightReason =
    highlightTrade && tradeEngagement(highlightTrade) > 0
      ? '반응이 가장 모인 거래'
      : '가장 최근 거래';
  const tradeSummary = {
    buyCount: filteredTrades.filter((item) => item.tradeType === 'BUY').length,
    sellCount: filteredTrades.filter((item) => item.tradeType === 'SELL').length,
    krCount: filteredTrades.filter((item) => item.market === 'KRX').length,
    usCount: filteredTrades.filter((item) => item.market !== 'KRX').length,
    totalEngagement: filteredTrades.reduce((sum, item) => sum + tradeEngagement(item), 0),
    totalComments: filteredTrades.reduce((sum, item) => sum + item.commentCount, 0),
    uniqueWriters: new Set(filteredTrades.map((item) => item.user.userId)).size,
  };
  const notablePeople = summarizeActivePeople(filteredTrades).slice(0, 3);
  const showEmptyState = !feed.loading && feed.data.trades.length === 0;
  const showFilteredEmptyState =
    !feed.loading && feed.data.trades.length > 0 && filteredTrades.length === 0;

  const highlightCard = highlightTrade ? (
    <SurfaceCard tone="muted">
      <SectionHeading
        title="지금 눈에 띄는 거래"
        description={highlightReason}
        actionLabel="거래 보기"
        onActionPress={() =>
          navigation.navigate('TradeDetail', { tradeId: highlightTrade.tradeId })
        }
      />
      <View style={[styles.highlightHeader, isCompact && styles.highlightHeaderCompact]}>
        <Pressable
          onPress={() =>
            navigation.navigate('UserProfile', {
              userId: highlightTrade.user.userId,
              nickname: highlightTrade.user.nickname,
            })
          }
          style={styles.highlightIdentity}
        >
          <Avatar
            imageUrl={highlightTrade.user.profileImage}
            name={highlightTrade.user.nickname}
            size={48}
          />
          <View style={styles.highlightIdentityText}>
            <Text style={styles.user}>{highlightTrade.user.nickname}</Text>
            <Text style={styles.handle}>
              {formatRelativeDate(highlightTrade.tradedAt)} · {marketLabel(highlightTrade.market)}
            </Text>
          </View>
        </Pressable>
        <Chip
          label={`${tradeTypeLabel(highlightTrade.tradeType)} · ${marketLabel(
            highlightTrade.market,
          )}`}
          tone={highlightTrade.tradeType === 'BUY' ? 'brand' : 'danger'}
        />
      </View>

      <View style={styles.highlightHero}>
        <Text style={styles.highlightTicker}>{highlightTrade.ticker}</Text>
        <Text style={styles.company}>{highlightTrade.name}</Text>
        <Text style={styles.highlightComment} numberOfLines={3}>
          {highlightTrade.comment ?? '작성된 코멘트가 없습니다.'}
        </Text>
      </View>

      <View style={[styles.highlightStatGrid, isCompact && styles.highlightStatGridCompact]}>
        <View style={styles.statTile}>
          <Text style={styles.statLabel}>수량</Text>
          <Text style={styles.statValue}>{formatNumber(highlightTrade.quantity)}주</Text>
        </View>
        <View style={styles.statTile}>
          <Text style={styles.statLabel}>가격</Text>
          <Text style={styles.statValue}>
            {formatCurrency(highlightTrade.price, highlightTrade.market)}
          </Text>
        </View>
        <View style={styles.statTile}>
          <Text style={styles.statLabel}>거래금액</Text>
          <Text style={styles.statValue}>
            {formatCurrency(
              highlightTrade.quantity * highlightTrade.price,
              highlightTrade.market,
            )}
          </Text>
        </View>
      </View>

      <View style={styles.highlightFooter}>
        <Chip label={`반응 ${tradeEngagement(highlightTrade)}`} tone="brand" />
        <Chip label={`댓글 ${highlightTrade.commentCount}`} />
      </View>
    </SurfaceCard>
  ) : null;

  const engagementSummaryCard =
    filteredTrades.length > 0 ? (
      <SurfaceCard>
        <SectionHeading
          title="반응이 모이는 흐름"
          description="현재 범위에서 대화가 붙는 거래를 먼저 짚습니다."
        />
        <MetricGrid>
          <MetricBadge label="작성자" value={`${tradeSummary.uniqueWriters}명`} />
          <MetricBadge label="반응" value={`${tradeSummary.totalEngagement}`} />
          <MetricBadge label="댓글" value={`${tradeSummary.totalComments}`} tone="brand" />
          <MetricBadge
            label="매수 / 매도"
            value={`${tradeSummary.buyCount} / ${tradeSummary.sellCount}`}
            tone="danger"
          />
        </MetricGrid>
        <Text style={styles.sideNote}>국내 {tradeSummary.krCount}건 · 미국 {tradeSummary.usCount}건</Text>
      </SurfaceCard>
    ) : null;

  const peopleSummaryCard =
    notablePeople.length > 0 ? (
      <SurfaceCard>
        <SectionHeading
          title="눈여겨볼 사람"
          description="현재 흐름에서 반응이 모인 작성자입니다."
          actionLabel="사람 찾기"
          onActionPress={() => navigation.navigate('People')}
        />
        {notablePeople.map((person, index) => (
          <Pressable
            key={person.user.userId}
            accessibilityRole="button"
            onPress={() =>
              navigation.navigate('UserFeed', {
                userId: person.user.userId,
                nickname: person.user.nickname,
              })
            }
            style={({ pressed }) => [
              styles.personCard,
              index < notablePeople.length - 1 && styles.divider,
              pressed && styles.buttonPressed,
            ]}
          >
            <View style={styles.personRow}>
              <View style={styles.personIdentity}>
                <Avatar
                  imageUrl={person.user.profileImage}
                  name={person.user.nickname}
                  size={40}
                />
                <View style={styles.personText}>
                  <Text style={styles.personName}>{person.user.nickname}</Text>
                  <Text style={styles.personMeta}>
                    거래 {person.tradeCount}건 · 반응 {person.engagement}
                  </Text>
                </View>
              </View>
              <View style={styles.personTrail}>
                <Text style={styles.personTicker}>{person.latestTrade.ticker}</Text>
                <Text style={styles.personTime}>
                  {formatRelativeDate(person.latestTrade.tradedAt)}
                </Text>
              </View>
            </View>
            <Text numberOfLines={2} style={styles.personDetail}>
              {tradeTypeLabel(person.latestTrade.tradeType)} ·{' '}
              {marketLabel(person.latestTrade.market)} ·{' '}
              {person.latestTrade.comment ?? `${person.latestTrade.ticker} 거래를 기록했습니다.`}
            </Text>
          </Pressable>
        ))}
      </SurfaceCard>
    ) : null;

  const timelineCard = (
    <SurfaceCard>
      <SectionHeading
        title="타임라인"
        description="최신 거래부터 바로 읽습니다."
        actionLabel={hasActiveControls ? '초기화' : undefined}
        onActionPress={hasActiveControls ? resetControls : undefined}
      />
      <Text style={styles.timelineIntro}>
        {listDescription} · 거래를 누르면 상세와 반응으로 이어집니다.
      </Text>
      {filteredTrades.map((item, index) => (
        <Pressable
          key={item.tradeId}
          onPress={() => navigation.navigate('TradeDetail', { tradeId: item.tradeId })}
          style={({ pressed }) => [
            styles.timelineItem,
            item.tradeType === 'BUY' ? styles.timelineItemBuy : styles.timelineItemSell,
            index < filteredTrades.length - 1 && styles.divider,
            pressed && styles.buttonPressed,
          ]}
        >
          <View style={[styles.timelineHeader, isCompact && styles.timelineHeaderCompact]}>
            <Pressable
              onPress={() =>
                navigation.navigate('UserProfile', {
                  userId: item.user.userId,
                  nickname: item.user.nickname,
                })
              }
              style={styles.identity}
            >
              <Avatar imageUrl={item.user.profileImage} name={item.user.nickname} size={40} />
              <View style={styles.identityText}>
                <Text style={styles.user}>{item.user.nickname}</Text>
                <Text style={styles.handle}>
                  {formatRelativeDate(item.tradedAt)} · {marketLabel(item.market)}
                </Text>
              </View>
            </Pressable>
            <View style={styles.timelineHeaderMeta}>
              <Chip
                label={tradeTypeLabel(item.tradeType)}
                tone={item.tradeType === 'BUY' ? 'brand' : 'danger'}
              />
            </View>
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

          <View style={styles.metricGrid}>
            <View style={styles.metricCell}>
              <Text style={styles.metricLabel}>수량</Text>
              <Text style={styles.metricValue}>{formatNumber(item.quantity)}주</Text>
            </View>
            <View style={styles.metricCell}>
              <Text style={styles.metricLabel}>가격</Text>
              <Text style={styles.metricValue}>{formatCurrency(item.price, item.market)}</Text>
            </View>
            <View style={styles.metricCell}>
              <Text style={styles.metricLabel}>거래금액</Text>
              <Text style={styles.metricValue}>
                {formatCurrency(item.quantity * item.price, item.market)}
              </Text>
            </View>
          </View>

          <View style={styles.commentCard}>
            <Text style={styles.commentLabel}>코멘트</Text>
            <Text style={styles.comment} numberOfLines={2}>
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
          </View>
        </Pressable>
      ))}
      {feed.data.hasNext ? (
        <Text style={styles.paginationHint}>
          더 많은 거래는 다음 페이지 연결이 추가되면 이어서 볼 수 있습니다.
        </Text>
      ) : null}
    </SurfaceCard>
  );

  return (
    <Page
      eyebrow="Feed"
      title="친구 거래 타임라인"
      subtitle="검색과 필터로 거래 흐름을 빠르게 훑고 반응합니다."
    >
      <View style={styles.controlsPanel}>
        <View style={[styles.controlHeader, isCompact && styles.controlHeaderCompact]}>
          <Text style={styles.controlSummary}>{listDescription}</Text>
          {hasActiveControls ? (
            <Pressable
              accessibilityRole="button"
              onPress={resetControls}
              style={({ pressed }) => [styles.resetPill, pressed && styles.buttonPressed]}
            >
              <Text style={styles.resetPillLabel}>초기화</Text>
            </Pressable>
          ) : null}
        </View>
        <View style={styles.searchField}>
          <Ionicons color={tokens.colors.inkMute} name="search-outline" size={18} />
          <TextInput
            onChangeText={setQuery}
            placeholder="티커, 종목명, 친구 이름으로 검색"
            placeholderTextColor={tokens.colors.inkMute}
            style={styles.searchInput}
            value={query}
          />
          {query.length > 0 ? (
            <Pressable
              accessibilityLabel="검색어 지우기"
              accessibilityRole="button"
              onPress={() => setQuery('')}
              style={({ pressed }) => [styles.searchClearButton, pressed && styles.buttonPressed]}
            >
              <Ionicons color={tokens.colors.inkMute} name="close-circle" size={18} />
            </Pressable>
          ) : null}
        </View>

        <View style={styles.filterWrap}>
          {FILTER_OPTIONS.map((option) => (
            <Chip
              key={option.key}
              active={activeFilter === option.key}
              label={option.label}
              tone={chipToneForFilter(option.key)}
              onPress={() => setActiveFilter(option.key)}
            />
          ))}
        </View>

      </View>

      <DataStatusCard error={feed.error} loading={feed.loading} variant="inline" />

      {showEmptyState ? (
        <SurfaceCard>
          <SectionHeading
            title="아직 친구 거래가 없습니다"
            description="팔로우하면 거래 흐름이 여기 쌓입니다."
          />
          <Text style={styles.emptyText}>
            첫 연결을 만들면 매수와 매도 흐름이 이 화면에 시간순으로 정리됩니다.
          </Text>
          <View style={styles.emptyActionStack}>
            <PrimaryButton
              label="사람 찾기"
              onPress={() => navigation.navigate('People')}
            />
            <PrimaryButton
              label="내 프로필 보기"
              onPress={() => navigation.navigate('MainTabs', { screen: 'Profile' })}
              variant="secondary"
            />
          </View>
        </SurfaceCard>
      ) : showFilteredEmptyState ? (
        <SurfaceCard>
          <SectionHeading
            title="조건에 맞는 거래가 없습니다"
            description="검색어나 필터를 조정해 보세요."
          />
          <Text style={styles.emptyText}>
            현재 조건은 {activeFilterLabel}
            {normalizedQuery ? ` / "${query.trim()}"` : ''} 입니다.
          </Text>
          <View style={styles.emptyActionStack}>
            <PrimaryButton
              label="필터 초기화"
              onPress={() => {
                setQuery('');
                setActiveFilter('all');
              }}
            />
            <PrimaryButton
              label="사람 찾기"
              onPress={() => navigation.navigate('People')}
              variant="secondary"
            />
          </View>
        </SurfaceCard>
      ) : (
        isLarge ? (
          <View style={styles.contentColumns}>
            <View style={styles.mainColumn}>{timelineCard}</View>
            {highlightCard || engagementSummaryCard || peopleSummaryCard ? (
              <View style={styles.sideColumn}>
                {highlightCard}
                {engagementSummaryCard}
                {peopleSummaryCard}
              </View>
            ) : null}
          </View>
        ) : (
          <>
            {highlightCard}
            {timelineCard}
          </>
        )
      )}
    </Page>
  );
}

function matchesFilter(item: FeedTradeItem, filter: FeedFilter) {
  switch (filter) {
    case 'buy':
      return item.tradeType === 'BUY';
    case 'sell':
      return item.tradeType === 'SELL';
    case 'kr':
      return item.market === 'KRX';
    case 'us':
      return item.market !== 'KRX';
    case 'all':
      return true;
  }
}

function matchesQuery(item: FeedTradeItem, normalizedQuery: string) {
  if (!normalizedQuery) {
    return true;
  }

  const fields = [
    item.ticker,
    item.name,
    item.market,
    item.user.nickname,
    item.comment ?? '',
    tradeTypeLabel(item.tradeType),
  ];

  return fields.some((field) => field.toLowerCase().includes(normalizedQuery));
}

function chipToneForFilter(filter: FeedFilter) {
  switch (filter) {
    case 'buy':
      return 'brand' as const;
    case 'sell':
      return 'danger' as const;
    default:
      return 'default' as const;
  }
}

function tradeEngagement(item: FeedTradeItem) {
  return item.reactions.reduce((sum, reaction) => sum + reaction.count, 0) + item.commentCount;
}

function marketLabel(market: string) {
  return market === 'KRX' ? '국내' : '미국';
}

function summarizeActivePeople(items: FeedTradeItem[]) {
  const grouped = new Map<
    number,
    {
      user: FeedTradeItem['user'];
      tradeCount: number;
      engagement: number;
      latestTrade: FeedTradeItem;
    }
  >();

  items.forEach((item) => {
    const current = grouped.get(item.user.userId);

    if (!current) {
      grouped.set(item.user.userId, {
        user: item.user,
        tradeCount: 1,
        engagement: tradeEngagement(item),
        latestTrade: item,
      });
      return;
    }

    current.tradeCount += 1;
    current.engagement += tradeEngagement(item);

    if (new Date(item.tradedAt).getTime() > new Date(current.latestTrade.tradedAt).getTime()) {
      current.latestTrade = item;
    }
  });

  return [...grouped.values()].sort((left, right) => {
    const engagementDiff = right.engagement - left.engagement;
    if (engagementDiff !== 0) {
      return engagementDiff;
    }

    const tradeDiff = right.tradeCount - left.tradeCount;
    if (tradeDiff !== 0) {
      return tradeDiff;
    }

    return (
      new Date(right.latestTrade.tradedAt).getTime() -
      new Date(left.latestTrade.tradedAt).getTime()
    );
  });
}

const styles = StyleSheet.create({
  controlsPanel: {
    gap: 12,
  },
  controlHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  controlHeaderCompact: {
    flexDirection: 'column',
  },
  controlSummary: {
    color: tokens.colors.navy,
    flex: 1,
    fontFamily: tokens.typography.body,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  resetPill: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.64)',
    borderColor: 'rgba(214, 224, 234, 0.92)',
    borderRadius: tokens.radius.pill,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 36,
    paddingHorizontal: 12,
  },
  resetPillLabel: {
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontSize: 12,
    fontWeight: '700',
  },
  searchField: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.68)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(214, 224, 234, 0.82)',
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    color: tokens.colors.navy,
    flex: 1,
    fontFamily: tokens.typography.body,
    fontSize: 15,
    paddingVertical: 0,
  },
  searchClearButton: {
    borderRadius: 999,
  },
  filterWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
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
  sideNote: {
    color: tokens.colors.inkMute,
    fontFamily: tokens.typography.body,
    fontSize: 12,
    lineHeight: 18,
  },
  timelineIntro: {
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.body,
    fontSize: 13,
    lineHeight: 20,
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
  highlightHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  highlightHeaderCompact: {
    flexDirection: 'column',
  },
  highlightIdentity: {
    alignItems: 'flex-start',
    flex: 1,
    flexDirection: 'row',
    gap: 12,
  },
  highlightIdentityText: {
    flex: 1,
    gap: 4,
  },
  highlightStatGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  highlightStatGridCompact: {
    flexDirection: 'column',
  },
  highlightHero: {
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderRadius: 22,
    gap: 8,
    padding: 18,
  },
  highlightTicker: {
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontSize: 28,
    fontWeight: '800',
  },
  highlightComment: {
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.body,
    fontSize: 14,
    lineHeight: 22,
  },
  statTile: {
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(214, 224, 234, 0.84)',
    flex: 1,
    gap: 4,
    minWidth: 92,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  statLabel: {
    color: tokens.colors.inkMute,
    fontFamily: tokens.typography.body,
    fontSize: 12,
  },
  statValue: {
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontSize: 16,
    fontWeight: '700',
  },
  highlightFooter: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  personCard: {
    gap: 10,
  },
  personRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  personIdentity: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 12,
    minWidth: 0,
  },
  personText: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  personName: {
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontSize: 15,
    fontWeight: '700',
  },
  personMeta: {
    color: tokens.colors.inkMute,
    fontFamily: tokens.typography.body,
    fontSize: 12,
  },
  personTrail: {
    alignItems: 'flex-end',
    gap: 4,
  },
  personTicker: {
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontSize: 13,
    fontWeight: '700',
  },
  personTime: {
    color: tokens.colors.inkMute,
    fontFamily: tokens.typography.body,
    fontSize: 12,
  },
  personDetail: {
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.body,
    fontSize: 13,
    lineHeight: 20,
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
  identity: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 12,
  },
  identityText: {
    flex: 1,
    gap: 4,
  },
  user: {
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontSize: 15,
    fontWeight: '700',
  },
  handle: {
    color: tokens.colors.inkMute,
    fontFamily: tokens.typography.body,
    fontSize: 13,
  },
  timelineHeaderMeta: {
    maxWidth: '100%',
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
  company: {
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.body,
    fontSize: 13,
  },
  tradeTotal: {
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'right',
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metricCell: {
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
