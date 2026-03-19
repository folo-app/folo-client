import { useEffect, useState } from 'react';

import { foloApi } from '../api/services';
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
  TradeListResponse,
} from '../api/contracts';

export type Loadable<T> = {
  data: T;
  loading: boolean;
  error: string | null;
  refresh: () => void;
};

function useLoadable<T>(
  loader: () => Promise<T>,
  initialData: T,
  deps: ReadonlyArray<unknown>,
): Loadable<T> {
  const [data, setData] = useState<T>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let alive = true;

    setLoading(true);
    setError(null);

    loader()
      .then((result) => {
        if (!alive) {
          return;
        }
        setData(result);
        setError(null);
      })
      .catch((reason) => {
        if (!alive) {
          return;
        }
        setData(initialData);
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
    error,
    refresh: () => setRefreshKey((value) => value + 1),
  };
}

const emptyFeedResponse: FeedResponse = {
  trades: [],
  nextCursor: null,
  hasNext: false,
};

const emptyPortfolioResponse: PortfolioResponse = {
  portfolioId: 0,
  totalInvested: 0,
  totalValue: 0,
  totalReturn: 0,
  totalReturnRate: 0,
  dayReturn: 0,
  dayReturnRate: 0,
  holdings: [],
  syncedAt: null,
  isFullyVisible: true,
};

const emptyTradeDetail: TradeDetailResponse = {
  tradeId: 0,
  user: {
    userId: 0,
    nickname: '',
    profileImage: null,
  },
  ticker: '',
  name: '',
  market: 'KRX',
  tradeType: 'BUY',
  quantity: 0,
  price: 0,
  totalAmount: 0,
  comment: null,
  visibility: 'FRIENDS_ONLY',
  reactions: [],
  commentCount: 0,
  tradedAt: '',
};

const emptyCommentList: CommentListResponse = {
  comments: [],
  totalCount: 0,
  hasNext: false,
};

const emptyMyProfile: MyProfileResponse = {
  userId: 0,
  nickname: '',
  profileImage: null,
  bio: null,
  followerCount: 0,
  followingCount: 0,
  portfolioVisibility: 'FRIENDS_ONLY',
  returnVisibility: 'RATE_ONLY',
  createdAt: '',
};

const emptyNotifications: NotificationListResponse = {
  notifications: [],
  unreadCount: 0,
  hasNext: false,
};

const emptyReminders: ReminderListResponse = {
  reminders: [],
};

const emptyTradeList: TradeListResponse = {
  trades: [],
  totalCount: 0,
  hasNext: false,
};

export function useFeedData(): Loadable<FeedResponse> {
  return useLoadable(() => foloApi.getFeed(), emptyFeedResponse, []);
}

export function usePortfolioData(): Loadable<PortfolioResponse> {
  return useLoadable(() => foloApi.getPortfolio(), emptyPortfolioResponse, []);
}

export function useTradeDetailData(tradeId: number): Loadable<TradeDetailResponse> {
  return useLoadable(() => foloApi.getTradeDetail(tradeId), emptyTradeDetail, [tradeId]);
}

export function useTradeCommentsData(tradeId: number): Loadable<CommentListResponse> {
  return useLoadable(() => foloApi.getTradeComments(tradeId), emptyCommentList, [tradeId]);
}

export function useMyProfileData(): Loadable<MyProfileResponse> {
  return useLoadable(() => foloApi.getMyProfile(), emptyMyProfile, []);
}

export function useNotificationsData(): Loadable<NotificationListResponse> {
  return useLoadable(() => foloApi.getNotifications(), emptyNotifications, []);
}

export function useRemindersData(): Loadable<ReminderListResponse> {
  return useLoadable(() => foloApi.getReminders(), emptyReminders, []);
}

export function useMyTradesData(): Loadable<TradeListResponse> {
  return useLoadable(() => foloApi.getMyTrades(), emptyTradeList, []);
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

export function useStockSearchData(
  query: string,
  minimumLength = 2,
): Loadable<StockSearchResponse> {
  const trimmed = query.trim();

  return useLoadable(
    () => {
      if (trimmed.length < minimumLength) {
        return Promise.resolve(emptySearchResponse);
      }
      return foloApi.searchStocks(trimmed);
    },
    emptySearchResponse,
    [trimmed, minimumLength],
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
    emptyPriceResponse,
    [normalizedTicker, market ?? null],
  );
}
