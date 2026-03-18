import { apiRequest } from './client';
import type {
  CommentListResponse,
  CreateCommentRequest,
  CreateCommentResponse,
  CreateReminderRequest,
  CreateTradeRequest,
  FeedResponse,
  MyProfileResponse,
  NotificationListResponse,
  PortfolioResponse,
  ReminderItem,
  ReminderListResponse,
  StockPriceResponse,
  StockSearchResponse,
  TradeDetailResponse,
  TradeSummaryItem,
  UpdateMyProfileRequest,
  UpdateReminderRequest,
} from './contracts';

function withQuery(path: string, query: Record<string, string | number | undefined | null>) {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value));
    }
  });

  const text = params.toString();
  return text ? `${path}?${text}` : path;
}

export const foloApi = {
  getFeed(cursor?: number, size = 20) {
    return apiRequest<FeedResponse>(withQuery('/feed', { cursor, size }));
  },
  getPortfolio() {
    return apiRequest<PortfolioResponse>('/portfolio');
  },
  getTradeDetail(tradeId: number) {
    return apiRequest<TradeDetailResponse>(`/trades/${tradeId}`);
  },
  getTradeComments(tradeId: number, page = 0, size = 20) {
    return apiRequest<CommentListResponse>(
      withQuery(`/trades/${tradeId}/comments`, { page, size }),
    );
  },
  getMyProfile() {
    return apiRequest<MyProfileResponse>('/users/me');
  },
  updateMyProfile(body: UpdateMyProfileRequest) {
    return apiRequest<MyProfileResponse>('/users/me', {
      method: 'PATCH',
      body,
    });
  },
  getNotifications(page = 0, size = 20) {
    return apiRequest<NotificationListResponse>(
      withQuery('/notifications', { page, size }),
    );
  },
  getReminders() {
    return apiRequest<ReminderListResponse>('/reminders');
  },
  createReminder(body: CreateReminderRequest) {
    return apiRequest<ReminderItem>('/reminders', {
      method: 'POST',
      body,
    });
  },
  updateReminder(reminderId: number, body: UpdateReminderRequest) {
    return apiRequest<ReminderItem>(`/reminders/${reminderId}`, {
      method: 'PATCH',
      body,
    });
  },
  searchStocks(query: string, market?: string) {
    return apiRequest<StockSearchResponse>(
      withQuery('/stocks/search', { query, market }),
    );
  },
  getStockPrice(ticker: string, market?: string) {
    return apiRequest<StockPriceResponse>(
      withQuery(`/stocks/${ticker}/price`, { market }),
    );
  },
  createTrade(body: CreateTradeRequest) {
    return apiRequest<TradeSummaryItem>('/trades', {
      method: 'POST',
      body,
    });
  },
  createComment(tradeId: number, body: CreateCommentRequest) {
    return apiRequest<CreateCommentResponse>(`/trades/${tradeId}/comments`, {
      method: 'POST',
      body,
    });
  },
};
