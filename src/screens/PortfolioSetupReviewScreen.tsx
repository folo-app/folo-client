import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { TradeVisibility } from '../api/contracts';
import { foloApi } from '../api/services';
import { BottomActionBar, Chip, PrimaryButton } from '../components/ui';
import { syncAllWidgetsInBackground } from '../features/widgets';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import { formatDateInputValue, isValidDateInput, toIsoDateInput } from '../lib/dateInput';
import { formatCurrency } from '../lib/format';
import type { PortfolioSetupSelection, RootStackParamList } from '../navigation/types';
import { tokens } from '../theme/tokens';

type DraftItem = PortfolioSetupSelection & {
  quantity: string;
  avgPrice: string;
  tradedOn: string;
  comment: string;
  visibility: TradeVisibility;
};

const visibilityOptions: Array<{ label: string; value: TradeVisibility }> = [
  { label: '전체 공개', value: 'PUBLIC' },
  { label: '친구만', value: 'FRIENDS_ONLY' },
  { label: '비공개', value: 'PRIVATE' },
];

function selectionKey(item: Pick<PortfolioSetupSelection, 'market' | 'ticker'>) {
  return `${item.market}:${item.ticker}`;
}

export function PortfolioSetupReviewScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route =
    useRoute<RouteProp<RootStackParamList, 'PortfolioSetupReview'>>();
  const { isCompact } = useResponsiveLayout();
  const [items, setItems] = useState<DraftItem[]>(() =>
    route.params.selections.map((item) => ({
      ...item,
      quantity: '1',
      avgPrice: item.currentPrice > 0 ? String(item.currentPrice) : '',
      tradedOn: formatDateInputValue(),
      comment: '',
      visibility: 'PRIVATE',
    })),
  );
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const disabled = useMemo(
    () =>
      items.length === 0 ||
      items.some(
        (item) =>
          (Number(item.quantity) || 0) <= 0 ||
          (Number(item.avgPrice) || 0) <= 0 ||
          !isValidDateInput(item.tradedOn),
      ),
    [items],
  );

  function updateItem(
    key: string,
    field: keyof Pick<DraftItem, 'quantity' | 'avgPrice' | 'tradedOn' | 'comment' | 'visibility'>,
    value: string,
  ) {
    setItems((current) =>
      current.map((item) =>
        selectionKey(item) === key ? { ...item, [field]: value } : item,
      ),
    );
  }

  function removeItem(key: string) {
    setItems((current) => current.filter((item) => selectionKey(item) !== key));
  }

  async function handleSubmit() {
    if (disabled) {
      setMessage('수량, 평균 매수가, 거래일을 모두 올바르게 입력해 주세요.');
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      for (const item of items) {
        const tradedAt = toIsoDateInput(item.tradedOn);

        if (!tradedAt) {
          setMessage('모든 거래일을 YYYY-MM-DD 형식으로 입력해 주세요.');
          return;
        }

        await foloApi.createTrade({
          ticker: item.ticker,
          market: item.market,
          tradeType: 'BUY',
          quantity: Number(item.quantity),
          price: Number(item.avgPrice),
          comment: item.comment.trim() || null,
          visibility: item.visibility,
          tradedAt,
        });
      }

      syncAllWidgetsInBackground();
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs', params: { screen: 'Portfolio' } }],
      });
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : '포트폴리오 저장에 실패했습니다.',
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
            <View style={styles.header}>
              <Text style={styles.title}>보유 수량과 평균 매수가 입력</Text>
              <Text style={styles.subtitle}>
                초기 포트폴리오는 각 종목을 대표 거래 1건으로 저장합니다. 거래일,
                메모, 공개 범위를 같이 남기면 나중에 보정할 때도 맥락이 유지됩니다.
              </Text>
            </View>

            {items.map((item) => {
              const key = selectionKey(item);

              return (
                <View key={key} style={styles.card}>
                  <View style={[styles.cardHeader, isCompact && styles.cardHeaderCompact]}>
                    <View style={styles.cardText}>
                      <Text style={styles.cardTitle}>
                        {item.name} · {item.ticker}
                      </Text>
                      <Text style={styles.cardMeta}>
                        {item.market} · 현재가 {formatCurrency(item.currentPrice, item.market)}
                      </Text>
                    </View>
                    <Pressable onPress={() => removeItem(key)} style={styles.removeButton}>
                      <Text style={styles.removeButtonText}>삭제</Text>
                    </Pressable>
                  </View>

                  <View style={[styles.formRow, isCompact && styles.formRowCompact]}>
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>수량</Text>
                      <TextInput
                        keyboardType="decimal-pad"
                        onChangeText={(value) => updateItem(key, 'quantity', value)}
                        placeholder="예: 10"
                        placeholderTextColor={tokens.colors.inkMute}
                        style={styles.input}
                        value={item.quantity}
                      />
                    </View>
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>평균 매수가</Text>
                      <TextInput
                        keyboardType="decimal-pad"
                        onChangeText={(value) => updateItem(key, 'avgPrice', value)}
                        placeholder="예: 183.5"
                        placeholderTextColor={tokens.colors.inkMute}
                        style={styles.input}
                        value={item.avgPrice}
                      />
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>거래일</Text>
                    <TextInput
                      autoCapitalize="none"
                      autoCorrect={false}
                      onChangeText={(value) => updateItem(key, 'tradedOn', value)}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor={tokens.colors.inkMute}
                      style={styles.input}
                      value={item.tradedOn}
                    />
                    <Text style={styles.helperText}>예: 2026-04-03</Text>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>한 줄 메모</Text>
                    <TextInput
                      multiline
                      onChangeText={(value) => updateItem(key, 'comment', value)}
                      placeholder="처음 산 이유나 메모가 있으면 남겨 주세요."
                      placeholderTextColor={tokens.colors.inkMute}
                      style={[styles.input, styles.textArea]}
                      value={item.comment}
                    />
                  </View>

                  <View style={styles.visibilitySection}>
                    <Text style={styles.label}>공개 범위</Text>
                    <View style={styles.visibilityRow}>
                      {visibilityOptions.map((option) => (
                        <Chip
                          key={`${key}-${option.value}`}
                          active={item.visibility === option.value}
                          label={option.label}
                          onPress={() => updateItem(key, 'visibility', option.value)}
                        />
                      ))}
                    </View>
                  </View>
                </View>
              );
            })}

            <View style={styles.secondaryActions}>
              <Pressable onPress={() => navigation.navigate('ImportOnboarding')}>
                <Text style={styles.secondaryActionText}>CSV/OCR 가져오기로 전환</Text>
              </Pressable>
            </View>

            {message ? <Text style={styles.errorText}>{message}</Text> : null}
          </ScrollView>

          <BottomActionBar>
            <PrimaryButton
              disabled={disabled || submitting}
              label={submitting ? '저장 중...' : '포트폴리오 만들기'}
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
    paddingBottom: 130,
    gap: 16,
  },
  scrollContentCompact: {
    paddingHorizontal: 16,
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
  card: {
    borderRadius: 24,
    backgroundColor: tokens.colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(214, 224, 234, 0.92)',
    padding: 18,
    gap: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cardHeaderCompact: {
    alignItems: 'flex-start',
    flexDirection: 'column',
  },
  cardText: {
    flex: 1,
    gap: 6,
  },
  cardTitle: {
    fontSize: 17,
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontWeight: '800',
  },
  cardMeta: {
    fontSize: 13,
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.body,
  },
  removeButton: {
    borderRadius: 999,
    backgroundColor: tokens.colors.surfaceMuted,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  removeButtonText: {
    fontSize: 12,
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.heading,
    fontWeight: '700',
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
  helperText: {
    fontSize: 12,
    lineHeight: 18,
    color: tokens.colors.inkMute,
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
  secondaryActions: {
    alignItems: 'center',
  },
  secondaryActionText: {
    fontSize: 13,
    color: tokens.colors.inkMute,
    fontFamily: tokens.typography.body,
  },
  errorText: {
    fontSize: 13,
    color: tokens.colors.danger,
    fontFamily: tokens.typography.body,
    textAlign: 'center',
  },
});
