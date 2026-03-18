import type {
  CommentListResponse,
  FeedResponse,
  MarketType,
  MyProfileResponse,
  NotificationListResponse,
  PortfolioResponse,
  ReminderListResponse,
  StockPriceResponse,
  StockSearchResponse,
  TradeDetailResponse,
  TradeVisibility,
} from './contracts';

function marketPrice(market: MarketType, krwValue: number, usdValue: number) {
  return market === 'KRX' ? krwValue : usdValue;
}

function visibility(value: TradeVisibility): TradeVisibility {
  return value;
}

export const mockFeedResponse: FeedResponse = {
  trades: [
    {
      tradeId: 101,
      user: { userId: 1, nickname: '민준', profileImage: null },
      ticker: 'NVDA',
      name: 'NVIDIA',
      market: 'NASDAQ',
      tradeType: 'BUY',
      quantity: 3,
      price: 118.2,
      comment: 'AI 조정 구간이라 오늘은 소량만 추가. 다음 주에도 한 번 더 분할 예정.',
      reactions: [
        { emoji: 'FIRE', count: 12, isMyReaction: true },
        { emoji: 'CLAP', count: 8, isMyReaction: false },
        { emoji: 'EYES', count: 4, isMyReaction: false },
      ],
      commentCount: 6,
      tradedAt: '2026-03-18T10:12:00',
    },
    {
      tradeId: 102,
      user: { userId: 2, nickname: '서연', profileImage: null },
      ticker: 'QQQ',
      name: 'Invesco QQQ',
      market: 'NASDAQ',
      tradeType: 'BUY',
      quantity: 300000,
      price: 489.32,
      comment: '원래 하던 적립식 루틴 그대로. 이번 달도 잔디 끊기지 않게 기록 완료.',
      reactions: [
        { emoji: 'DIAMOND', count: 18, isMyReaction: true },
        { emoji: 'ROCKET', count: 11, isMyReaction: false },
      ],
      commentCount: 3,
      tradedAt: '2026-03-18T09:36:00',
    },
    {
      tradeId: 103,
      user: { userId: 3, nickname: '지수', profileImage: null },
      ticker: 'TSLA',
      name: 'Tesla',
      market: 'NASDAQ',
      tradeType: 'SELL',
      quantity: 2,
      price: 177.41,
      comment: '스터디원들과 논의한 비중 재조정. 이익 실현 후 현금 비중을 조금 늘렸습니다.',
      reactions: [
        { emoji: 'EYES', count: 7, isMyReaction: false },
        { emoji: 'ROCKET', count: 5, isMyReaction: false },
      ],
      commentCount: 9,
      tradedAt: '2026-03-18T08:14:00',
    },
  ],
  nextCursor: null,
  hasNext: false,
};

export const mockPortfolioResponse: PortfolioResponse = {
  portfolioId: 1,
  totalInvested: 111920000,
  totalValue: 128540000,
  totalReturn: 16620000,
  totalReturnRate: 14.82,
  dayReturn: 1240000,
  dayReturnRate: 0.97,
  holdings: [
    {
      holdingId: 1,
      ticker: 'QQQ',
      name: 'Invesco QQQ',
      market: 'NASDAQ',
      quantity: 41.2,
      avgPrice: 435.6,
      currentPrice: 489.32,
      totalInvested: 20570000,
      totalValue: 23100000,
      returnAmount: 2530000,
      returnRate: 12.4,
      weight: 18,
    },
    {
      holdingId: 2,
      ticker: '005930',
      name: '삼성전자',
      market: 'KRX',
      quantity: 260,
      avgPrice: 68000,
      currentPrice: 74200,
      totalInvested: 17680000,
      totalValue: 19300000,
      returnAmount: 1620000,
      returnRate: 8.1,
      weight: 15,
    },
    {
      holdingId: 3,
      ticker: 'NVDA',
      name: 'NVIDIA',
      market: 'NASDAQ',
      quantity: 18.4,
      avgPrice: 96.2,
      currentPrice: 118.2,
      totalInvested: 11300000,
      totalValue: 14100000,
      returnAmount: 2800000,
      returnRate: 24.9,
      weight: 11,
    },
    {
      holdingId: 4,
      ticker: 'CASH',
      name: '현금',
      market: 'KRX',
      quantity: 1,
      avgPrice: 16700000,
      currentPrice: 16700000,
      totalInvested: 16700000,
      totalValue: 16700000,
      returnAmount: 0,
      returnRate: 0,
      weight: 13,
    },
  ],
  syncedAt: '2026-03-18T11:20:00',
  isFullyVisible: true,
};

