import assert from 'node:assert/strict';
import test from 'node:test';

import { buildGrowthWidgetSnapshot } from './buildGrowthWidgetSnapshot';

test('buildGrowthWidgetSnapshot returns setup placeholder when there is no activity', () => {
  const snapshot = buildGrowthWidgetSnapshot({
    sourceData: { trades: [] },
    referenceDate: new Date('2026-03-29T12:00:00Z'),
    generatedAt: new Date('2026-03-29T12:00:00Z'),
  });

  assert.equal(snapshot.status, 'SETUP');
  assert.equal(snapshot.currentStreak, 0);
  assert.equal(snapshot.longestStreak, 0);
  assert.equal(snapshot.footerCopy, 'Start your streak');
  assert.equal(
    snapshot.deepLinkUrl,
    'folo://widget/growth-streak?source=widget-growth',
  );
  assert.equal(snapshot.cells.length, 35);
  assert.ok(snapshot.cells.every((cell) => cell.level === 0));
  assert.equal(snapshot.cells.at(-1)?.isToday, true);
});

test('buildGrowthWidgetSnapshot marks active streaks and clamps dense days', () => {
  const snapshot = buildGrowthWidgetSnapshot({
    sourceData: {
      trades: [
        { tradeId: 1, tradedAt: '2026-03-27T08:00:00Z' },
        { tradeId: 2, tradedAt: '2026-03-28T08:00:00Z' },
        { tradeId: 3, tradedAt: '2026-03-29T08:00:00Z' },
        { tradeId: 4, tradedAt: '2026-03-29T09:00:00Z' },
        { tradeId: 5, tradedAt: '2026-03-29T10:00:00Z' },
        { tradeId: 6, tradedAt: '2026-03-29T11:00:00Z' },
      ],
    },
    referenceDate: new Date('2026-03-29T12:00:00Z'),
    generatedAt: new Date('2026-03-29T12:00:00Z'),
  });

  assert.equal(snapshot.status, 'ACTIVE');
  assert.equal(snapshot.currentStreak, 3);
  assert.equal(snapshot.longestStreak, 3);
  assert.equal(snapshot.footerCopy, 'Keep growing');
  assert.equal(snapshot.cells.at(-1)?.level, 4);
});

test('buildGrowthWidgetSnapshot resets current streak on gaps but preserves longest streak', () => {
  const snapshot = buildGrowthWidgetSnapshot({
    sourceData: {
      trades: [
        { tradeId: 1, tradedAt: '2026-03-24T08:00:00Z' },
        { tradeId: 2, tradedAt: '2026-03-25T08:00:00Z' },
        { tradeId: 3, tradedAt: '2026-03-26T08:00:00Z' },
        { tradeId: 4, tradedAt: '2026-03-28T08:00:00Z' },
        { tradeId: 5, tradedAt: '2026-03-29T08:00:00Z' },
      ],
    },
    referenceDate: new Date('2026-03-29T12:00:00Z'),
    generatedAt: new Date('2026-03-29T12:00:00Z'),
  });

  assert.equal(snapshot.currentStreak, 2);
  assert.equal(snapshot.longestStreak, 3);
});

test('buildGrowthWidgetSnapshot reports idle when only older heatmap activity exists', () => {
  const snapshot = buildGrowthWidgetSnapshot({
    sourceData: {
      trades: [{ tradeId: 1, tradedAt: '2026-03-19T08:00:00Z' }],
    },
    referenceDate: new Date('2026-03-29T12:00:00Z'),
    generatedAt: new Date('2026-03-29T12:00:00Z'),
  });

  assert.equal(snapshot.status, 'IDLE');
  assert.equal(snapshot.currentStreak, 0);
  assert.equal(snapshot.longestStreak, 1);
  assert.equal(snapshot.footerCopy, 'Jump back in');
});

test('buildGrowthWidgetSnapshot ignores streaks older than the 365-day lookback window', () => {
  const snapshot = buildGrowthWidgetSnapshot({
    sourceData: {
      trades: [
        { tradeId: 1, tradedAt: '2025-03-26T08:00:00Z' },
        { tradeId: 2, tradedAt: '2025-03-27T08:00:00Z' },
        { tradeId: 3, tradedAt: '2025-03-28T08:00:00Z' },
        { tradeId: 4, tradedAt: '2025-03-29T08:00:00Z' },
        { tradeId: 5, tradedAt: '2025-03-30T08:00:00Z' },
        { tradeId: 6, tradedAt: '2025-03-31T08:00:00Z' },
        { tradeId: 7, tradedAt: '2025-04-01T08:00:00Z' },
      ],
    },
    referenceDate: new Date('2026-03-29T12:00:00Z'),
    generatedAt: new Date('2026-03-29T12:00:00Z'),
  });

  assert.equal(snapshot.longestStreak, 3);
});
