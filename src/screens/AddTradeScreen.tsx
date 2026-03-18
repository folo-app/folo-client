import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import type { MarketType, TradeType, TradeVisibility } from '../api/contracts';
import { foloApi } from '../api/services';
import { DataStatusCard } from '../components/DataStatusCard';
import { Chip, Page, PrimaryButton, SectionHeading, SurfaceCard } from '../components/ui';
import { setupMethods, tradeForm } from '../data/mock';
import { useStockPriceData, useStockSearchData } from '../hooks/useFoloData';
import { formatCurrency, formatPercent } from '../lib/format';
import type { RootStackParamList } from '../navigation/types';
import { tokens } from '../theme/tokens';

const visibilityOptions: Array<{ label: string; value: TradeVisibility }> = [
  { label: '전체 공개', value: 'PUBLIC' },
  { label: '친구만', value: 'FRIENDS_ONLY' },
  { label: '비공개', value: 'PRIVATE' },
];

const tradeTypeOptions: Array<{ label: string; value: TradeType }> = [
  { label: '매수', value: 'BUY' },
  { label: '매도', value: 'SELL' },
];

export function AddTradeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [query, setQuery] = useState<string>(tradeForm.ticker);
  const search = useStockSearchData(query);
  const [selectedTicker, setSelectedTicker] = useState<string>(tradeForm.ticker);
  const [selectedMarket, setSelectedMarket] = useState<MarketType>(tradeForm.market);
  const stockPrice = useStockPriceData(selectedTicker, selectedMarket);
  const [tradeType, setTradeType] = useState<TradeType>('BUY');
  const [quantity, setQuantity] = useState<string>('1');
  const [price, setPrice] = useState<string>(String(tradeForm.price));
  const [comment, setComment] = useState<string>(tradeForm.comment);
  const [visibility, setVisibility] = useState<TradeVisibility>('FRIENDS_ONLY');
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const selectedStock =
    search.data.stocks.find((item) => item.ticker === selectedTicker) ??
    search.data.stocks[0] ??
    null;

  async function handleSubmit() {
    if (!selectedStock) {
      setSubmitMessage('종목을 먼저 선택해 주세요.');
      return;
    }

    setSubmitting(true);
    setSubmitMessage(null);

    try {
      const trade = await foloApi.createTrade({
        ticker: selectedStock.ticker,
        market: selectedStock.market,
        tradeType,
        quantity: Number(quantity) || 0,
        price: Number(price) || stockPrice.data.currentPrice,
        comment,
        visibility,
        tradedAt: new Date().toISOString(),
      });

      setSubmitMessage('거래가 등록되었습니다.');
      navigation.navigate('TradeDetail', { tradeId: trade.tradeId });
    } catch (error) {
      setSubmitMessage(
        error instanceof Error
          ? `${error.message} 등록은 데모 상태로 유지합니다.`
          : '거래 등록에 실패했습니다.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Page
      eyebrow="Capture"
      title="거래 기록 추가"
      subtitle="종목 선택, 매수·매도 구분, 가격 범위 안내, 공개 범위 설정까지 한 화면에서 이어지는 형태로 정리했습니다."
      action={
        <Chip
          active
          label={search.source === 'api' ? '실시간 검색' : '샘플 검색'}
          tone={search.source === 'api' ? 'positive' : 'brand'}
        />
      }
    >
      <DataStatusCard
        error={search.error ?? stockPrice.error}
        loading={search.loading || stockPrice.loading}
        source={search.source === 'api' && stockPrice.source === 'api' ? 'api' : 'fallback'}
      />

      <SurfaceCard tone="hero">
        <SectionHeading
          title="빠른 입력 패널"
          description="기획서의 TradeAddScreen 흐름을 그대로 반영한 컴포저 프리뷰입니다."
        />
        <View style={styles.toggleRow}>
          {tradeTypeOptions.map((option) => (
            <Chip
              key={option.value}
              active={tradeType === option.value}
              label={option.label}
              tone={option.value === 'BUY' ? 'brand' : 'danger'}
              onPress={() => setTradeType(option.value)}
            />
          ))}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.fieldLabel}>종목 검색</Text>
          <TextInput
            onChangeText={setQuery}
            placeholder="티커 또는 종목명"
            placeholderTextColor={tokens.colors.inkMute}
            style={styles.input}
            value={query}
          />
        </View>

        <View style={styles.searchResults}>
          {search.data.stocks.slice(0, 4).map((item) => (
            <Pressable
              key={item.ticker}
              onPress={() => {
                setSelectedTicker(item.ticker);
                setSelectedMarket(item.market);
                setQuery(item.ticker);
                setPrice(String(item.currentPrice));
              }}
              style={[styles.searchItem, selectedTicker === item.ticker && styles.searchItemActive]}
            >
              <View style={styles.searchText}>
                <Text style={styles.searchTicker}>{item.ticker}</Text>
                <Text style={styles.searchName}>{item.name}</Text>
              </View>
              <Text style={styles.searchPrice}>
                {formatCurrency(item.currentPrice, item.market)}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.formGrid}>
          <View style={styles.inputGroup}>
            <Text style={styles.fieldLabel}>수량 / 금액</Text>
            <TextInput
              keyboardType="decimal-pad"
              onChangeText={setQuantity}
              style={styles.input}
              value={quantity}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.fieldLabel}>가격</Text>
            <TextInput
              keyboardType="decimal-pad"
              onChangeText={setPrice}
              style={styles.input}
              value={price}
            />
            {selectedStock ? (
              <Text style={styles.fieldSupporting}>
                현재가 {formatCurrency(stockPrice.data.currentPrice, selectedStock.market)} · 등락{' '}
                {formatPercent(stockPrice.data.dayReturnRate)}
              </Text>
            ) : null}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.fieldLabel}>한 줄 코멘트</Text>
          <TextInput
            multiline
            onChangeText={setComment}
            style={[styles.input, styles.textArea]}
            value={comment}
          />
        </View>

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

        {submitMessage ? <Text style={styles.submitMessage}>{submitMessage}</Text> : null}
        <PrimaryButton
          label={submitting ? '등록 중...' : '거래 등록 시도'}
          onPress={handleSubmit}
        />
      </SurfaceCard>

      <SectionHeading
        title="초기 포트폴리오 세팅"
        description="PortfolioSetupScreen에서 들어갈 수 있는 3가지 진입 방식을 바로 비교할 수 있게 배치했습니다."
      />
      {setupMethods.map((method) => (
        <SurfaceCard key={method.title}>
          <Text style={styles.methodTitle}>{method.title}</Text>
          <Text style={styles.methodDescription}>{method.description}</Text>
        </SurfaceCard>
      ))}
    </Page>
  );
}

