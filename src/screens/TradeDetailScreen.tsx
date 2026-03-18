import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { StyleSheet, Text, View } from 'react-native';

import { DataStatusCard } from '../components/DataStatusCard';
import { Chip, Page, SectionHeading, SurfaceCard } from '../components/ui';
import { useTradeCommentsData, useTradeDetailData } from '../hooks/useFoloData';
import {
  formatCurrency,
  formatDateLabel,
  reactionEmojiLabel,
  tradeTypeLabel,
  visibilityLabel,
} from '../lib/format';
import type { RootStackParamList } from '../navigation/types';
import { tokens } from '../theme/tokens';

export function TradeDetailScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'TradeDetail'>>();
  const trade = useTradeDetailData(route.params.tradeId);
  const comments = useTradeCommentsData(route.params.tradeId);
  const isApiConnected = trade.source === 'api' && comments.source === 'api';

  return (
    <Page
      eyebrow="Trade Detail"
      title={`${trade.data.ticker} 거래 상세`}
      subtitle="피드 카드에서 빠져 있던 수량, 총액, 공개 범위, 댓글 목록을 상세 화면으로 분리했습니다."
      action={
        <Chip
          active
          label={isApiConnected ? 'API 연결' : '샘플 데이터'}
          tone={isApiConnected ? 'positive' : 'brand'}
        />
      }
    >
      <DataStatusCard
        error={trade.error ?? comments.error}
        loading={trade.loading || comments.loading}
        source={isApiConnected ? 'api' : 'fallback'}
      />

      <SurfaceCard tone="hero">
        <View style={styles.header}>
          <View style={styles.titleBlock}>
            <Text style={styles.ticker}>{trade.data.ticker}</Text>
            <Text style={styles.name}>{trade.data.name}</Text>
          </View>
          <Chip
            active
            label={`${tradeTypeLabel(trade.data.tradeType)} · ${visibilityLabel(trade.data.visibility)}`}
            tone={trade.data.tradeType === 'BUY' ? 'brand' : 'danger'}
          />
        </View>
        <View style={styles.metrics}>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>수량</Text>
            <Text style={styles.metricValue}>{trade.data.quantity}</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>가격</Text>
            <Text style={styles.metricValue}>
              {formatCurrency(trade.data.price, trade.data.market)}
            </Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>총액</Text>
            <Text style={styles.metricValue}>
              {formatCurrency(trade.data.totalAmount, trade.data.market)}
            </Text>
          </View>
        </View>
        <Text style={styles.comment}>{trade.data.comment ?? '작성된 코멘트가 없습니다.'}</Text>
        <Text style={styles.timestamp}>{formatDateLabel(trade.data.tradedAt)}</Text>
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeading
          title="리액션"
          description="백엔드 ReactionSummary 구조를 그대로 반영했습니다."
        />
        <View style={styles.reactionRow}>
          {trade.data.reactions.map((reaction) => (
            <Chip
              key={`${reaction.emoji}-${reaction.count}`}
              label={`${reactionEmojiLabel(reaction.emoji)} ${reaction.count}`}
              tone={reaction.isMyReaction ? 'brand' : 'default'}
            />
          ))}
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeading
          title="댓글"
          description={`총 ${comments.data.totalCount}개의 댓글`}
        />
        {comments.data.comments.map((comment, index) => (
          <View
            key={comment.commentId}
            style={[
              styles.commentRow,
              index < comments.data.comments.length - 1 && styles.divider,
            ]}
          >
            <Text style={styles.commentAuthor}>{comment.user.nickname}</Text>
            <Text style={styles.commentContent}>{comment.content}</Text>
            <Text style={styles.commentTime}>{formatDateLabel(comment.createdAt)}</Text>
          </View>
        ))}
      </SurfaceCard>
    </Page>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'center',
  },
  titleBlock: {
    gap: 6,
    flex: 1,
  },
  ticker: {
    fontSize: 28,
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontWeight: '800',
  },
  name: {
    fontSize: 14,
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.body,
  },
  metrics: {
    flexDirection: 'row',
    gap: 12,
  },
  metric: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.78)',
    borderRadius: 18,
    padding: 14,
    gap: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: tokens.colors.inkMute,
    fontFamily: tokens.typography.body,
  },
  metricValue: {
    fontSize: 15,
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
  timestamp: {
    fontSize: 12,
    color: tokens.colors.inkMute,
    fontFamily: tokens.typography.body,
  },
  reactionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  commentRow: {
    gap: 6,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(214, 224, 234, 0.8)',
    paddingBottom: 16,
    marginBottom: 16,
  },
  commentAuthor: {
    fontSize: 14,
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontWeight: '700',
  },
  commentContent: {
    fontSize: 14,
    lineHeight: 22,
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.body,
  },
  commentTime: {
    fontSize: 12,
    color: tokens.colors.inkMute,
    fontFamily: tokens.typography.body,
  },
});
