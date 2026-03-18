import { useEffect, useState } from 'react';

import { foloApi } from '../api/services';
import {
  mockCommentsByTradeId,
  mockFeedResponse,
  mockMyProfileResponse,
  mockNotificationListResponse,
  mockPortfolioResponse,
  mockReminderListResponse,
  mockStockPrices,
  mockStockSearchResponse,
  mockTradeDetails,
} from '../api/mockFallbacks';
import type {
  CommentListResponse,
  FeedResponse,
  MyProfileResponse,
  NotificationListResponse,
  PortfolioResponse,
  ReminderListResponse,
  StockPriceResponse,
  StockSearchResponse,
  TradeDetailResponse,
} from '../api/contracts';

type Source = 'api' | 'fallback';

export type Loadable<T> = {
  data: T;
  loading: boolean;
  source: Source;
  error: string | null;
  refresh: () => void;
};

function useLoadable<T>(
  loader: () => Promise<T>,
  fallback: T,
  deps: ReadonlyArray<unknown>,
): Loadable<T> {
  const [data, setData] = useState<T>(fallback);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<Source>('fallback');
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let alive = true;

    setLoading(true);

    loader()
      .then((result) => {
        if (!alive) {
          return;
        }
        setData(result);
        setSource('api');
        setError(null);
      })
      .catch((reason) => {
        if (!alive) {
          return;
        }
        setData(fallback);
        setSource('fallback');
        setError(reason instanceof Error ? reason.message : '데이터를 불러오지 못했습니다.');
      })
      .finally(() => {
        if (alive) {
          setLoading(false);
        }
      });

    return () => {
      alive = false;
    };
  }, [...deps, refreshKey]);

  return {
    data,
    loading,
    source,
    error,
    refresh: () => setRefreshKey((value) => value + 1),
  };
}

export function useFeedData(): Loadable<FeedResponse> {
  return useLoadable(() => foloApi.getFeed(), mockFeedResponse, []);
}

export function usePortfolioData(): Loadable<PortfolioResponse> {
  return useLoadable(() => foloApi.getPortfolio(), mockPortfolioResponse, []);
}

export function useTradeDetailData(tradeId: number): Loadable<TradeDetailResponse> {
  return useLoadable(
    () => foloApi.getTradeDetail(tradeId),
    mockTradeDetails[tradeId] ?? mockTradeDetails[101],
    [tradeId],
  );
}

export function useTradeCommentsData(tradeId: number): Loadable<CommentListResponse> {
  return useLoadable(
    () => foloApi.getTradeComments(tradeId),
    mockCommentsByTradeId[tradeId] ?? {
      comments: [],
      totalCount: 0,
      hasNext: false,
    },
    [tradeId],
  );
}

export function useMyProfileData(): Loadable<MyProfileResponse> {
  return useLoadable(() => foloApi.getMyProfile(), mockMyProfileResponse, []);
}

export function useNotificationsData(): Loadable<NotificationListResponse> {
  return useLoadable(
    () => foloApi.getNotifications(),
    mockNotificationListResponse,
    [],
  );
}

export function useRemindersData(): Loadable<ReminderListResponse> {
  return useLoadable(() => foloApi.getReminders(), mockReminderListResponse, []);
}

const emptySearchResponse: StockSearchResponse = { stocks: [] };
const emptyPriceResponse: StockPriceResponse = {
  ticker: '',
  name: '',
  market: 'KRX',
  currentPrice: 0,
  openPrice: 0,
  highPrice: 0,
  lowPrice: 0,
  dayReturn: 0,
  dayReturnRate: 0,
  updatedAt: '',
};

export function useStockSearchData(query: string): Loadable<StockSearchResponse> {
  const trimmed = query.trim();

  return useLoadable(
    () => {
      if (!trimmed) {
        return Promise.resolve(emptySearchResponse);
      }
      return foloApi.searchStocks(trimmed);
    },
    trimmed ? mockStockSearchResponse : emptySearchResponse,
    [trimmed],
  );
}

export function useStockPriceData(
  ticker: string,
  market?: string,
): Loadable<StockPriceResponse> {
  const normalizedTicker = ticker.trim().toUpperCase();

  return useLoadable(
    () => {
      if (!normalizedTicker) {
        return Promise.resolve(emptyPriceResponse);
      }
      return foloApi.getStockPrice(normalizedTicker, market);
    },
    normalizedTicker ? mockStockPrices[normalizedTicker] ?? emptyPriceResponse : emptyPriceResponse,
    [normalizedTicker, market ?? null],
  );
}
