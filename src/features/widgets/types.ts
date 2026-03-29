import type { TradeSummaryItem } from '../../api/contracts';

export const GROWTH_WIDGET_HEATMAP_DAYS = 35;
export const GROWTH_WIDGET_STREAK_LOOKBACK_DAYS = 365;
export const GROWTH_WIDGET_ACTIVE_WINDOW_DAYS = 7;

export type GrowthWidgetStatus = 'ACTIVE' | 'IDLE' | 'SETUP';
export type GrowthWidgetCellLevel = 0 | 1 | 2 | 3 | 4;

export type GrowthWidgetCell = {
  date: string;
  level: GrowthWidgetCellLevel;
  isToday: boolean;
};

export type GrowthWidgetSnapshot = {
  schemaVersion: 1;
  generatedAt: string;
  deepLinkUrl: string;
  title: string;
  monthLabel: string;
  status: GrowthWidgetStatus;
  currentStreak: number;
  longestStreak: number;
  footerCopy: string;
  cells: GrowthWidgetCell[];
};

export type GrowthWidgetSourceTrade = Pick<TradeSummaryItem, 'tradeId' | 'tradedAt'>;

export type GrowthWidgetSourceData = {
  trades: GrowthWidgetSourceTrade[];
};
