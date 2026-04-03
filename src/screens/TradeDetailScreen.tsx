import { useEffect, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import type {
  ReactionEmoji,
  TradeVisibility,
} from '../api/contracts';
import { foloApi } from '../api/services';
import { useAuth } from '../auth/AuthProvider';
import { DataStatusCard } from '../components/DataStatusCard';
import {
  Chip,
  MetricGrid,
  Page,
  PageBackButton,
  PrimaryButton,
  SectionHeading,
  SurfaceCard,
} from '../components/ui';
import { syncAllWidgetsInBackground } from '../features/widgets';
import { useTradeCommentsData, useTradeDetailData } from '../hooks/useFoloData';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import { useMutation } from '../hooks/query';
import {
  formatCurrency,
  formatDateLabel,
  reactionEmojiLabel,
  tradeTypeLabel,
  visibilityLabel,
} from '../lib/format';
import type { RootStackParamList } from '../navigation/types';
import { tokens } from '../theme/tokens';

const REACTION_OPTIONS: ReactionEmoji[] = ['FIRE', 'EYES', 'DIAMOND', 'CLAP', 'ROCKET'];
const VISIBILITY_OPTIONS: TradeVisibility[] = ['PUBLIC', 'FRIENDS_ONLY', 'PRIVATE'];

export function TradeDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'TradeDetail'>>();
  const { isCompact } = useResponsiveLayout();
  const { session } = useAuth();
  const trade = useTradeDetailData(route.params.tradeId);
  const comments = useTradeCommentsData(route.params.tradeId);
  const [commentDraft, setCommentDraft] = useState('');
  const [editComment, setEditComment] = useState('');
  const [editVisibility, setEditVisibility] = useState<TradeVisibility>('PRIVATE');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const createCommentMutation = useMutation({
    mutationFn: async (content: string) =>
      foloApi.createComment(route.params.tradeId, { content }),
  });
  const updateTradeMutation = useMutation({
    mutationFn: async (variables: { comment: string | null; visibility: TradeVisibility }) =>
      foloApi.updateTrade(route.params.tradeId, variables),
  });
  const deleteTradeMutation = useMutation({
    mutationFn: async () => foloApi.deleteTrade(route.params.tradeId),
  });
  const reactionMutation = useMutation({
    mutationFn: async (emoji: ReactionEmoji) => {
      const currentReaction = trade.data.reactions.find((item) => item.isMyReaction);
      if (currentReaction?.emoji === emoji) {
        return foloApi.removeTradeReaction(route.params.tradeId);
      }
      return foloApi.reactToTrade(route.params.tradeId, { emoji });
    },
  });
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: number) =>
      foloApi.deleteComment(route.params.tradeId, commentId),
  });

  const isOwner = trade.data.user.userId === session?.userId;
  const mutationError =
    createCommentMutation.error ??
    updateTradeMutation.error ??
    deleteTradeMutation.error ??
    reactionMutation.error ??
    deleteCommentMutation.error;
  const mutationPending =
    createCommentMutation.pending ||
    updateTradeMutation.pending ||
    deleteTradeMutation.pending ||
    reactionMutation.pending ||
    deleteCommentMutation.pending;

  useEffect(() => {
    setEditComment(trade.data.comment ?? '');
    setEditVisibility(trade.data.visibility);
  }, [trade.data.comment, trade.data.tradeId, trade.data.visibility]);

  async function refreshAll() {
    trade.refresh();
    comments.refresh();
  }

  async function handleCreateComment() {
    const content = commentDraft.trim();

    if (!content) {
      return;
    }

    try {
      await createCommentMutation.mutate(content);
      setCommentDraft('');
      setActionSuccess('댓글을 등록했습니다.');
      refreshAll();
    } catch {}
  }

  async function handleSaveTrade() {
    try {
      await updateTradeMutation.mutate({
        comment: editComment.trim() ? editComment.trim() : null,
        visibility: editVisibility,
      });
      syncAllWidgetsInBackground();
      setActionSuccess('거래 공개 범위와 코멘트를 저장했습니다.');
      refreshAll();
    } catch {}
  }

  async function handleDeleteTrade() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    try {
      await deleteTradeMutation.mutate(undefined);
      syncAllWidgetsInBackground();
      navigation.goBack();
    } catch {}
  }

  async function handleDeleteComment(commentId: number) {
    try {
      await deleteCommentMutation.mutate(commentId);
      setActionSuccess('댓글을 삭제했습니다.');
      refreshAll();
    } catch {}
  }

  async function handleToggleReaction(emoji: ReactionEmoji) {
    try {
      await reactionMutation.mutate(emoji);
      setActionSuccess('리액션을 업데이트했습니다.');
      refreshAll();
    } catch {}
  }

  function handleOpenAuthorProfile() {
    if (!trade.data.user.userId || trade.data.user.userId === session?.userId) {
      navigation.navigate('MainTabs', { screen: 'Profile' });
      return;
    }

    navigation.navigate('UserProfile', {
      userId: trade.data.user.userId,
      nickname: trade.data.user.nickname,
    });
  }

  return (
    <Page
      eyebrow="Trade Detail"
      title={trade.data.ticker ? `${trade.data.ticker} 거래 상세` : '거래 상세'}
      leading={<PageBackButton />}
    >
      <DataStatusCard
        error={trade.error ?? comments.error ?? mutationError}
        loading={trade.loading || comments.loading || mutationPending}
      />

      {actionSuccess ? <Text style={styles.feedback}>{actionSuccess}</Text> : null}

      {!trade.loading && trade.data.tradeId === 0 ? (
        <SurfaceCard>
          <Text style={styles.emptyText}>거래 정보를 찾을 수 없습니다.</Text>
        </SurfaceCard>
      ) : (
        <>
          <SurfaceCard tone="hero">
            <View style={styles.header}>
              <View style={styles.titleBlock}>
                <Text style={styles.ticker}>{trade.data.ticker}</Text>
                <Text style={styles.name}>{trade.data.name}</Text>
                <Pressable onPress={handleOpenAuthorProfile} style={styles.authorLink}>
                  <Text style={styles.authorText}>
                    {trade.data.user.nickname} 프로필 보기
                  </Text>
                </Pressable>
              </View>
              <View style={styles.headerChipWrap}>
                <Chip
                  active
                  label={`${tradeTypeLabel(trade.data.tradeType)} · ${visibilityLabel(trade.data.visibility)}`}
                  tone={trade.data.tradeType === 'BUY' ? 'brand' : 'danger'}
                />
              </View>
            </View>
            <MetricGrid>
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
            </MetricGrid>
            <Text style={styles.comment}>
              {trade.data.comment ?? '작성된 코멘트가 없습니다.'}
            </Text>
            <Text style={styles.timestamp}>{formatDateLabel(trade.data.tradedAt)}</Text>
          </SurfaceCard>

          {isOwner ? (
            <SurfaceCard>
              <SectionHeading title="거래 수정" description="코멘트와 공개 범위를 바꿀 수 있습니다." />
              <TextInput
                multiline
                onChangeText={setEditComment}
                placeholder="거래 코멘트를 입력하세요."
                placeholderTextColor={tokens.colors.inkMute}
                style={styles.input}
                textAlignVertical="top"
                value={editComment}
              />
              <View style={styles.reactionRow}>
                {VISIBILITY_OPTIONS.map((value) => (
                  <Chip
                    key={value}
                    active={editVisibility === value}
                    label={visibilityLabel(value)}
                    onPress={() => setEditVisibility(value)}
                    tone={editVisibility === value ? 'brand' : 'default'}
                  />
                ))}
              </View>
              <View style={styles.actionColumn}>
                <PrimaryButton
                  label={updateTradeMutation.pending ? '저장 중...' : '거래 수정 저장'}
                  onPress={handleSaveTrade}
                  disabled={updateTradeMutation.pending}
                />
                <PrimaryButton
                  label={
                    deleteTradeMutation.pending
                      ? '삭제 중...'
                      : confirmDelete
                        ? '한 번 더 누르면 삭제'
                        : '거래 삭제'
                  }
                  onPress={handleDeleteTrade}
                  disabled={deleteTradeMutation.pending}
                  variant="secondary"
                />
              </View>
            </SurfaceCard>
          ) : null}

          <SurfaceCard>
            <SectionHeading title="리액션" />
            <View style={styles.reactionRow}>
              {REACTION_OPTIONS.map((emoji) => {
                const summary = trade.data.reactions.find((reaction) => reaction.emoji === emoji);
                return (
                  <Chip
                    key={emoji}
                    active={summary?.isMyReaction}
                    label={`${reactionEmojiLabel(emoji)} ${summary?.count ?? 0}`}
                    onPress={() => handleToggleReaction(emoji)}
                    tone={summary?.isMyReaction ? 'brand' : 'default'}
                  />
                );
              })}
            </View>
          </SurfaceCard>

          <SurfaceCard>
            <SectionHeading title="댓글 작성" />
            <TextInput
              multiline
              onChangeText={setCommentDraft}
              placeholder="이 거래에 대한 의견을 남겨보세요."
              placeholderTextColor={tokens.colors.inkMute}
              style={styles.input}
              textAlignVertical="top"
              value={commentDraft}
            />
            <PrimaryButton
              label={createCommentMutation.pending ? '등록 중...' : '댓글 등록'}
              onPress={handleCreateComment}
              disabled={createCommentMutation.pending}
            />
          </SurfaceCard>

          <SurfaceCard>
            <SectionHeading
              title="댓글"
              description={`총 ${comments.data.totalCount}개의 댓글`}
            />
            {comments.data.comments.length === 0 ? (
              <Text style={styles.emptyText}>아직 등록된 댓글이 없습니다.</Text>
            ) : (
              comments.data.comments.map((comment, index) => (
                <View
                  key={comment.commentId}
                  style={[
                    styles.commentRow,
                    index < comments.data.comments.length - 1 && styles.divider,
                  ]}
                >
                  <View style={[styles.commentHeader, isCompact && styles.commentHeaderCompact]}>
                    <Text style={styles.commentAuthor}>{comment.user.nickname}</Text>
                    {comment.isMyComment ? (
                      <Chip
                        label="삭제"
                        onPress={() => handleDeleteComment(comment.commentId)}
                        tone="danger"
                      />
                    ) : null}
                  </View>
                  <Text style={styles.commentContent}>{comment.content}</Text>
                  <Text style={styles.commentTime}>{formatDateLabel(comment.createdAt)}</Text>
                </View>
              ))
            )}
          </SurfaceCard>
        </>
      )}
    </Page>
  );
}

const styles = StyleSheet.create({
  actionColumn: {
    gap: 10,
  },
  authorLink: {
    alignSelf: 'flex-start',
  },
  authorText: {
    fontSize: 13,
    color: tokens.colors.brandStrong,
    fontFamily: tokens.typography.body,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'center',
    flexWrap: 'wrap',
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
  metric: {
    flex: 1,
    minWidth: 120,
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
  headerChipWrap: {
    maxWidth: '100%',
  },
  commentRow: {
    gap: 6,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  commentHeaderCompact: {
    alignItems: 'flex-start',
    flexDirection: 'column',
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
  emptyText: {
    fontSize: 14,
    lineHeight: 22,
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.body,
  },
  input: {
    minHeight: 108,
    backgroundColor: 'rgba(255,255,255,0.84)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(214, 224, 234, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    lineHeight: 22,
    color: tokens.colors.navy,
    fontFamily: tokens.typography.body,
  },
  feedback: {
    fontSize: 13,
    color: tokens.colors.brandStrong,
    fontFamily: tokens.typography.body,
  },
});
