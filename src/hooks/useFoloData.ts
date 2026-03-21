import { foloApi } from '../api/services';
import type {
  CommentListResponse,
  FeedResponse,
  MyProfileResponse,
  NotificationListResponse,
  PortfolioResponse,
  PublicProfileResponse,
  ReminderListResponse,
  StockDiscoverResponse,
  StockPriceResponse,
  StockSearchResponse,
  TradeDetailResponse,
  TradeListResponse,
} from '../api/contracts';
import { useQuery, type QueryResult } from './query';

export type Loadable<T> = QueryResult<T>;

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

const emptyPublicProfile: PublicProfileResponse = {
  userId: 0,
  nickname: '',
  profileImage: null,
  bio: null,
  followerCount: 0,
  followingCount: 0,
  isFollowing: false,
  portfolioVisibility: 'FRIENDS_ONLY',
  isAccessible: false,
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

const emptySearchResponse: StockSearchResponse = { stocks: [] };

const emptyDiscoverResponse: StockDiscoverResponse = {
  krxStocks: [],
  usStocks: [],
};

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

export function useFeedData(): Loadable<FeedResponse> {
  return useQuery({
    queryFn: () => foloApi.getFeed(),
    initialData: emptyFeedResponse,
  });
}

export function useUserFeedData(userId: number): Loadable<FeedResponse> {
  return useQuery({
    queryFn: () => foloApi.getUserFeed(userId),
    initialData: emptyFeedResponse,
    deps: [userId],
  });
}

export function usePortfolioData(): Loadable<PortfolioResponse> {
  return useQuery({
    queryFn: () => foloApi.getPortfolio(),
    initialData: emptyPortfolioResponse,
  });
}

export function useUserPortfolioData(
  userId: number,
  enabled = true,
): Loadable<PortfolioResponse> {
  return useQuery({
    queryFn: () => foloApi.getUserPortfolio(userId),
    initialData: emptyPortfolioResponse,
    deps: [userId],
    enabled,
  });
}

export function useTradeDetailData(tradeId: number): Loadable<TradeDetailResponse> {
  return useQuery({
    queryFn: () => foloApi.getTradeDetail(tradeId),
    initialData: emptyTradeDetail,
    deps: [tradeId],
  });
}

export function useTradeCommentsData(tradeId: number): Loadable<CommentListResponse> {
  return useQuery({
    queryFn: () => foloApi.getTradeComments(tradeId),
    initialData: emptyCommentList,
    deps: [tradeId],
  });
}

export function useMyProfileData(): Loadable<MyProfileResponse> {
  return useQuery({
    queryFn: () => foloApi.getMyProfile(),
    initialData: emptyMyProfile,
  });
}

export function useUserProfileData(userId: number): Loadable<PublicProfileResponse> {
  return useQuery({
    queryFn: () => foloApi.getUserProfile(userId),
    initialData: emptyPublicProfile,
    deps: [userId],
  });
}

export function useNotificationsData(): Loadable<NotificationListResponse> {
  return useQuery({
    queryFn: () => foloApi.getNotifications(),
    initialData: emptyNotifications,
  });
}

export function useRemindersData(): Loadable<ReminderListResponse> {
  return useQuery({
    queryFn: () => foloApi.getReminders(),
    initialData: emptyReminders,
  });
}

export function useMyTradesData(): Loadable<TradeListResponse> {
  return useQuery({
    queryFn: () => foloApi.getMyTrades(),
    initialData: emptyTradeList,
  });
}

export function useStockSearchData(
  query: string,
  minimumLength = 2,
  market?: string,
): Loadable<StockSearchResponse> {
  const trimmed = query.trim();

  return useQuery({
    queryFn: () => {
      if (trimmed.length < minimumLength) {
        return Promise.resolve(emptySearchResponse);
      }

      return foloApi.searchStocks(trimmed, market);
    },
    initialData: emptySearchResponse,
    deps: [trimmed, minimumLength, market ?? null],
  });
}

export function useStockDiscoverData(limit = 12): Loadable<StockDiscoverResponse> {
  return useQuery({
    queryFn: () => foloApi.discoverStocks(limit),
    initialData: emptyDiscoverResponse,
    deps: [limit],
  });
}

export function useStockPriceData(
  ticker: string,
  market?: string,
): Loadable<StockPriceResponse> {
  const normalizedTicker = ticker.trim().toUpperCase();

  return useQuery({
    queryFn: () => {
      if (!normalizedTicker) {
        return Promise.resolve(emptyPriceResponse);
      }

      return foloApi.getStockPrice(normalizedTicker, market);
    },
    initialData: emptyPriceResponse,
    deps: [normalizedTicker, market ?? null],
  });
}
