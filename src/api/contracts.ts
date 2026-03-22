export type MarketType = 'KRX' | 'NASDAQ' | 'NYSE' | 'AMEX';
export type TradeType = 'BUY' | 'SELL';
export type TradeVisibility = 'PUBLIC' | 'FRIENDS_ONLY' | 'PRIVATE';
export type PortfolioVisibility = 'PUBLIC' | 'FRIENDS_ONLY' | 'PRIVATE';
export type ReturnVisibility = 'RATE_AND_AMOUNT' | 'RATE_ONLY' | 'PRIVATE';
export type ReactionEmoji = 'FIRE' | 'EYES' | 'DIAMOND' | 'CLAP' | 'ROCKET';
export type NotificationType = 'FOLLOW' | 'REACTION' | 'COMMENT' | 'REMINDER' | 'NUDGE';

export type ApiError = {
  code: string;
  message: string;
};

export type ApiResponse<T> = {
  success: boolean;
  data: T | null;
  message: string | null;
  error: ApiError | null;
  timestamp: string;
};

export type SignupRequest = {
  email: string;
  password: string;
  nickname: string;
  profileImage: string | null;
};

export type SignupResponse = {
  userId: number;
  nickname: string;
  email: string;
  verificationRequired: boolean;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RecoverLoginIdRequest = {
  nickname: string;
};

export type RecoverLoginIdResponse = {
  found: boolean;
  maskedLoginId: string | null;
};

export type PasswordResetRequest = {
  email: string;
};

export type RefreshRequest = {
  refreshToken: string;
};

export type LogoutRequest = {
  refreshToken: string;
};

export type VerifyEmailRequest = {
  email: string;
};

export type ConfirmEmailRequest = {
  email: string;
  code: string;
};

export type AuthResponse = {
  userId: number;
  nickname: string;
  email: string;
  profileImage: string | null;
  accessToken: string;
  refreshToken: string;
};

export type FeedTradeUser = {
  userId: number;
  nickname: string;
  profileImage: string | null;
};

export type FeedReaction = {
  emoji: ReactionEmoji;
  count: number;
  isMyReaction: boolean;
};

export type FeedTradeItem = {
  tradeId: number;
  user: FeedTradeUser;
  ticker: string;
  name: string;
  market: string;
  tradeType: TradeType;
  quantity: number;
  price: number;
  comment: string | null;
  reactions: FeedReaction[];
  commentCount: number;
  tradedAt: string;
};

export type FeedResponse = {
  trades: FeedTradeItem[];
  nextCursor: number | null;
  hasNext: boolean;
};

export type PortfolioHoldingItem = {
  holdingId: number;
  ticker: string;
  name: string;
  market: string;
  quantity: number | null;
  avgPrice: number | null;
  currentPrice: number;
  totalInvested: number | null;
  totalValue: number | null;
  returnAmount: number | null;
  returnRate: number;
  weight: number;
};

export type PortfolioResponse = {
  portfolioId: number;
  totalInvested: number | null;
  totalValue: number | null;
  totalReturn: number | null;
  totalReturnRate: number;
  dayReturn: number | null;
  dayReturnRate: number;
  holdings: PortfolioHoldingItem[];
  syncedAt: string | null;
  isFullyVisible: boolean;
};

export type TradeUserInfo = {
  userId: number;
  nickname: string;
  profileImage: string | null;
};

export type ReactionSummary = {
  emoji: ReactionEmoji;
  count: number;
  isMyReaction: boolean;
};

export type TradeDetailResponse = {
  tradeId: number;
  user: TradeUserInfo;
  ticker: string;
  name: string;
  market: string;
  tradeType: TradeType;
  quantity: number;
  price: number;
  totalAmount: number;
  comment: string | null;
  visibility: TradeVisibility;
  reactions: ReactionSummary[];
  commentCount: number;
  tradedAt: string;
};

export type TradeSummaryItem = {
  tradeId: number;
  ticker: string;
  name: string;
  tradeType: TradeType;
  quantity: number;
  price: number;
  totalAmount: number;
  comment: string | null;
  visibility: TradeVisibility;
  reactionCount: number;
  commentCount: number;
  tradedAt: string;
};

export type TradeListResponse = {
  trades: TradeSummaryItem[];
  totalCount: number;
  hasNext: boolean;
};

export type CommentUserInfo = {
  userId: number;
  nickname: string;
  profileImage: string | null;
};

export type CommentItem = {
  commentId: number;
  user: CommentUserInfo;
  content: string;
  isMyComment: boolean;
  createdAt: string;
};

export type CommentListResponse = {
  comments: CommentItem[];
  totalCount: number;
  hasNext: boolean;
};

export type CreateCommentResponse = {
  commentId: number;
  content: string;
  createdAt: string;
};

export type MyProfileResponse = {
  userId: number;
  nickname: string;
  profileImage: string | null;
  bio: string | null;
  followerCount: number;
  followingCount: number;
  portfolioVisibility: PortfolioVisibility;
  returnVisibility: ReturnVisibility;
  createdAt: string;
};

export type NotificationItem = {
  notificationId: number;
  type: NotificationType;
  message: string;
  targetId: number | null;
  isRead: boolean;
  createdAt: string;
};

export type NotificationListResponse = {
  notifications: NotificationItem[];
  unreadCount: number;
  hasNext: boolean;
};

export type NotificationReadResponse = {
  notificationId: number;
  isRead: boolean;
};

export type ReminderItem = {
  reminderId: number;
  ticker: string;
  name: string;
  amount: number;
  dayOfMonth: number;
  isActive: boolean;
  nextReminderDate: string;
};

export type ReminderListResponse = {
  reminders: ReminderItem[];
};

export type StockSearchItem = {
  ticker: string;
  name: string;
  market: MarketType;
  logoUrl: string | null;
  currentPrice: number;
  dayReturnRate: number;
};

export type StockSearchResponse = {
  stocks: StockSearchItem[];
};

export type StockDiscoverResponse = {
  krxStocks: StockSearchItem[];
  usStocks: StockSearchItem[];
};

export type StockPriceResponse = {
  ticker: string;
  name: string;
  market: MarketType;
  currentPrice: number;
  openPrice: number;
  highPrice: number;
  lowPrice: number;
  dayReturn: number;
  dayReturnRate: number;
  updatedAt: string;
};

export type UserSearchItem = {
  userId: number;
  nickname: string;
  profileImage: string | null;
  followerCount: number;
  isFollowing: boolean;
};

export type UserSearchResponse = {
  users: UserSearchItem[];
  totalCount: number;
  hasNext: boolean;
};

export type PublicProfileResponse = {
  userId: number;
  nickname: string;
  profileImage: string | null;
  bio: string | null;
  followerCount: number;
  followingCount: number;
  isFollowing: boolean;
  portfolioVisibility: PortfolioVisibility;
  isAccessible: boolean;
};

export type FollowActionResponse = {
  followingId: number;
  nickname: string;
  isFollowing: boolean;
};

export type FollowUserItem = {
  userId: number;
  nickname: string;
  profileImage: string | null;
  isFollowing: boolean;
};

export type FollowListResponse = {
  followers: FollowUserItem[] | null;
  followings: FollowUserItem[] | null;
  totalCount: number;
  hasNext: boolean;
};

export type UpdateKisKeyRequest = {
  kisAppKey: string;
  kisAppSecret: string;
};

export type KisConnectionPhase =
  | 'CONNECTED'
  | 'READY'
  | 'CONFIG_MISSING'
  | 'PREPARING';

export type KisConnectionStartRequest = {
  customerName: string;
  phoneNumber: string;
};

export type KisConnectionStatusResponse = {
  connected: boolean;
  phase: KisConnectionPhase;
  oauthEnabled: boolean;
  clientConfigured: boolean;
  connectionAvailable: boolean;
  lastSyncedAt: string | null;
  connectedAt: string | null;
  connectedAccount: string | null;
  nextStep: string;
};

export type KisConnectionStartResponse = {
  started: boolean;
  phase: KisConnectionPhase;
  authorizationUrl: string | null;
  launchUrl: string | null;
  authorizationMethod: 'POST' | 'GET' | null;
  requestFields: Record<string, string> | null;
  state: string | null;
  nextStep: string;
};

export type PortfolioSyncResponse = {
  syncedHoldings: number;
  syncedTrades: number;
  syncedAt: string;
};

export type UpdateMyProfileRequest = {
  nickname: string;
  profileImage: string | null;
  bio: string | null;
  portfolioVisibility: PortfolioVisibility;
  returnVisibility: ReturnVisibility;
};

export type ChangeMyPasswordRequest = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export type CreateTradeRequest = {
  ticker: string;
  market: MarketType;
  tradeType: TradeType;
  quantity: number;
  price: number;
  comment: string | null;
  visibility: TradeVisibility;
  tradedAt: string;
};

export type UpdateTradeRequest = {
  comment: string | null;
  visibility: TradeVisibility;
};

export type UpdateReactionRequest = {
  emoji: ReactionEmoji;
};

export type ReactionMutationResponse = {
  tradeId: number;
  emoji: ReactionEmoji | null;
  reactions: ReactionSummary[];
};

export type CreateReminderRequest = {
  ticker: string;
  market: MarketType;
  amount: number;
  dayOfMonth: number;
};

export type UpdateReminderRequest = {
  amount: number;
  dayOfMonth: number;
  isActive: boolean;
};

export type CreateCommentRequest = {
  content: string;
};

export type ImportPreviewItem = {
  importResultId: number;
  ticker: string | null;
  name: string | null;
  market: MarketType | null;
  tradeType: TradeType | null;
  quantity: number | null;
  price: number | null;
  tradedAt: string | null;
  valid: boolean;
  errorMessage: string | null;
  selected: boolean;
};

export type CsvImportResponse = {
  importJobId: number;
  parsedTrades: number;
  failedTrades: number;
  preview: ImportPreviewItem[];
};

export type ConfirmImportRequest = {
  importResultIds: number[];
};

export type ConfirmImportResponse = {
  savedTrades: number;
  confirmedImportResultIds: number[];
  tradeIds: number[];
};

export type OcrImportParsedTrade = {
  importResultId: number;
  ticker: string;
  name: string;
  tradeType: TradeType;
  quantity: number;
  price: number;
  tradedAt: string;
};

export type OcrImportResponse = {
  importJobId: number;
  parsed: OcrImportParsedTrade | null;
  confidence: number;
};

export type ProfileImageUploadResponse = {
  url: string;
  path: string;
  fileName: string;
  contentType: string;
  size: number;
};