export const mockTradeDetails: Record<number, TradeDetailResponse> = {
  101: {
    tradeId: 101,
    user: { userId: 1, nickname: '민준', profileImage: null },
    ticker: 'NVDA',
    name: 'NVIDIA',
    market: 'NASDAQ',
    tradeType: 'BUY',
    quantity: 3,
    price: 118.2,
    totalAmount: 354.6,
    comment: 'AI 조정 구간이라 오늘은 소량만 추가. 다음 주에도 한 번 더 분할 예정.',
    visibility: visibility('FRIENDS_ONLY'),
    reactions: mockFeedResponse.trades[0].reactions,
    commentCount: 6,
    tradedAt: '2026-03-18T10:12:00',
  },
  102: {
    tradeId: 102,
    user: { userId: 2, nickname: '서연', profileImage: null },
    ticker: 'QQQ',
    name: 'Invesco QQQ',
    market: 'NASDAQ',
    tradeType: 'BUY',
    quantity: 300000,
    price: 489.32,
    totalAmount: 300000,
    comment: '원래 하던 적립식 루틴 그대로. 이번 달도 잔디 끊기지 않게 기록 완료.',
    visibility: visibility('PUBLIC'),
    reactions: mockFeedResponse.trades[1].reactions,
    commentCount: 3,
    tradedAt: '2026-03-18T09:36:00',
  },
  103: {
    tradeId: 103,
    user: { userId: 3, nickname: '지수', profileImage: null },
    ticker: 'TSLA',
    name: 'Tesla',
    market: 'NASDAQ',
    tradeType: 'SELL',
    quantity: 2,
    price: 177.41,
    totalAmount: 354.82,
    comment: '스터디원들과 논의한 비중 재조정. 이익 실현 후 현금 비중을 조금 늘렸습니다.',
    visibility: visibility('FRIENDS_ONLY'),
    reactions: mockFeedResponse.trades[2].reactions,
    commentCount: 9,
    tradedAt: '2026-03-18T08:14:00',
  },
};

export const mockCommentsByTradeId: Record<number, CommentListResponse> = {
  101: {
    comments: [
      {
        commentId: 1,
        user: { userId: 2, nickname: '서연', profileImage: null },
        content: '이번 분할 매수 타이밍 좋네요. 저도 비슷하게 보고 있었어요.',
        isMyComment: false,
        createdAt: '2026-03-18T10:18:00',
      },
      {
        commentId: 2,
        user: { userId: 4, nickname: '도윤', profileImage: null },
        content: '다음 주 추가 진입 근거도 궁금해요.',
        isMyComment: true,
        createdAt: '2026-03-18T10:21:00',
      },
    ],
    totalCount: 2,
    hasNext: false,
  },
  102: {
    comments: [
      {
        commentId: 3,
        user: { userId: 1, nickname: '민준', profileImage: null },
        content: '스트릭 계속 이어지는 게 보기 좋네요.',
        isMyComment: false,
        createdAt: '2026-03-18T09:42:00',
      },
    ],
    totalCount: 1,
    hasNext: false,
  },
  103: {
    comments: [
      {
        commentId: 4,
        user: { userId: 2, nickname: '서연', profileImage: null },
        content: '현금 비중 조절 타이밍 공유 감사합니다.',
        isMyComment: false,
        createdAt: '2026-03-18T08:22:00',
      },
    ],
    totalCount: 1,
    hasNext: false,
  },
};

