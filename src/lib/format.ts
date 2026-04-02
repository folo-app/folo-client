import type {
  MarketType,
  NotificationType,
  PortfolioVisibility,
  ReactionEmoji,
  ReturnVisibility,
  TradeType,
  TradeVisibility,
} from '../api/contracts';

function numberFormatter(currency: 'KRW' | 'USD') {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency,
    maximumFractionDigits: currency === 'KRW' ? 0 : 2,
  });
}

export function currencyForMarket(market: string | MarketType) {
  return market === 'KRX' ? 'KRW' : 'USD';
}

export function formatCurrency(
  value: number | null | undefined,
  market: string | MarketType = 'KRX',
) {
  if (value === null || value === undefined) {
    return '-';
  }
  return numberFormatter(currencyForMarket(market)).format(value);
}

export function formatCompactCurrency(
  value: number | null | undefined,
  market: string | MarketType = 'KRX',
) {
  if (value === null || value === undefined) {
    return '-';
  }

  const currency = currencyForMarket(market);

  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency,
    notation: 'compact',
    maximumFractionDigits: currency === 'KRW' ? 0 : 1,
  }).format(value);
}

export function formatNumber(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return '-';
  }
  return new Intl.NumberFormat('ko-KR', {
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return '-';
  }
  const sign = value > 0 ? '+' : value < 0 ? '' : '';
  return `${sign}${value.toFixed(2)}%`;
}

export function formatSignedCurrency(
  value: number | null | undefined,
  market: string | MarketType = 'KRX',
) {
  if (value === null || value === undefined) {
    return '-';
  }
  const formatted = formatCurrency(Math.abs(value), market);
  if (value > 0) {
    return `+${formatted}`;
  }
  if (value < 0) {
    return `-${formatted}`;
  }
  return formatted;
}

export function formatWeight(value: number) {
  const normalized = value > 1 ? value : value * 100;
  return `${normalized.toFixed(0)}%`;
}

export function formatRelativeDate(iso: string) {
  if (!iso) {
    return '';
  }

  const target = new Date(iso).getTime();
  const diffMinutes = Math.round((Date.now() - target) / 60000);

  if (diffMinutes < 1) {
    return '방금 전';
  }
  if (diffMinutes < 60) {
    return `${diffMinutes}분 전`;
  }
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}시간 전`;
  }
  const diffDays = Math.round(diffHours / 24);
  return `${diffDays}일 전`;
}

export function formatDateLabel(iso: string) {
  if (!iso) {
    return '';
  }
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(iso));
}

export function reactionEmojiLabel(emoji: ReactionEmoji) {
  switch (emoji) {
    case 'FIRE':
      return '🔥';
    case 'EYES':
      return '👀';
    case 'DIAMOND':
      return '💎';
    case 'CLAP':
      return '👏';
    case 'ROCKET':
      return '🚀';
  }
}

export function tradeTypeLabel(type: TradeType) {
  return type === 'BUY' ? '매수' : '매도';
}

export function visibilityLabel(
  value: TradeVisibility | PortfolioVisibility | ReturnVisibility,
) {
  switch (value) {
    case 'PUBLIC':
      return '전체 공개';
    case 'FRIENDS_ONLY':
      return '친구만';
    case 'PRIVATE':
      return '비공개';
    case 'RATE_AND_AMOUNT':
      return '수익률 + 금액';
    case 'RATE_ONLY':
      return '수익률만';
  }
}

export function notificationLabel(type: NotificationType) {
  switch (type) {
    case 'FOLLOW':
      return '팔로우';
    case 'REACTION':
      return '리액션';
    case 'COMMENT':
      return '댓글';
    case 'REMINDER':
      return '리마인더';
    case 'NUDGE':
      return '리마인드';
  }
}
