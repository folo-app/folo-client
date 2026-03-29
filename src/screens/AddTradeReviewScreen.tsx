import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { TradeType, TradeVisibility } from '../api/contracts';
import { foloApi } from '../api/services';
import {
  BottomActionBar,
  Chip,
  PageBackButton,
  PrimaryButton,
  SurfaceCard,
} from '../components/ui';
import { syncGrowthWidgetSnapshotInBackground } from '../features/widgets';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import { formatCurrency } from '../lib/format';
import type { RootStackParamList } from '../navigation/types';
import { tokens } from '../theme/tokens';

const tradeTypeOptions: Array<{ label: string; value: TradeType }> = [
  { label: '매수', value: 'BUY' },
  { label: '매도', value: 'SELL' },
];

const visibilityOptions: Array<{ label: string; value: TradeVisibility }> = [
  { label: '전체 공개', value: 'PUBLIC' },
  { label: '친구만', value: 'FRIENDS_ONLY' },
  { label: '비공개', value: 'PRIVATE' },
];

export function AddTradeReviewScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'AddTradeReview'>>();
  const { isCompact } = useResponsiveLayout();
  const { selection } = route.params;
  const [tradeType, setTradeType] = useState<TradeType>('BUY');
  const [quantity, setQuantity] = useState('1');
  const [avgPrice, setAvgPrice] = useState(
    selection.currentPrice > 0 ? String(selection.currentPrice) : '',
  );
  const [comment, setComment] = useState('');
  const [visibility, setVisibility] = useState<TradeVisibility>('FRIENDS_ONLY');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const disabled = useMemo(
    () => (Number(quantity) || 0) <= 0 || (Number(avgPrice) || 0) <= 0,
    [avgPrice, quantity],
  );

  async function handleSubmit() {
    if (disabled) {
      setMessage('수량과 평균 매수가를 모두 입력해 주세요.');
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const trade = await foloApi.createTrade({
        ticker: selection.ticker,
        market: selection.market,
        tradeType,
        quantity: Number(quantity),
        price: Number(avgPrice),
        comment: comment.trim() || null,
        visibility,
        tradedAt: new Date().toISOString(),
      });

      syncGrowthWidgetSnapshotInBackground();
      navigation.replace('TradeDetail', { tradeId: trade.tradeId });
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : '거래 기록 저장에 실패했습니다.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboard}
      >
        <View style={styles.container}>
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              isCompact && styles.scrollContentCompact,
            ]}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.headerChrome}>
              <PageBackButton />
            </View>

            <View style={styles.header}>
              <Text style={styles.title}>수량과 평균 매수가 입력</Text>
              <Text style={styles.subtitle}>
                선택한 종목 기준으로 매수 또는 매도 기록을 남깁니다. 공개 범위와
                한 줄 메모는 선택 사항입니다.
              </Text>
            </View>

            <SurfaceCard tone="hero">
              <View style={styles.selectionHeader}>
                <Text style={styles.selectionTitle}>
                  {selection.name} · {selection.ticker}
                </Text>
                <Text style={styles.selectionMeta}>
                  {selection.market} · 현재가{' '}
                  {formatCurrency(selection.currentPrice, selection.market)}
                </Text>
              </View>
            </SurfaceCard>

            <View style={styles.toggleRow}>
              {tradeTypeOptions.map((option) => (
                <Chip
                  key={option.value}
                  active={tradeType === option.value}
                  label={option.label}
                  onPress={() => setTradeType(option.value)}
                  tone={option.value === 'BUY' ? 'brand' : 'danger'}
                />
              ))}
            </View>

            <SurfaceCard>
              <View style={[styles.formRow, isCompact && styles.formRowCompact]}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>수량</Text>
                  <TextInput
                    keyboardType="decimal-pad"
                    onChangeText={setQuantity}
                    placeholder="예: 10"
                    placeholderTextColor={tokens.colors.inkMute}
                    style={styles.input}
                    value={quantity}
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>평균 매수가</Text>
                  <TextInput
                    keyboardType="decimal-pad"
                    onChangeText={setAvgPrice}
                    placeholder="예: 183.5"
                    placeholderTextColor={tokens.colors.inkMute}
                    style={styles.input}
                    value={avgPrice}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>한 줄 메모</Text>
                <TextInput
                  multiline
                  onChangeText={setComment}
                  placeholder="기록해 두고 싶은 매수/매도 이유가 있으면 남겨 주세요."
                  placeholderTextColor={tokens.colors.inkMute}
                  style={[styles.input, styles.textArea]}
                  value={comment}
                />
              </View>

              <View style={styles.visibilitySection}>
                <Text style={styles.label}>공개 범위</Text>
                <View style={styles.visibilityRow}>
                  {visibilityOptions.map((option) => (
                    <Chip
                      key={option.value}
                      active={visibility === option.value}
                      label={option.label}
                      onPress={() => setVisibility(option.value)}
                    />
                  ))}
                </View>
              </View>
            </SurfaceCard>

            {message ? <Text style={styles.errorText}>{message}</Text> : null}
          </ScrollView>

          <BottomActionBar>
            <PrimaryButton
              disabled={disabled || submitting}
              label={submitting ? '저장 중...' : '거래 기록 추가'}
              onPress={handleSubmit}
            />
          </BottomActionBar>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: tokens.colors.canvas,
  },
  keyboard: {
    flex: 1,
  },
  container: {
    flex: 1,
    width: '100%',
    maxWidth: tokens.layout.maxWidth,
    alignSelf: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 150,
    gap: 16,
  },
  scrollContentCompact: {
    paddingHorizontal: 16,
  },
  headerChrome: {
    alignItems: 'flex-start',
  },
  header: {
    gap: 10,
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 24,
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.body,
  },
  selectionHeader: {
    gap: 6,
  },
  selectionTitle: {
    fontSize: 18,
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontWeight: '800',
  },
  selectionMeta: {
    fontSize: 13,
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.body,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 10,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  formRowCompact: {
    flexDirection: 'column',
  },
  inputGroup: {
    flex: 1,
    gap: 8,
  },
  label: {
    fontSize: 12,
    color: tokens.colors.inkMute,
    fontFamily: tokens.typography.body,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(214, 224, 234, 0.92)',
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    color: tokens.colors.navy,
    fontFamily: tokens.typography.body,
  },
  textArea: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  visibilitySection: {
    gap: 10,
  },
  visibilityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  errorText: {
    fontSize: 13,
    color: tokens.colors.danger,
    fontFamily: tokens.typography.body,
    textAlign: 'center',
  },
});
