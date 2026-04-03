import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { StockSearchItem } from '../api/contracts';
import { foloApi } from '../api/services';
import { DataStatusCard } from '../components/DataStatusCard';
import { StockIdentityBadge } from '../components/StockIdentityBadge';
import {
  BottomActionBar,
  Chip,
  PageBackButton,
  PrimaryButton,
} from '../components/ui';
import { syncAllWidgetsInBackground } from '../features/widgets';
import {
  usePortfolioData,
  useStockDiscoverData,
  useStockSearchData,
} from '../hooks/useFoloData';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import { formatCurrency } from '../lib/format';
import { resolveAssetUrl } from '../lib/resolveAssetUrl';
import type { PortfolioSetupSelection, RootStackParamList } from '../navigation/types';
import { tokens } from '../theme/tokens';

type MarketFilter = 'ALL' | 'KRX' | 'US';

const marketFilterOptions: Array<{ label: string; value: MarketFilter }> = [
  { label: '전체', value: 'ALL' },
  { label: '국내', value: 'KRX' },
  { label: '미국', value: 'US' },
];

const routineDayOptions = ['1', '10', '15', '25'];

type StockSection = {
  key: string;
  title: string;
  items: StockSearchItem[];
};

type StockTileItem = PortfolioSetupSelection & {
  logoUrl?: string | null;
};

function selectionKey(item: Pick<PortfolioSetupSelection, 'market' | 'ticker'>) {
  return `${item.market}:${item.ticker}`;
}