export const mockMyProfileResponse: MyProfileResponse = {
  userId: 11,
  nickname: '박서연',
  profileImage: null,
  bio: '적립식 장기투자를 기록하고 친구와 공유합니다.',
  followerCount: 128,
  followingCount: 74,
  portfolioVisibility: 'FRIENDS_ONLY',
  returnVisibility: 'RATE_AND_AMOUNT',
  createdAt: '2025-09-02T09:00:00',
};

export const mockNotificationListResponse: NotificationListResponse = {
  notifications: [
    {
      notificationId: 71,
      type: 'REACTION',
      message: '서연님이 내 거래에 FIRE 리액션을 남겼습니다.',
      targetId: 101,
      isRead: false,
      createdAt: '2026-03-18T11:12:00',
    },
    {
      notificationId: 72,
      type: 'FOLLOW',
      message: '민준님이 나를 팔로우했습니다.',
      targetId: 2,
      isRead: false,
      createdAt: '2026-03-18T10:48:00',
    },
    {
      notificationId: 73,
      type: 'REMINDER',
      message: 'QQQ 적립식 알림이 내일 오전 9시에 예정되어 있습니다.',
      targetId: 33,
      isRead: true,
      createdAt: '2026-03-18T07:20:00',
    },
  ],
  unreadCount: 2,
  hasNext: false,
};

export const mockReminderListResponse: ReminderListResponse = {
  reminders: [
    {
      reminderId: 33,
      ticker: 'QQQ',
      name: 'Invesco QQQ',
      amount: 300000,
      dayOfMonth: 25,
      isActive: true,
      nextReminderDate: '2026-03-25',
    },
    {
      reminderId: 34,
      ticker: '005930',
      name: '삼성전자',
      amount: 150000,
      dayOfMonth: 12,
      isActive: true,
      nextReminderDate: '2026-04-12',
    },
  ],
};

export const mockStockSearchResponse: StockSearchResponse = {
  stocks: [
    {
      ticker: 'QQQ',
      name: 'Invesco QQQ',
      market: 'NASDAQ',
      currentPrice: marketPrice('NASDAQ', 0, 489.32),
      dayReturnRate: 1.22,
    },
    {
      ticker: 'NVDA',
      name: 'NVIDIA',
      market: 'NASDAQ',
      currentPrice: marketPrice('NASDAQ', 0, 118.2),
      dayReturnRate: 2.84,
    },
    {
      ticker: '005930',
      name: '삼성전자',
      market: 'KRX',
      currentPrice: marketPrice('KRX', 74200, 0),
      dayReturnRate: 0.81,
    },
    {
      ticker: 'TSLA',
      name: 'Tesla',
      market: 'NASDAQ',
      currentPrice: marketPrice('NASDAQ', 0, 177.41),
      dayReturnRate: -0.42,
    },
  ],
};

export const mockStockPrices: Record<string, StockPriceResponse> = {
  QQQ: {
    ticker: 'QQQ',
    name: 'Invesco QQQ',
    market: 'NASDAQ',
    currentPrice: 489.32,
    openPrice: 485.3,
    highPrice: 491.8,
    lowPrice: 482.1,
    dayReturn: 5.88,
    dayReturnRate: 1.22,
    updatedAt: '2026-03-18T11:30:00',
  },
  NVDA: {
    ticker: 'NVDA',
    name: 'NVIDIA',
    market: 'NASDAQ',
    currentPrice: 118.2,
    openPrice: 115.8,
    highPrice: 119.4,
    lowPrice: 114.9,
    dayReturn: 3.27,
    dayReturnRate: 2.84,
    updatedAt: '2026-03-18T11:30:00',
  },
  '005930': {
    ticker: '005930',
    name: '삼성전자',
    market: 'KRX',
    currentPrice: 74200,
    openPrice: 73800,
    highPrice: 74400,
    lowPrice: 73400,
    dayReturn: 600,
    dayReturnRate: 0.81,
    updatedAt: '2026-03-18T15:20:00',
  },
};
