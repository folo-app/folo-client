import { addDays, isValidDate, startOfLocalDay, toDateKey } from './date';
import { getGrowthWidgetDeepLink } from './widgetDeepLinks';
import type {
  GrowthWidgetCell,
  GrowthWidgetCellLevel,
  GrowthWidgetSnapshot,
  GrowthWidgetSourceData,
  GrowthWidgetSourceTrade,
  GrowthWidgetStatus,
} from './types';
import {
  GROWTH_WIDGET_ACTIVE_WINDOW_DAYS,
  GROWTH_WIDGET_HEATMAP_DAYS,
  GROWTH_WIDGET_STREAK_LOOKBACK_DAYS,
} from './types';

export type BuildGrowthWidgetSnapshotOptions = {
  sourceData: GrowthWidgetSourceData;
  referenceDate?: Date;
  generatedAt?: Date;
};

export function buildGrowthWidgetSnapshot({
  sourceData,
  referenceDate = new Date(),
  generatedAt = new Date(),
}: BuildGrowthWidgetSnapshotOptions): GrowthWidgetSnapshot {
  const referenceDay = startOfLocalDay(referenceDate);
  const dailyCounts = groupTradesByDay(sourceData.trades);
  const status = resolveStatus(dailyCounts, referenceDay);

  return {
    schemaVersion: 1,
    generatedAt: generatedAt.toISOString(),
    deepLinkUrl: getGrowthWidgetDeepLink({ source: 'widget-growth' }),
    title: 'Growth Streak',
    monthLabel: formatMonthLabel(referenceDay),
    status,
    currentStreak: calculateCurrentStreak(dailyCounts, referenceDay),
    longestStreak: calculateLongestStreak(dailyCounts, referenceDay),
    footerCopy: resolveFooterCopy(status),
    cells: buildCells(dailyCounts, referenceDay),
  };
}

function buildCells(dailyCounts: ReadonlyMap<string, number>, referenceDay: Date): GrowthWidgetCell[] {
  const start = addDays(referenceDay, -(GROWTH_WIDGET_HEATMAP_DAYS - 1));

  return Array.from({ length: GROWTH_WIDGET_HEATMAP_DAYS }, (_, index) => {
    const currentDay = addDays(start, index);
    const dateKey = toDateKey(currentDay);
    const count = dailyCounts.get(dateKey) ?? 0;

    return {
      date: dateKey,
      level: toCellLevel(count),
      isToday: index === GROWTH_WIDGET_HEATMAP_DAYS - 1,
    };
  });
}

function groupTradesByDay(trades: ReadonlyArray<GrowthWidgetSourceTrade>) {
  const counts = new Map<string, number>();

  trades.forEach((trade) => {
    const tradedAt = new Date(trade.tradedAt);

    if (!isValidDate(tradedAt)) {
      return;
    }

    const dateKey = toDateKey(startOfLocalDay(tradedAt));
    counts.set(dateKey, (counts.get(dateKey) ?? 0) + 1);
  });

  return counts;
}

function resolveStatus(dailyCounts: ReadonlyMap<string, number>, referenceDay: Date): GrowthWidgetStatus {
  const hasRecentHeatmapActivity = hasActivityInWindow(
    dailyCounts,
    referenceDay,
    GROWTH_WIDGET_HEATMAP_DAYS,
  );

  if (!hasRecentHeatmapActivity) {
    return 'SETUP';
  }

  return hasActivityInWindow(dailyCounts, referenceDay, GROWTH_WIDGET_ACTIVE_WINDOW_DAYS)
    ? 'ACTIVE'
    : 'IDLE';
}

function hasActivityInWindow(
  dailyCounts: ReadonlyMap<string, number>,
  referenceDay: Date,
  days: number,
) {
  for (let index = 0; index < days; index += 1) {
    const currentDay = addDays(referenceDay, -index);

    if ((dailyCounts.get(toDateKey(currentDay)) ?? 0) > 0) {
      return true;
    }
  }

  return false;
}

function calculateCurrentStreak(dailyCounts: ReadonlyMap<string, number>, referenceDay: Date) {
  let streak = 0;

  for (let index = 0; index < GROWTH_WIDGET_STREAK_LOOKBACK_DAYS; index += 1) {
    const currentDay = addDays(referenceDay, -index);

    if ((dailyCounts.get(toDateKey(currentDay)) ?? 0) === 0) {
      break;
    }

    streak += 1;
  }

  return streak;
}

function calculateLongestStreak(dailyCounts: ReadonlyMap<string, number>, referenceDay: Date) {
  const start = addDays(referenceDay, -(GROWTH_WIDGET_STREAK_LOOKBACK_DAYS - 1));
  let current = 0;
  let longest = 0;

  for (let index = 0; index < GROWTH_WIDGET_STREAK_LOOKBACK_DAYS; index += 1) {
    const currentDay = addDays(start, index);

    if ((dailyCounts.get(toDateKey(currentDay)) ?? 0) > 0) {
      current += 1;
      longest = Math.max(longest, current);
      continue;
    }

    current = 0;
  }

  return longest;
}

function toCellLevel(count: number): GrowthWidgetCellLevel {
  if (count >= 4) {
    return 4;
  }

  if (count === 3) {
    return 3;
  }

  if (count === 2) {
    return 2;
  }

  if (count === 1) {
    return 1;
  }

  return 0;
}

function resolveFooterCopy(status: GrowthWidgetStatus) {
  switch (status) {
    case 'ACTIVE':
      return 'Keep growing';
    case 'IDLE':
      return 'Jump back in';
    case 'SETUP':
      return 'Start your streak';
  }
}

function formatMonthLabel(referenceDay: Date) {
  return new Intl.DateTimeFormat('en-US', { month: 'long' }).format(referenceDay);
}
