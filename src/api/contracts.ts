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
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  totalInvested: number;
  totalValue: number;
  returnAmount: number;
  returnRate: number;
  weight: number;
};

export type PortfolioResponse = {
  portfolioId: number;
  totalInvested: number;
  totalValue: number;
  totalReturn: number;
  totalReturnRate: number;
  dayReturn: number;
  dayReturnRate: number;
  holdings: PortfolioHoldingItem[];
  syncedAt: string;
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
  currentPrice: number;
  dayReturnRate: number;
};

export type StockSearchResponse = {
  stocks: StockSearchItem[];
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

export type UpdateMyProfileRequest = {
  nickname: string;
  profileImage: string | null;
  bio: string | null;
  portfolioVisibility: PortfolioVisibility;
  returnVisibility: ReturnVisibility;
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