const styles = StyleSheet.create({
  toggleRow: {
    flexDirection: 'row',
    gap: 10,
  },
  formGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  inputGroup: {
    flex: 1,
    gap: 8,
  },
  fieldLabel: {
    fontSize: 12,
    color: tokens.colors.inkMute,
    fontFamily: tokens.typography.body,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.84)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(214, 224, 234, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: tokens.colors.navy,
    fontFamily: tokens.typography.body,
  },
  fieldSupporting: {
    fontSize: 12,
    color: tokens.colors.brandStrong,
    fontFamily: tokens.typography.body,
  },
  textArea: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  searchResults: {
    gap: 10,
  },
  searchItem: {
    backgroundColor: 'rgba(255,255,255,0.76)',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(214, 224, 234, 0.9)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'center',
  },
  searchItemActive: {
    borderColor: tokens.colors.navy,
    backgroundColor: '#F7FAFF',
  },
  searchText: {
    gap: 4,
    flex: 1,
  },
  searchTicker: {
    fontSize: 15,
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontWeight: '800',
  },
  searchName: {
    fontSize: 13,
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.body,
  },
  searchPrice: {
    fontSize: 14,
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontWeight: '700',
  },
  visibilityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  submitMessage: {
    fontSize: 13,
    lineHeight: 20,
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.body,
  },
  methodTitle: {
    fontSize: 18,
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontWeight: '800',
  },
  methodDescription: {
    fontSize: 14,
    lineHeight: 22,
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.body,
  },
});
