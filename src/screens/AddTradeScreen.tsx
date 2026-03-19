import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import type { MarketType, TradeType, TradeVisibility } from '../api/contracts';
import { foloApi } from '../api/services';
import { DataStatusCard } from '../components/DataStatusCard';
import { Chip, Page, PrimaryButton, SectionHeading, SurfaceCard } from '../components/ui';
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
  const [query, setQuery] = useState<string>('');
  const search = useStockSearchData(query);
  const [selectedTicker, setSelectedTicker] = useState<string>('');
  const [selectedMarket, setSelectedMarket] = useState<MarketType>('NASDAQ');
  const stockPrice = useStockPriceData(selectedTicker, selectedMarket);
  const [tradeType, setTradeType] = useState<TradeType>('BUY');
  const [quantity, setQuantity] = useState<string>('1');
  const [price, setPrice] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [visibility, setVisibility] = useState<TradeVisibility>('FRIENDS_ONLY');
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const searchReady = query.trim().length >= 2;

  const selectedStock =
    search.data.stocks.find((item) => item.ticker === selectedTicker) ??
    search.data.stocks[0] ??
    null;

  async function handleSubmit() {
    if (!selectedStock) {
      setSubmitMessage('종목을 먼저 선택해 주세요.');
      return;
    }

    if ((Number(quantity) || 0) <= 0) {
      setSubmitMessage('수량은 0보다 커야 합니다.');
      return;
    }

    if ((Number(price) || stockPrice.data.currentPrice) <= 0) {
      setSubmitMessage('가격을 확인해 주세요.');
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
        comment: comment.trim() || null,
        visibility,
        tradedAt: new Date().toISOString(),
      });

      setSubmitMessage('거래가 등록되었습니다.');
      navigation.navigate('TradeDetail', { tradeId: trade.tradeId });
    } catch (error) {
      setSubmitMessage(
        error instanceof Error ? error.message : '거래 등록에 실패했습니다.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Page
      eyebrow="Capture"
      title="거래 기록 추가"
      subtitle="종목 검색 결과와 현재가 정보를 바탕으로 실제 거래를 바로 저장합니다."
    >
      <DataStatusCard
        error={search.error ?? stockPrice.error}
        loading={(searchReady && search.loading) || (Boolean(selectedTicker) && stockPrice.loading)}
      />

      <SurfaceCard tone="muted">
        <SectionHeading
          title="처음 시작하는 경우"
          description="초기 포트폴리오는 전용 직접 추가 화면에서 만드는 편이 빠릅니다. 이 화면은 개별 거래를 나중에 보정하거나 추가 기록할 때 더 적합합니다."
        />
        <View style={styles.importActionStack}>
          <PrimaryButton
            label="포트폴리오 직접 추가"
            onPress={() => navigation.navigate('PortfolioSetup')}
            variant="secondary"
          />
          <PrimaryButton
            label="CSV / OCR 가져오기"
            onPress={() => navigation.navigate('ImportOnboarding')}
            variant="secondary"
          />
        </View>
      </SurfaceCard>

      <SurfaceCard tone="hero">
        <SectionHeading
          title="빠른 입력 패널"
          description="국장은 종목번호, 미국장은 티커로 검색할 수 있습니다. 포트폴리오를 만든 뒤 세부 거래를 추가로 기록할 때 사용합니다."
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
            placeholder="예: AAPL, 005930, Apple, 삼성"
            placeholderTextColor={tokens.colors.inkMute}
            style={styles.input}
            value={query}
          />
          <Text style={styles.fieldSupporting}>
            검색은 2자 이상부터 시작됩니다.
          </Text>
        </View>

        {searchReady ? (
          <View style={styles.searchResults}>
            {search.data.stocks.slice(0, 6).map((item) => (
              <Pressable
                key={item.ticker}
                onPress={() => {
                  setSelectedTicker(item.ticker);
                  setSelectedMarket(item.market);
                  setQuery(item.ticker);
                  setPrice(String(item.currentPrice || ''));
                }}
                style={[
                  styles.searchItem,
                  selectedTicker === item.ticker && styles.searchItemActive,
                ]}
              >
                <View style={styles.searchText}>
                  <Text style={styles.searchTicker}>{item.ticker}</Text>
                  <Text style={styles.searchName}>
                    {item.name} · {item.market}
                  </Text>
                </View>
                <Text style={styles.searchPrice}>
                  {formatCurrency(item.currentPrice, item.market)}
                </Text>
              </Pressable>
            ))}
            {!search.loading && !search.error && search.data.stocks.length === 0 ? (
              <Text style={styles.emptyText}>검색 결과가 없습니다.</Text>
            ) : null}
          </View>
        ) : (
          <Text style={styles.emptyText}>종목명 또는 티커를 2자 이상 입력해 주세요.</Text>
        )}

        <View style={styles.formGrid}>
          <View style={styles.inputGroup}>
            <Text style={styles.fieldLabel}>수량</Text>
            <TextInput
              keyboardType="decimal-pad"
              onChangeText={setQuantity}
              placeholder="예: 1"
              placeholderTextColor={tokens.colors.inkMute}
              style={styles.input}
              value={quantity}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.fieldLabel}>가격</Text>
            <TextInput
              keyboardType="decimal-pad"
              onChangeText={setPrice}
              placeholder="현재가를 반영하거나 직접 입력"
              placeholderTextColor={tokens.colors.inkMute}
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
            placeholder="매수/매도 이유를 남겨두세요."
            placeholderTextColor={tokens.colors.inkMute}
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
          disabled={submitting}
          label={submitting ? '등록 중...' : '거래 등록'}
          onPress={handleSubmit}
        />
      </SurfaceCard>

      {selectedStock ? (
        <SurfaceCard>
          <SectionHeading
            title="선택 종목 스냅샷"
            description="검색한 종목의 현재 가격 정보입니다."
          />
          <View style={styles.snapshotRow}>
            <Text style={styles.snapshotLabel}>종목</Text>
            <Text style={styles.snapshotValue}>
              {selectedStock.ticker} · {selectedStock.name}
            </Text>
          </View>
          <View style={styles.snapshotRow}>
            <Text style={styles.snapshotLabel}>시장</Text>
            <Text style={styles.snapshotValue}>{selectedStock.market}</Text>
          </View>
          <View style={styles.snapshotRow}>
            <Text style={styles.snapshotLabel}>현재가</Text>
            <Text style={styles.snapshotValue}>
              {formatCurrency(stockPrice.data.currentPrice, selectedStock.market)}
            </Text>
          </View>
          <View style={styles.snapshotRow}>
            <Text style={styles.snapshotLabel}>당일 등락률</Text>
            <Text style={styles.snapshotValue}>
              {formatPercent(stockPrice.data.dayReturnRate)}
            </Text>
          </View>
        </SurfaceCard>
      ) : null}
    </Page>
  );
}

const styles = StyleSheet.create({
  importActionStack: {
    gap: 10,
  },
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
  emptyText: {
    fontSize: 14,
    lineHeight: 22,
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.body,
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
  snapshotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  snapshotLabel: {
    fontSize: 14,
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.body,
  },
  snapshotValue: {
    fontSize: 14,
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontWeight: '700',
  },
});
