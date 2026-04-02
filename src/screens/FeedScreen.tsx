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
  const { isCompact, isLarge, isNarrow } = useResponsiveLayout();
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
  const controlSummary = hasActiveControls
    ? `현재 보기 · ${listDescription}`
    : `참여 ${tradeSummary.uniqueWriters}명 · 거래 ${filteredTrades.length}건`;
  const notablePeople = summarizeActivePeople(filteredTrades).slice(0, 3);
  const showDesktopEngagementSummary = isLarge && filteredTrades.length >= 4;
  const showDesktopPeopleSummary = isLarge && notablePeople.length >= 2;
  const showFeedSupportState = !feed.loading && feed.error !== null && feed.data.trades.length === 0;
  const showEmptyState = !feed.loading && !feed.error && feed.data.trades.length === 0;
  const showFilteredEmptyState =
    !feed.loading && feed.data.trades.length > 0 && filteredTrades.length === 0;

  const highlightCard = highlightTrade ? (
    isLarge ? (
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
    ) : (
      <SurfaceCard tone="utility">
        <SectionHeading
          title="눈에 띄는 거래"
          description={highlightReason}
          tone="utility"
        />
        <View style={[styles.highlightCompactTop, isCompact && styles.highlightCompactTopCompact]}>
            <View style={styles.highlightCompactTickerBlock}>
              <Text numberOfLines={1} style={styles.highlightCompactTicker}>
                {highlightTrade.ticker}
              </Text>
              <Text numberOfLines={1} style={styles.company}>
                {highlightTrade.name}
              </Text>
            </View>
          <Chip
            label={tradeTypeLabel(highlightTrade.tradeType)}
            tone={highlightTrade.tradeType === 'BUY' ? 'brand' : 'danger'}
          />
        </View>
        <Text style={styles.highlightCompactComment} numberOfLines={2}>
          {highlightTrade.comment ?? `${highlightTrade.user.nickname}님 거래를 먼저 볼 만합니다.`}
        </Text>
        <View
          style={[styles.highlightCompactMetaRow, isCompact && styles.highlightCompactMetaRowCompact]}
        >
          <Pressable
            onPress={() =>
              navigation.navigate('UserProfile', {
                userId: highlightTrade.user.userId,
                nickname: highlightTrade.user.nickname,
              })
            }
            style={styles.highlightCompactIdentity}
          >
            <Avatar
              imageUrl={highlightTrade.user.profileImage}
              name={highlightTrade.user.nickname}
              size={36}
            />
            <View style={styles.highlightCompactIdentityText}>
              <Text numberOfLines={1} style={styles.highlightCompactUser}>
                {highlightTrade.user.nickname}
              </Text>
              <Text numberOfLines={1} style={styles.highlightCompactMeta}>
                {formatRelativeDate(highlightTrade.tradedAt)} · {marketLabel(highlightTrade.market)}
              </Text>
            </View>
          </Pressable>
          <View style={[styles.highlightCompactChips, isNarrow && styles.highlightCompactChipsNarrow]}>
            <Chip
              label={formatCurrency(
                highlightTrade.quantity * highlightTrade.price,
                highlightTrade.market,
              )}
            />
            <Chip label={`반응 ${tradeEngagement(highlightTrade)}`} tone="brand" />
          </View>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.navigate('TradeDetail', { tradeId: highlightTrade.tradeId })}
          style={({ pressed }) => [styles.highlightCompactLink, pressed && styles.buttonPressed]}
        >
          <Text style={styles.highlightCompactLinkLabel}>거래 보기</Text>
          <Ionicons color={tokens.colors.brandStrong} name="chevron-forward" size={14} />
        </Pressable>
      </SurfaceCard>
    )
  ) : null;

  const engagementSummaryCard =
    showDesktopEngagementSummary ? (
      <SurfaceCard tone="utility">
        <SectionHeading
          title="반응이 모이는 흐름"
          description="현재 범위에서 대화가 붙는 거래를 먼저 짚습니다."
          tone="utility"
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
    showDesktopPeopleSummary ? (
      <SurfaceCard tone="utility">
        <SectionHeading
          title="눈여겨볼 사람"
          description="현재 흐름에서 반응이 모인 작성자입니다."
          actionLabel="사람 찾기"
          onActionPress={() => navigation.navigate('People')}
          tone="utility"
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
      <SectionHeading title="타임라인" description="최신 거래부터 바로 읽습니다." />
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
              <Avatar imageUrl={item.user.profileImage} name={item.user.nickname} size={36} />
              <View style={styles.identityText}>
                <Text numberOfLines={1} style={styles.user}>
                  {item.user.nickname}
                </Text>
                <Text numberOfLines={1} style={styles.handle}>
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
              <Text numberOfLines={1} style={styles.ticker}>
                {item.ticker}
              </Text>
              <Text numberOfLines={1} style={styles.company}>
                {item.name}
              </Text>
            </View>
            <Text
              adjustsFontSizeToFit
              minimumFontScale={0.72}
              numberOfLines={1}
              style={[styles.tradeTotal, isCompact && styles.tradeTotalCompact]}
            >
              {formatCurrency(item.quantity * item.price, item.market)}
            </Text>
          </View>

          <View style={styles.tradeFactsRow}>
            <View style={styles.tradeFactPill}>
              <Text style={styles.tradeFactLabel}>행동</Text>
              <Text
                style={[
                  styles.tradeFactValue,
                  item.tradeType === 'SELL' && styles.tradeFactValueDanger,
                ]}
              >
                {tradeTypeLabel(item.tradeType)}
              </Text>
            </View>
            <View style={styles.tradeFactPill}>
              <Text style={styles.tradeFactLabel}>수량</Text>
              <Text style={styles.tradeFactValue}>{formatNumber(item.quantity)}주</Text>
            </View>
            <View style={styles.tradeFactPill}>
              <Text style={styles.tradeFactLabel}>단가</Text>
              <Text style={styles.tradeFactValue}>{formatCurrency(item.price, item.market)}</Text>
            </View>
          </View>

          {item.comment ? (
            <View style={styles.commentCard}>
              <Text style={styles.comment} numberOfLines={3}>
                {item.comment}
              </Text>
            </View>
          ) : null}

          {item.reactions.length > 0 || item.commentCount > 0 ? (
            <View style={[styles.timelineFooter, isCompact && styles.timelineFooterCompact]}>
              <View style={styles.reactionRow}>
                {item.reactions.map((reaction) => (
                  <Chip
                    key={`${item.tradeId}-${reaction.emoji}`}
                    label={`${reactionEmojiLabel(reaction.emoji)} ${reaction.count}`}
                  />
                ))}
                {item.commentCount > 0 ? (
                  <Chip label={`댓글 ${item.commentCount}`} tone="brand" />
                ) : null}
              </View>
            </View>
          ) : null}
        </Pressable>
      ))}
      {feed.data.hasNext ? (
        <Text style={styles.paginationHint}>
          더 많은 거래는 다음 페이지 연결이 추가되면 이어서 볼 수 있습니다.
        </Text>
      ) : null}
    </SurfaceCard>
  );
  const desktopSideRail =
    highlightCard || peopleSummaryCard || engagementSummaryCard ? (
      <View style={styles.sideColumn}>
        {highlightCard}
        {peopleSummaryCard}
        {engagementSummaryCard}
      </View>
    ) : null;

  return (
    <Page
      eyebrow="Feed"
      title="친구 거래 타임라인"
      subtitle="검색과 필터로 거래 흐름을 빠르게 훑고 반응합니다."
    >
      <View style={styles.controlsPanel}>
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
        <View style={[styles.controlUtilityRow, isCompact && styles.controlUtilityRowCompact]}>
          <Text style={styles.controlSummary}>{controlSummary}</Text>
          <View
            style={[
              styles.controlActions,
              isCompact && styles.controlActionsCompact,
              isNarrow && styles.controlActionsNarrow,
            ]}
          >
            <Pressable
              accessibilityRole="button"
              onPress={() => navigation.navigate('People')}
              style={({ pressed }) => [styles.controlLink, pressed && styles.buttonPressed]}
            >
              <Text style={styles.controlLinkLabel}>사람 찾기</Text>
              <Ionicons color={tokens.colors.brandStrong} name="chevron-forward" size={14} />
            </Pressable>
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
        </View>
      </View>

      <DataStatusCard error={feed.error} loading={feed.loading} variant="inline" />

      {showFeedSupportState ? (
        <SurfaceCard tone="utility">
          <SectionHeading
            title="타임라인을 아직 불러오지 못했습니다"
            description="친구 거래가 없는 상태와 다르게, 지금은 응답 상태만 먼저 확인하면 됩니다."
            tone="utility"
          />
          <Text style={styles.emptyText}>
            응답이 돌아오면 이 화면은 다시 거래 흐름 중심으로 채워집니다. 검색과 필터보다 타임라인이 먼저 복구되는 게 중요합니다.
          </Text>
        </SurfaceCard>
      ) : showEmptyState ? (
        <SurfaceCard>
          <SectionHeading
            title="아직 친구 거래가 없습니다"
            description="첫 네트워크를 만들면 이 화면이 바로 타임라인으로 바뀝니다."
          />
          <Text style={styles.emptyText}>
            먼저 한 사람을 팔로우해 거래를 가져오거나, 내 프로필을 공유해 첫 연결을 여세요.
          </Text>
          <View style={styles.emptyActionStack}>
            <View style={styles.emptyActionGroup}>
              <PrimaryButton
                label="사람 찾기"
                onPress={() => navigation.navigate('People')}
              />
              <Text style={styles.emptyActionHint}>
                가장 빠른 시작입니다. 한 명만 팔로우해도 공개 거래가 이 피드에 바로 쌓입니다.
              </Text>
            </View>
            <View style={styles.emptyActionGroup}>
              <PrimaryButton
                label="내 프로필 공유하기"
                onPress={() => navigation.navigate('MainTabs', { screen: 'Profile' })}
                variant="secondary"
              />
              <Text style={styles.emptyActionHint}>
                이미 기록을 올리고 있다면 내 프로필에서 링크와 소개를 정리해 첫 팔로우를 받으세요.
              </Text>
            </View>
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
            <View style={styles.filteredEmptySecondary}>
              <Text style={styles.emptyActionHint}>검색 범위를 넓히고 싶다면</Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => navigation.navigate('People')}
                style={({ pressed }) => [styles.controlLink, pressed && styles.buttonPressed]}
              >
                <Text style={styles.controlLinkLabel}>사람 찾기</Text>
                <Ionicons color={tokens.colors.brandStrong} name="chevron-forward" size={14} />
              </Pressable>
            </View>
          </View>
        </SurfaceCard>
      ) : (
        isLarge ? (
          desktopSideRail ? (
            <View style={styles.contentColumns}>
              <View style={styles.mainColumn}>{timelineCard}</View>
              {desktopSideRail}
            </View>
          ) : (
            timelineCard
          )
        ) : (
          timelineCard
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
    gap: 10,
  },
  controlUtilityRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  controlUtilityRowCompact: {
    flexDirection: 'column',
  },
  controlSummary: {
    color: tokens.colors.inkSoft,
    flex: 1,
    fontFamily: tokens.typography.body,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  controlActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  controlActionsCompact: {
    gap: 8,
  },
  controlActionsNarrow: {
    justifyContent: 'space-between',
    width: '100%',
  },
  controlLink: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    gap: 4,
  },
  controlLinkLabel: {
    color: tokens.colors.brandStrong,
    fontFamily: tokens.typography.heading,
    fontSize: 13,
    fontWeight: '700',
  },
  resetPill: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.64)',
    borderColor: 'rgba(214, 224, 234, 0.92)',
    borderRadius: tokens.radius.pill,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 34,
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
    paddingVertical: 10,
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
    gap: 16,
  },
  mainColumn: {
    flex: 1.85,
    minWidth: 0,
  },
  sideColumn: {
    flex: 0.92,
    gap: 16,
    maxWidth: 320,
    minWidth: 256,
  },
  sideNote: {
    color: tokens.colors.inkMute,
    fontFamily: tokens.typography.body,
    fontSize: 12,
    lineHeight: 18,
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
  emptyActionGroup: {
    gap: 6,
  },
  filteredEmptySecondary: {
    alignItems: 'flex-start',
    gap: 6,
  },
  emptyActionHint: {
    color: tokens.colors.inkMute,
    fontFamily: tokens.typography.body,
    fontSize: 12,
    lineHeight: 18,
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
    minWidth: 0,
  },
  highlightIdentityText: {
    flex: 1,
    gap: 4,
    minWidth: 0,
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
  highlightCompactTop: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  highlightCompactTopCompact: {
    alignItems: 'flex-start',
    flexDirection: 'column',
  },
  highlightCompactTickerBlock: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  highlightCompactTicker: {
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontSize: 22,
    fontWeight: '800',
  },
  highlightCompactComment: {
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.body,
    fontSize: 13,
    lineHeight: 20,
  },
  highlightCompactMetaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  highlightCompactMetaRowCompact: {
    alignItems: 'flex-start',
    flexDirection: 'column',
  },
  highlightCompactIdentity: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 10,
    minWidth: 0,
  },
  highlightCompactIdentityText: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  highlightCompactUser: {
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontSize: 14,
    fontWeight: '700',
  },
  highlightCompactMeta: {
    color: tokens.colors.inkMute,
    fontFamily: tokens.typography.body,
    fontSize: 12,
  },
  highlightCompactChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-end',
  },
  highlightCompactChipsNarrow: {
    justifyContent: 'flex-start',
    width: '100%',
  },
  highlightCompactLink: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    gap: 4,
  },
  highlightCompactLinkLabel: {
    color: tokens.colors.brandStrong,
    fontFamily: tokens.typography.heading,
    fontSize: 13,
    fontWeight: '700',
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
    gap: 10,
    paddingLeft: 12,
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
    gap: 10,
    justifyContent: 'space-between',
  },
  timelineHeaderCompact: {
    flexDirection: 'column',
  },
  identity: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 10,
  },
  identityText: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  user: {
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontSize: 14,
    fontWeight: '700',
  },
  handle: {
    color: tokens.colors.inkMute,
    fontFamily: tokens.typography.body,
    fontSize: 12,
  },
  timelineHeaderMeta: {
    maxWidth: '100%',
  },
  timelineHeadline: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  timelineHeadlineCompact: {
    flexDirection: 'column',
    gap: 6,
  },
  symbolText: {
    gap: 2,
    minWidth: 0,
  },
  ticker: {
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontSize: 22,
    fontWeight: '800',
  },
  company: {
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.body,
    fontSize: 12,
  },
  tradeTotal: {
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'right',
  },
  tradeTotalCompact: {
    textAlign: 'left',
    width: '100%',
  },
  tradeFactsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tradeFactPill: {
    backgroundColor: '#F8FAFC',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(214, 224, 234, 0.84)',
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  tradeFactLabel: {
    color: tokens.colors.inkMute,
    fontFamily: tokens.typography.body,
    fontSize: 11,
  },
  tradeFactValue: {
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontSize: 13,
    fontWeight: '700',
  },
  tradeFactValueDanger: {
    color: tokens.colors.danger,
  },
  commentCard: {
    backgroundColor: tokens.colors.surfaceMuted,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  comment: {
    color: tokens.colors.ink,
    fontFamily: tokens.typography.body,
    fontSize: 13,
    lineHeight: 20,
  },
  timelineFooter: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  timelineFooterCompact: {
    alignItems: 'flex-start',
    flexDirection: 'column',
  },
  reactionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  divider: {
    borderBottomColor: 'rgba(214, 224, 234, 0.8)',
    borderBottomWidth: 1,
    paddingBottom: 14,
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
