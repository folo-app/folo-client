import { foloApi } from '../../api/services';
import type { GrowthWidgetSourceData, GrowthWidgetSourceTrade } from './types';
import { addDays, isValidDate, startOfLocalDay } from './date';
import { GROWTH_WIDGET_STREAK_LOOKBACK_DAYS } from './types';

const DEFAULT_PAGE_SIZE = 100;
const DEFAULT_MAX_PAGES = 20;

type GrowthWidgetTradePage = {
  trades: GrowthWidgetSourceTrade[];
  hasNext: boolean;
};

type GrowthWidgetTradesApi = {
  getMyTrades(params?: {
    page?: number;
    size?: number;
  }): Promise<GrowthWidgetTradePage>;
};

export type FetchGrowthWidgetSourceDataOptions = {
  api?: GrowthWidgetTradesApi;
  referenceDate?: Date;
  lookbackDays?: number;
  pageSize?: number;
  maxPages?: number;
};

export async function fetchGrowthWidgetSourceData({
  api = foloApi,
  referenceDate = new Date(),
  lookbackDays = GROWTH_WIDGET_STREAK_LOOKBACK_DAYS,
  pageSize = DEFAULT_PAGE_SIZE,
  maxPages = DEFAULT_MAX_PAGES,
}: FetchGrowthWidgetSourceDataOptions = {}): Promise<GrowthWidgetSourceData> {
  const cutoff = startOfLocalDay(addDays(referenceDate, -(lookbackDays - 1))).getTime();
  const collectedTrades: GrowthWidgetSourceTrade[] = [];

  for (let page = 0; page < maxPages; page += 1) {
    const response = await api.getMyTrades({
      page,
      size: pageSize,
    });

    if (response.trades.length === 0) {
      break;
    }

    const normalizedTrades = response.trades
      .map((trade) => ({
        tradeId: trade.tradeId,
        tradedAt: trade.tradedAt,
      }))
      .filter((trade) => {
        const tradedAt = new Date(trade.tradedAt);
        return isValidDate(tradedAt) && tradedAt.getTime() >= cutoff;
      });

    collectedTrades.push(...normalizedTrades);

    const oldestPageTradeTime = findOldestTradeTime(response.trades);

    // The API is expected to return recent trades first, so once a page falls
    // behind the cutoff window the remaining pages are no longer useful here.
    if (!response.hasNext || oldestPageTradeTime < cutoff) {
      break;
    }
  }

  return {
    trades: dedupeAndSortTrades(collectedTrades),
  };
}

function findOldestTradeTime(trades: ReadonlyArray<{ tradedAt: string }>) {
  return trades.reduce((oldest, trade) => {
    const tradedAt = new Date(trade.tradedAt);

    if (!isValidDate(tradedAt)) {
      return oldest;
    }

    return Math.min(oldest, tradedAt.getTime());
  }, Number.POSITIVE_INFINITY);
}

function dedupeAndSortTrades(trades: ReadonlyArray<GrowthWidgetSourceTrade>) {
  const tradeById = new Map<number, GrowthWidgetSourceTrade>();

  trades.forEach((trade) => {
    tradeById.set(trade.tradeId, trade);
  });

  return [...tradeById.values()].sort((left, right) => {
    const timeDiff = new Date(right.tradedAt).getTime() - new Date(left.tradedAt).getTime();

    if (timeDiff !== 0) {
      return timeDiff;
    }

    return right.tradeId - left.tradeId;
  });
}