export function ReminderCreateScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isCompact, tileColumns, width } = useResponsiveLayout();
  const portfolio = usePortfolioData();
  const [query, setQuery] = useState('');
  const [marketFilter, setMarketFilter] = useState<MarketFilter>('ALL');
  const [selectedItem, setSelectedItem] = useState<PortfolioSetupSelection | null>(null);
  const [amount, setAmount] = useState('');
  const [dayOfMonth, setDayOfMonth] = useState('15');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const trimmedQuery = query.trim();
  const searchMarket = marketFilter === 'ALL' ? undefined : marketFilter;
  const search = useStockSearchData(query, 2, searchMarket);
  const discover = useStockDiscoverData(12);
  const ownedItems = useMemo<StockTileItem[]>(() => {
    const holdings = [...portfolio.data.holdings].sort(
      (left, right) => (right.totalValue ?? 0) - (left.totalValue ?? 0),
    );

    return holdings
      .filter((item) => {
        if (marketFilter === 'KRX') {
          return item.market === 'KRX';
        }

        if (marketFilter === 'US') {
          return item.market !== 'KRX';
        }

        return true;
      })
      .map((item) => ({
        ticker: item.ticker,
        name: item.name,
        market: item.market as PortfolioSetupSelection['market'],
        currentPrice: item.currentPrice,
        logoUrl: null,
      }));
  }, [marketFilter, portfolio.data.holdings]);
  const filteredResults = useMemo(() => {
    const stocks = search.data.stocks;

    if (marketFilter === 'KRX') {
      return stocks.filter((item) => item.market === 'KRX');
    }

    if (marketFilter === 'US') {
      return stocks.filter((item) => item.market !== 'KRX');
    }

    return stocks;
  }, [marketFilter, search.data.stocks]);
  const featuredSections = useMemo<StockSection[]>(() => {
    if (marketFilter === 'KRX') {
      return [{ key: 'krx', title: '국내 인기 종목', items: discover.data.krxStocks }];
    }

    if (marketFilter === 'US') {
      return [{ key: 'us', title: '미국 인기 종목', items: discover.data.usStocks }];
    }

    return [
      { key: 'owned', title: '내 보유 종목', items: [] },
      { key: 'krx', title: '국내 인기 종목', items: discover.data.krxStocks },
      { key: 'us', title: '미국 인기 종목', items: discover.data.usStocks },
    ];
  }, [discover.data.krxStocks, discover.data.usStocks, marketFilter]);

  const tileGap = 12;
  const horizontalPadding = isCompact ? 16 : 20;
  const tileWidth = Math.max(
    104,
    Math.floor(
      (Math.min(width, tokens.layout.maxWidth) -
        horizontalPadding * 2 -
        tileGap * (tileColumns - 1)) /
        tileColumns,
    ),
  );
  const parsedAmount = Number(amount.replaceAll(',', '').trim());
  const parsedDayOfMonth = Number(dayOfMonth.trim());
  const disabled =
    !selectedItem ||
    !Number.isFinite(parsedAmount) ||
    parsedAmount <= 0 ||
    !Number.isInteger(parsedDayOfMonth) ||
    parsedDayOfMonth < 1 ||
    parsedDayOfMonth > 31;

  function toggleSelection(item: PortfolioSetupSelection) {
    const nextItem: PortfolioSetupSelection = {
      ticker: item.ticker,
      name: item.name,
      market: item.market,
      currentPrice: item.currentPrice,
    };

    setSelectedItem((current) =>
      current && selectionKey(current) === selectionKey(nextItem) ? null : nextItem,
    );
  }

  function renderTile(item: StockTileItem) {
    const key = selectionKey(item);
    const isSelected = selectedItem ? selectionKey(selectedItem) === key : false;
    const logoUrl = resolveAssetUrl(item.logoUrl);

    return (
      <Pressable
        key={key}
        onPress={() => toggleSelection(item)}
        style={[
          styles.tile,
          { width: tileWidth },
          isSelected && styles.tileSelected,
        ]}
      >
        <StockIdentityBadge
          logoUrl={logoUrl}
          market={item.market}
          name={item.name}
          ticker={item.ticker}
        />
        <Text numberOfLines={1} style={styles.tileTitle}>
          {item.name}
        </Text>
        <Text numberOfLines={1} style={styles.tileMeta}>
          {item.ticker} · {item.market}
        </Text>
        <Text numberOfLines={1} style={styles.tilePrice}>
          {formatCurrency(item.currentPrice, item.market)}
        </Text>
        {isSelected ? (
          <View style={styles.selectedMark}>
            <Ionicons color={tokens.colors.surface} name="checkmark" size={14} />
          </View>
        ) : null}
      </Pressable>
    );
  }

  async function handleSubmit() {
    if (!selectedItem) {
      setMessage('루틴을 등록할 종목을 먼저 선택해 주세요.');
      return;
    }

    if (disabled) {
      setMessage('금액과 날짜를 올바르게 입력해 주세요.');
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      await foloApi.createReminder({
        ticker: selectedItem.ticker,
        market: selectedItem.market,
        amount: parsedAmount,
        dayOfMonth: parsedDayOfMonth,
      });
      syncAllWidgetsInBackground();
      navigation.replace('Reminders');
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : '루틴 등록에 실패했습니다.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
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
            <Text style={styles.title}>루틴 등록</Text>
            <Text style={styles.subtitle}>
              반복 투자할 종목과 금액, 매월 체크할 날짜를 정하면 다음 루틴과 위젯이 함께 갱신됩니다.
            </Text>
          </View>

          <DataStatusCard
            error={search.error ?? discover.error ?? portfolio.error ?? message}
            loading={search.loading || discover.loading || portfolio.loading || submitting}
            variant="inline"
          />

          <View style={styles.searchShell}>
            <Ionicons color={tokens.colors.inkMute} name="search" size={20} />
            <TextInput
              autoCapitalize="characters"
              autoCorrect={false}
              onChangeText={setQuery}
              placeholder="티커 또는 종목명 검색"
              placeholderTextColor={tokens.colors.inkMute}
              style={styles.searchInput}
              value={query}
            />
          </View>

          <View style={styles.filterRow}>
            {marketFilterOptions.map((option) => (
              <Chip
                key={option.value}
                active={marketFilter === option.value}
                label={option.label}
                onPress={() => setMarketFilter(option.value)}
                tone={
                  option.value === 'KRX'
                    ? 'positive'
                    : option.value === 'US'
                      ? 'brand'
                      : 'default'
                }
              />
            ))}
          </View>

          {selectedItem ? (
            <View style={styles.selectedSection}>
              <Text style={styles.sectionTitle}>선택한 종목</Text>
              <View style={styles.selectedWrap}>
                <Pressable
                  onPress={() => setSelectedItem(null)}
                  style={styles.selectedChip}
                >
                  <Text style={styles.selectedChipText}>
                    {selectedItem.ticker} · {selectedItem.name}
                  </Text>
                  <Ionicons color={tokens.colors.inkMute} name="close" size={14} />
                </Pressable>
              </View>
            </View>
          ) : null}

          {trimmedQuery.length === 0 ? (
            <>
              {ownedItems.length > 0 ? (
                <View style={styles.sectionBlock}>
                  <Text style={styles.sectionTitle}>내 보유 종목</Text>
                  <Text style={styles.sectionDescription}>
                    이미 보유 중인 종목이면 루틴을 더 빠르게 걸 수 있습니다.
                  </Text>
                  <View style={styles.resultGrid}>{ownedItems.map((item) => renderTile(item))}</View>
                </View>
              ) : null}

              {featuredSections
                .filter((section) => section.key !== 'owned')
                .map((section) =>
                  section.items.length > 0 ? (
                    <View key={section.key} style={styles.sectionBlock}>
                      <Text style={styles.sectionTitle}>{section.title}</Text>
                      <View style={styles.resultGrid}>
                        {section.items.map((item) => renderTile(item))}
                      </View>
                    </View>
                  ) : null,
                )}
            </>
          ) : (
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionTitle}>검색 결과</Text>
              <View style={styles.resultGrid}>
                {filteredResults.slice(0, 24).map((item) => renderTile(item))}
              </View>
              {!search.loading && filteredResults.length === 0 ? (
                <Text style={styles.helperText}>조건에 맞는 종목이 없습니다.</Text>
              ) : null}
            </View>
          )}

          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>루틴 설정</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>매월 투자 금액</Text>
              <TextInput
                keyboardType="decimal-pad"
                onChangeText={setAmount}
                placeholder="예: 100000"
                placeholderTextColor={tokens.colors.inkMute}
                style={styles.formInput}
                value={amount}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>매월 체크 날짜</Text>
              <View style={styles.dayChipRow}>
                {routineDayOptions.map((option) => (
                  <Chip
                    key={option}
                    active={dayOfMonth === option}
                    label={`${option}일`}
                    onPress={() => setDayOfMonth(option)}
                    tone="brand"
                  />
                ))}
              </View>
              <TextInput
                keyboardType="number-pad"
                onChangeText={setDayOfMonth}
                placeholder="1~31"
                placeholderTextColor={tokens.colors.inkMute}
                style={styles.formInput}
                value={dayOfMonth}
              />
              <Text style={styles.helperText}>짧은 달은 마지막 영업일 기준으로 다시 확인하는 용도로 쓰면 좋습니다.</Text>
            </View>
          </View>
        </ScrollView>

        <BottomActionBar>
          <PrimaryButton
            disabled={disabled || submitting}
            label={submitting ? '등록 중...' : '루틴 등록'}
            onPress={handleSubmit}
          />
        </BottomActionBar>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: tokens.colors.canvas,
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
    paddingBottom: 140,
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
  searchShell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(214, 224, 234, 0.92)',
    backgroundColor: 'rgba(255,255,255,0.88)',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: tokens.colors.navy,
    fontFamily: tokens.typography.body,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  selectedSection: {
    gap: 10,
  },
  selectedWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  selectedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: tokens.colors.brandSoft,
  },
  selectedChipText: {
    fontSize: 13,
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontWeight: '700',
  },
  sectionBlock: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontWeight: '700',
  },
  sectionDescription: {
    fontSize: 13,
    lineHeight: 20,
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.body,
  },
  resultGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  tile: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(214, 224, 234, 0.92)',
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 14,
    gap: 8,
    position: 'relative',
  },
  tileSelected: {
    borderColor: 'rgba(37, 99, 235, 0.36)',
    backgroundColor: '#E9F0FF',
  },
  tileTitle: {
    fontSize: 14,
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontWeight: '700',
  },
  tileMeta: {
    fontSize: 12,
    color: tokens.colors.inkMute,
    fontFamily: tokens.typography.body,
  },
  tilePrice: {
    fontSize: 13,
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.body,
  },
  selectedMark: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 22,
    height: 22,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.colors.brandStrong,
  },
  formCard: {
    gap: 14,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(214, 224, 234, 0.92)',
    backgroundColor: tokens.colors.surface,
    padding: 18,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 12,
    color: tokens.colors.inkMute,
    fontFamily: tokens.typography.body,
  },
  formInput: {
    backgroundColor: tokens.colors.surfaceMuted,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(214, 224, 234, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: tokens.colors.navy,
    fontFamily: tokens.typography.body,
  },
  dayChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  helperText: {
    fontSize: 12,
    lineHeight: 18,
    color: tokens.colors.inkMute,
    fontFamily: tokens.typography.body,
  },
});
