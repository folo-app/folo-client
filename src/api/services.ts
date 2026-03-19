import { apiRequest } from './client';
import type {
  AuthResponse,
  CommentListResponse,
  ConfirmEmailRequest,
  ConfirmImportRequest,
  ConfirmImportResponse,
  CreateCommentRequest,
  CreateCommentResponse,
  CreateReminderRequest,
  CreateTradeRequest,
  CsvImportResponse,
  FeedResponse,
  FollowActionResponse,
  FollowListResponse,
  KisConnectionStartResponse,
  KisConnectionStatusResponse,
  LoginRequest,
  LogoutRequest,
  MyProfileResponse,
  NotificationListResponse,
  NotificationReadResponse,
  OcrImportResponse,
  PortfolioResponse,
  PortfolioSyncResponse,
  PublicProfileResponse,
  RefreshRequest,
  ReminderItem,
  ReminderListResponse,
  SignupRequest,
  SignupResponse,
  StockPriceResponse,
  StockSearchResponse,
  TradeDetailResponse,
  TradeListResponse,
  TradeSummaryItem,
  UpdateKisKeyRequest,
  UpdateMyProfileRequest,
  UpdateReminderRequest,
  UserSearchResponse,
  VerifyEmailRequest,
} from './contracts';

type UploadAsset = {
  uri: string;
  name: string;
  mimeType?: string | null;
};

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

function buildUploadFormData(
  fieldName: string,
  file: UploadAsset,
  extraFields?: Record<string, string | undefined>,
) {
  const formData = new FormData();

  formData.append(fieldName, {
    uri: file.uri,
    name: file.name,
    type: file.mimeType ?? 'application/octet-stream',
  } as never);

  Object.entries(extraFields ?? {}).forEach(([key, value]) => {
    if (value) {
      formData.append(key, value);
    }
  });

  return formData;
}

export const foloApi = {
  signup(body: SignupRequest) {
    return apiRequest<SignupResponse>('/auth/signup', {
      method: 'POST',
      body,
      requiresAuth: false,
    });
  },
  login(body: LoginRequest) {
    return apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body,
      requiresAuth: false,
    });
  },
  refresh(body: RefreshRequest) {
    return apiRequest<AuthResponse>('/auth/refresh', {
      method: 'POST',
      body,
      requiresAuth: false,
    });
  },
  logout(body: LogoutRequest) {
    return apiRequest<void>('/auth/logout', {
      method: 'POST',
      body,
      allowEmptyData: true,
    });
  },
  verifyEmail(body: VerifyEmailRequest) {
    return apiRequest<void>('/auth/email/verify', {
      method: 'POST',
      body,
      requiresAuth: false,
      allowEmptyData: true,
    });
  },
  confirmEmail(body: ConfirmEmailRequest) {
    return apiRequest<AuthResponse>('/auth/email/confirm', {
      method: 'POST',
      body,
      requiresAuth: false,
    });
  },
  getFeed(cursor?: number, size = 20) {
    return apiRequest<FeedResponse>(withQuery('/feed', { cursor, size }));
  },
  getPortfolio() {
    return apiRequest<PortfolioResponse>('/portfolio');
  },
  syncPortfolio() {
    return apiRequest<PortfolioSyncResponse>('/portfolio/sync', {
      method: 'POST',
    });
  },
  importPortfolioCsv(file: UploadAsset, broker?: string) {
    return apiRequest<CsvImportResponse>('/portfolio/import/csv', {
      method: 'POST',
      body: buildUploadFormData('file', file, { broker }),
    });
  },
  importPortfolioOcr(image: UploadAsset) {
    return apiRequest<OcrImportResponse>('/portfolio/import/ocr', {
      method: 'POST',
      body: buildUploadFormData('image', image),
    });
  },
  confirmPortfolioImport(body: ConfirmImportRequest) {
    return apiRequest<ConfirmImportResponse>('/portfolio/import/confirm', {
      method: 'POST',
      body,
    });
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
  getUserProfile(userId: number) {
    return apiRequest<PublicProfileResponse>(`/users/${userId}`);
  },
  searchUsers(query: string, page = 0, size = 20) {
    return apiRequest<UserSearchResponse>(
      withQuery('/users/search', { q: query, page, size }),
    );
  },
  updateMyProfile(body: UpdateMyProfileRequest) {
    return apiRequest<MyProfileResponse>('/users/me', {
      method: 'PATCH',
      body,
    });
  },
  updateKisKey(body: UpdateKisKeyRequest) {
    return apiRequest<void>('/users/me/kis-key', {
      method: 'PATCH',
      body,
      allowEmptyData: true,
    });
  },
  getKisConnectionStatus() {
    return apiRequest<KisConnectionStatusResponse>('/integrations/kis/connect/status');
  },
  startKisConnection() {
    return apiRequest<KisConnectionStartResponse>('/integrations/kis/connect/start', {
      method: 'POST',
    });
  },
  followUser(userId: number) {
    return apiRequest<FollowActionResponse>(`/follows/${userId}`, {
      method: 'POST',
    });
  },
  unfollowUser(userId: number) {
    return apiRequest<void>(`/follows/${userId}`, {
      method: 'DELETE',
      allowEmptyData: true,
    });
  },
  getFollowers(page = 0, size = 20) {
    return apiRequest<FollowListResponse>(withQuery('/follows/followers', { page, size }));
  },
  getFollowings(page = 0, size = 20) {
    return apiRequest<FollowListResponse>(withQuery('/follows/followings', { page, size }));
  },
  getNotifications(page = 0, size = 20) {
    return apiRequest<NotificationListResponse>(
      withQuery('/notifications', { page, size }),
    );
  },
  markAllNotificationsRead() {
    return apiRequest<void>('/notifications/read', {
      method: 'PATCH',
      allowEmptyData: true,
    });
  },
  markNotificationRead(notificationId: number) {
    return apiRequest<NotificationReadResponse>(`/notifications/${notificationId}/read`, {
      method: 'PATCH',
    });
  },
  getReminders() {
    return apiRequest<ReminderListResponse>('/reminders');
  },
  getMyTrades(
    params: {
      ticker?: string;
      tradeType?: string;
      from?: string;
      to?: string;
      page?: number;
      size?: number;
    } = {},
  ) {
    const { ticker, tradeType, from, to, page = 0, size = 20 } = params;

    return apiRequest<TradeListResponse>(
      withQuery('/trades/me', {
        ticker,
        tradeType,
        from,
        to,
        page,
        size,
      }),
    );
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
  deleteReminder(reminderId: number) {
    return apiRequest<void>(`/reminders/${reminderId}`, {
      method: 'DELETE',
      allowEmptyData: true,
    });
  },
  searchStocks(query: string, market?: string) {
    return apiRequest<StockSearchResponse>(
      withQuery('/stocks/search', { q: query, market }),
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
