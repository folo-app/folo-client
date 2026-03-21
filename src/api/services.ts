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
  KisConnectionStartRequest,
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
  ProfileImageUploadResponse,
  PublicProfileResponse,
  ReactionMutationResponse,
  RefreshRequest,
  ReminderItem,
  ReminderListResponse,
  SignupRequest,
  SignupResponse,
  StockPriceResponse,
  StockDiscoverResponse,
  StockSearchResponse,
  TradeDetailResponse,
  TradeListResponse,
  TradeSummaryItem,
  UpdateReactionRequest,
  UpdateKisKeyRequest,
  UpdateMyProfileRequest,
  UpdateReminderRequest,
  UpdateTradeRequest,
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
  getUserFeed(userId: number, cursor?: number, size = 20) {
    return apiRequest<FeedResponse>(withQuery(`/feed/${userId}`, { cursor, size }));
  },
  getPortfolio() {
    return apiRequest<PortfolioResponse>('/portfolio');
  },
  getUserPortfolio(userId: number) {
    return apiRequest<PortfolioResponse>(`/portfolio/${userId}`);
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
  uploadProfileImage(file: UploadAsset) {
    return apiRequest<ProfileImageUploadResponse>('/uploads/profile-image', {
      method: 'POST',
      body: buildUploadFormData('file', file),
      requiresAuth: false,
    });
  },
  getTradeDetail(tradeId: number) {
    return apiRequest<TradeDetailResponse>(`/trades/${tradeId}`);
  },
  updateTrade(tradeId: number, body: UpdateTradeRequest) {
    return apiRequest<TradeSummaryItem>(`/trades/${tradeId}`, {
      method: 'PATCH',
      body,
    });
  },
  deleteTrade(tradeId: number) {
    return apiRequest<void>(`/trades/${tradeId}`, {
      method: 'DELETE',
      allowEmptyData: true,
    });
  },
  getTradeComments(tradeId: number, page = 0, size = 20) {
    return apiRequest<CommentListResponse>(
      withQuery(`/trades/${tradeId}/comments`, { page, size }),
    );
  },
  deleteComment(tradeId: number, commentId: number) {
    return apiRequest<void>(`/trades/${tradeId}/comments/${commentId}`, {
      method: 'DELETE',
      allowEmptyData: true,
    });
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
  startKisConnection(body: KisConnectionStartRequest) {
    return apiRequest<KisConnectionStartResponse>('/integrations/kis/connect/start', {
      method: 'POST',
      body,
    });
  },
  disconnectKisConnection() {
    return apiRequest<void>('/integrations/kis/connect', {
      method: 'DELETE',
      allowEmptyData: true,
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
  discoverStocks(limit = 12) {
    return apiRequest<StockDiscoverResponse>(
      withQuery('/stocks/discover', { limit }),
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
  reactToTrade(tradeId: number, body: UpdateReactionRequest) {
    return apiRequest<ReactionMutationResponse>(`/trades/${tradeId}/reactions`, {
      method: 'POST',
      body,
    });
  },
  removeTradeReaction(tradeId: number) {
    return apiRequest<ReactionMutationResponse>(`/trades/${tradeId}/reactions`, {
      method: 'DELETE',
    });
  },
  createComment(tradeId: number, body: CreateCommentRequest) {
    return apiRequest<CreateCommentResponse>(`/trades/${tradeId}/comments`, {
      method: 'POST',
      body,
    });
  },
};
