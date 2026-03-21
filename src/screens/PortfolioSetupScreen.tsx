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

import { foloApiConfig } from '../api/config';
import type { StockSearchItem } from '../api/contracts';
import { StockIdentityBadge } from '../components/StockIdentityBadge';
import { BottomActionBar, Chip } from '../components/ui';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import { useStockDiscoverData, useStockSearchData } from '../hooks/useFoloData';
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

function selectionKey(item: Pick<PortfolioSetupSelection, 'market' | 'ticker'>) {
  return `${item.market}:${item.ticker}`;
}

function resolveLogoUrl(logoUrl?: string | null) {
  if (!logoUrl) {
    return null;
  }

  if (logoUrl.startsWith('http://') || logoUrl.startsWith('https://')) {
    return logoUrl;
  }

  return `${foloApiConfig.baseUrl}${logoUrl.startsWith('/') ? '' : '/'}${logoUrl}`;
}

type StockSection = {
  key: string;
  title: string;
  items: StockSearchItem[];
};

type StockTileItem = PortfolioSetupSelection & {
  logoUrl?: string | null;
};

export function PortfolioSetupScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isCompact, tileColumns, width } = useResponsiveLayout();
  const [query, setQuery] = useState('');
  const [marketFilter, setMarketFilter] = useState<MarketFilter>('ALL');
  const [selectedItems, setSelectedItems] = useState<PortfolioSetupSelection[]>([]);
  const trimmedQuery = query.trim();
  const searchMarket = marketFilter === 'ALL' ? undefined : marketFilter;
  const search = useStockSearchData(query, 2, searchMarket);
  const discover = useStockDiscoverData(12);

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
      (Math.min(width, tokens.layout.maxWidth) - horizontalPadding * 2 - tileGap * (tileColumns - 1)) /
        tileColumns,
    ),
  );

  function renderTile(item: StockTileItem) {
    const key = selectionKey(item);
    const isSelected = selectedItems.some((entry) => selectionKey(entry) === key);
    const logoUrl = resolveLogoUrl(item.logoUrl);

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

  function toggleSelection(item: PortfolioSetupSelection) {
    const nextItem: PortfolioSetupSelection = {
      ticker: item.ticker,
      name: item.name,
      market: item.market,
      currentPrice: item.currentPrice,
    };

    setSelectedItems((current) => {
      const key = selectionKey(nextItem);

      if (current.some((entry) => selectionKey(entry) === key)) {
        return current.filter((entry) => selectionKey(entry) !== key);
      }

      return [...current, nextItem];
    });
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
          <View style={styles.header}>
            <Text style={styles.title}>내 포트폴리오에 종목 추가</Text>
            <Text style={styles.subtitle}>
              보유 중인 종목을 먼저 고르고, 다음 화면에서 수량과 평균 매수가를
              입력하면 바로 시작할 수 있습니다.
            </Text>
          </View>

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
                tone={option.value === 'KRX' ? 'positive' : option.value === 'US' ? 'brand' : 'default'}
              />
            ))}
          </View>

          {selectedItems.length > 0 ? (
            <View style={styles.selectedSection}>
              <Text style={styles.sectionTitle}>선택한 종목</Text>
              <View style={styles.selectedWrap}>
                {selectedItems.map((item) => (
                  <Pressable
                    key={selectionKey(item)}
                    onPress={() => toggleSelection(item)}
                    style={styles.selectedChip}
                  >
                    <Text style={styles.selectedChipText}>
                      {item.ticker} · {item.name}
                    </Text>
                    <Ionicons color={tokens.colors.inkMute} name="close" size={14} />
                  </Pressable>
                ))}
              </View>
            </View>
          ) : null}

          {trimmedQuery.length === 0 ? (
            <View style={styles.guideCard}>
              <Text style={styles.guideTitle}>직접 추가로 바로 시작하세요</Text>
              <Text style={styles.guideDescription}>
                아래 인기 종목은 현재 서비스 데이터와 KIS 종목 마스터 기준으로
                불러옵니다. 검색창에서는 `AAPL`, `TSLA`, `005930`, `삼성전자`처럼
                티커, 종목명, 종목번호로 바로 찾을 수 있습니다.
              </Text>
            </View>
          ) : null}

          {trimmedQuery.length === 0 ? (
            <>
              {featuredSections.map((section) =>
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
          ) : null}

          {trimmedQuery.length > 0 ? (
            <View style={styles.resultGrid}>
              {filteredResults.slice(0, 24).map((item) => renderTile(item))}
            </View>
          ) : null}

          {trimmedQuery.length === 1 ? (
            <Text style={styles.helperText}>검색어를 2자 이상 입력해 주세요.</Text>
          ) : null}

          {trimmedQuery.length === 0 && !discover.loading && featuredSections.every((section) => section.items.length === 0) ? (
            <View style={styles.guideCard}>
              <Text style={styles.guideTitle}>추천 종목을 불러오지 못했습니다</Text>
              <Text style={styles.guideDescription}>
                검색창에서 티커나 종목명을 직접 입력해 종목을 추가해 주세요.
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
          <View style={styles.secondaryActions}>
            <Pressable onPress={() => navigation.navigate('ImportOnboarding')}>
              <Text style={styles.secondaryActionText}>CSV 가져오기</Text>
            </Pressable>
            <Text style={styles.dot}>·</Text>
            <Pressable onPress={() => navigation.navigate('ImportOnboarding')}>
              <Text style={styles.secondaryActionText}>OCR 가져오기</Text>
            </Pressable>
            <Text style={styles.dot}>·</Text>
            <Pressable onPress={() => navigation.navigate('KisConnect')}>
              <Text style={styles.secondaryActionText}>KIS 연결 준비중</Text>
            </Pressable>
          </View>

          <Pressable
            disabled={selectedItems.length === 0}
            onPress={() =>
              navigation.navigate('PortfolioSetupReview', { selections: selectedItems })
            }
            style={[
              styles.ctaButton,
              selectedItems.length === 0 && styles.ctaButtonDisabled,
            ]}
          >
            <Text
              style={[
                styles.ctaLabel,
                selectedItems.length === 0 && styles.ctaLabelDisabled,
              ]}
            >
              {selectedItems.length}개 선택
            </Text>
          </Pressable>
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
  sectionTitle: {
    fontSize: 16,
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontWeight: '700',
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
  secondaryActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  secondaryActionText: {
    fontSize: 12,
    color: tokens.colors.inkMute,
    fontFamily: tokens.typography.body,
  },
  dot: {
    fontSize: 12,
    color: tokens.colors.inkMute,
    fontFamily: tokens.typography.body,
  },
  ctaButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
    backgroundColor: tokens.colors.navy,
    paddingVertical: 18,
  },
  ctaButtonDisabled: {
    backgroundColor: '#C6D1E0',
  },
  ctaLabel: {
    fontSize: 18,
    color: tokens.colors.surface,
    fontFamily: tokens.typography.heading,
    fontWeight: '800',
  },
  ctaLabelDisabled: {
    color: '#5F6C7B',
  },
});
