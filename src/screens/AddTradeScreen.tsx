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
import { StockIdentityBadge } from '../components/StockIdentityBadge';
import {
  BottomActionBar,
  Chip,
  PageBackButton,
  PrimaryButton,
} from '../components/ui';
import {
  usePortfolioData,
  useStockDiscoverData,
  useStockSearchData,
} from '../hooks/useFoloData';
import { resolveAssetUrl } from '../lib/resolveAssetUrl';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import { formatCurrency } from '../lib/format';
import type {
  PortfolioSetupSelection,
  RootStackParamList,
} from '../navigation/types';
import { tokens } from '../theme/tokens';

type MarketFilter = 'ALL' | 'KRX' | 'US';

const marketFilterOptions: Array<{ label: string; value: MarketFilter }> = [
  { label: '전체', value: 'ALL' },
  { label: '국내', value: 'KRX' },
  { label: '미국', value: 'US' },
];

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

export function AddTradeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isCompact, tileColumns, width } = useResponsiveLayout();
  const portfolio = usePortfolioData();
  const [query, setQuery] = useState('');
  const [marketFilter, setMarketFilter] = useState<MarketFilter>('ALL');
  const [selectedItem, setSelectedItem] = useState<PortfolioSetupSelection | null>(null);
  const trimmedQuery = query.trim();
  const searchMarket = marketFilter === 'ALL' ? undefined : marketFilter;
  const search = useStockSearchData(query, 2, searchMarket);
  const discover = useStockDiscoverData(12);
  const ownedItems = useMemo<StockTileItem[]>(() => {
    const holdings = [...portfolio.data.holdings].sort(
      (left, right) =>
        (right.displayTotalValue ?? right.totalValue ?? 0) -
        (left.displayTotalValue ?? left.totalValue ?? 0),
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

  const showFirstTradeHint = !portfolio.loading && portfolio.data.holdings.length === 0;

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
            <Text style={styles.title}>거래 기록 추가</Text>
            <Text style={styles.subtitle}>
              내 보유 종목부터 바로 고르고, 없으면 검색이나 인기 종목으로 새 거래를
              시작하세요.
            </Text>
          </View>

          {showFirstTradeHint ? (
            <View style={styles.guideCard}>
              <Text style={styles.guideTitle}>첫 거래부터 바로 시작할 수 있습니다</Text>
              <Text style={styles.guideDescription}>
                아직 포트폴리오가 비어 있어도 종목 하나를 고른 뒤 첫 매수 기록을
                남기면 포트폴리오가 시작됩니다.
              </Text>
            </View>
          ) : null}

          <View style={styles.searchShell}>
            <Ionicons color={tokens.colors.inkMute} name="search" size={20} />
            <TextInput
              autoCapitalize="characters"
              autoCorrect={false}
              onChangeText={setQuery}
              placeholder="검색 / 직접입력"
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
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>내 보유 종목</Text>
                    <Text style={styles.sectionDescription}>
                      현재 포트폴리오 기준으로 바로 기록할 수 있습니다.
                    </Text>
                  </View>
                  <View style={styles.resultGrid}>
                    {ownedItems.slice(0, 12).map((item) => renderTile(item))}
                  </View>
                </View>
              ) : null}

              {portfolio.data.holdings.length > 0 && ownedItems.length === 0 ? (
                <Text style={styles.helperText}>
                  현재 필터에 맞는 내 보유 종목이 없습니다. 다른 시장을 보거나 새 종목을
                  검색해 주세요.
                </Text>
              ) : null}

              {featuredSections.map((section) =>
                section.items.length > 0 ? (
                  <View key={section.key} style={styles.sectionBlock}>
                    <View style={styles.sectionHeader}>
                      <Text style={styles.sectionTitle}>{section.title}</Text>
                      <Text style={styles.sectionDescription}>
                        새 종목을 추가하거나 다음 후보를 탐색할 때 사용하세요.
                      </Text>
                    </View>
                    <View style={styles.resultGrid}>
                      {section.items.map((item) => renderTile(item))}
                    </View>
                  </View>
                ) : null,
              )}
            </>
          ) : null}

          {trimmedQuery.length > 0 ? (
            <View style={styles.resultGrid}>
              {filteredResults.slice(0, 24).map((item) => renderTile(item))}
            </View>
          ) : null}

          {trimmedQuery.length === 1 ? (
            <Text style={styles.helperText}>검색어를 2자 이상 입력해 주세요.</Text>
          ) : null}

          {trimmedQuery.length === 0 &&
          !discover.loading &&
          featuredSections.every((section) => section.items.length === 0) ? (
            <View style={styles.guideCard}>
              <Text style={styles.guideTitle}>추천 종목을 불러오지 못했습니다</Text>
              <Text style={styles.guideDescription}>
                검색창에서 티커나 종목명을 직접 입력해 종목을 선택해 주세요.
              </Text>
            </View>
          ) : null}

          {trimmedQuery.length > 1 && !search.loading && filteredResults.length === 0 ? (
            <View style={styles.guideCard}>
              <Text style={styles.guideTitle}>검색 결과가 없습니다</Text>
              <Text style={styles.guideDescription}>
                영문 티커, 한글 종목명, 국장 종목번호로 다시 검색해 주세요.
              </Text>
            </View>
          ) : null}

          {trimmedQuery.length === 0 && discover.loading ? (
            <Text style={styles.helperText}>인기 종목 불러오는 중...</Text>
          ) : null}
          {trimmedQuery.length > 1 && search.loading ? (
            <Text style={styles.helperText}>종목 검색 중...</Text>
          ) : null}
          {trimmedQuery.length === 0 && discover.error ? (
            <Text style={styles.errorText}>{discover.error}</Text>
          ) : null}
          {trimmedQuery.length > 1 && search.error ? (
            <Text style={styles.errorText}>{search.error}</Text>
          ) : null}
        </ScrollView>

        <BottomActionBar>
          <PrimaryButton
            disabled={!selectedItem}
            label={selectedItem ? '선택한 종목으로 계속' : '종목을 먼저 선택하세요'}
            onPress={() => {
              if (!selectedItem) {
                return;
              }

              navigation.navigate('AddTradeReview', { selection: selectedItem });
            }}
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
    paddingBottom: 180,
    gap: 18,
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
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(214, 224, 234, 0.92)',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 18,
    color: tokens.colors.navy,
    fontFamily: tokens.typography.body,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  selectedSection: {
    gap: 12,
  },
  sectionBlock: {
    gap: 12,
  },
  sectionHeader: {
    gap: 4,
  },
  sectionTitle: {
    fontSize: 16,
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
  selectedWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  selectedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: tokens.colors.surface,
    borderWidth: 1,
    borderColor: tokens.colors.line,
  },
  selectedChipText: {
    fontSize: 13,
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontWeight: '600',
  },
  guideCard: {
    borderRadius: 22,
    backgroundColor: tokens.colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(214, 224, 234, 0.92)',
    padding: 18,
    gap: 8,
  },
  guideTitle: {
    fontSize: 18,
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontWeight: '800',
  },
  guideDescription: {
    fontSize: 14,
    lineHeight: 22,
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.body,
  },
  resultGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  tile: {
    position: 'relative',
    minWidth: 0,
    borderRadius: 26,
    backgroundColor: tokens.colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(214, 224, 234, 0.92)',
    paddingHorizontal: 12,
    paddingVertical: 14,
    alignItems: 'center',
    gap: 8,
  },
  tileSelected: {
    borderColor: tokens.colors.navy,
    backgroundColor: '#F8FBFF',
  },
  tileTitle: {
    fontSize: 14,
    color: tokens.colors.navy,
    textAlign: 'center',
    fontFamily: tokens.typography.heading,
    fontWeight: '700',
  },
  tileMeta: {
    fontSize: 11,
    color: tokens.colors.inkMute,
    textAlign: 'center',
    fontFamily: tokens.typography.body,
  },
  tilePrice: {
    fontSize: 12,
    color: tokens.colors.brandStrong,
    textAlign: 'center',
    fontFamily: tokens.typography.body,
  },
  selectedMark: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: tokens.colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helperText: {
    fontSize: 13,
    color: tokens.colors.brandStrong,
    fontFamily: tokens.typography.body,
  },
  errorText: {
    fontSize: 13,
    color: tokens.colors.danger,
    fontFamily: tokens.typography.body,
  },
});
