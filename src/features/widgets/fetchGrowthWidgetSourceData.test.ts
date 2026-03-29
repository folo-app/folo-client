import assert from 'node:assert/strict';
import test from 'node:test';

import { fetchGrowthWidgetSourceData } from './fetchGrowthWidgetSourceData';

test('fetchGrowthWidgetSourceData paginates until the cutoff window is covered', async () => {
  const calls: Array<{ page: number; size: number }> = [];
  const api = {
    async getMyTrades({ page = 0, size = 20 }: { page?: number; size?: number }) {
      calls.push({ page, size });

      if (page === 0) {
        return {
          trades: [
            { tradeId: 10, tradedAt: '2026-03-29T09:00:00Z' },
            { tradeId: 9, tradedAt: '2026-03-28T09:00:00Z' },
          ],
          totalCount: 4,
          hasNext: true,
        };
      }

      if (page === 1) {
        return {
          trades: [
            { tradeId: 8, tradedAt: '2025-04-01T09:00:00Z' },
            { tradeId: 7, tradedAt: '2025-03-20T09:00:00Z' },
          ],
          totalCount: 4,
          hasNext: true,
        };
      }

      return {
        trades: [
          { tradeId: 6, tradedAt: '2025-03-01T09:00:00Z' },
        ],
        totalCount: 4,
        hasNext: false,
      };
    },
  };

  const result = await fetchGrowthWidgetSourceData({
    api,
    referenceDate: new Date('2026-03-29T12:00:00Z'),
    pageSize: 2,
  });

  assert.deepEqual(calls, [
    { page: 0, size: 2 },
    { page: 1, size: 2 },
  ]);
  assert.deepEqual(result.trades.map((trade) => trade.tradeId), [10, 9, 8]);
});

test('fetchGrowthWidgetSourceData deduplicates repeated trades across pages', async () => {
  const api = {
    async getMyTrades({ page = 0 }: { page?: number; size?: number }) {
      if (page === 0) {
        return {
          trades: [
            { tradeId: 10, tradedAt: '2026-03-29T09:00:00Z' },
            { tradeId: 9, tradedAt: '2026-03-28T09:00:00Z' },
          ],
          totalCount: 3,
          hasNext: true,
        };
      }

      return {
        trades: [
          { tradeId: 9, tradedAt: '2026-03-28T09:00:00Z' },
          { tradeId: 8, tradedAt: '2026-03-27T09:00:00Z' },
        ],
        totalCount: 3,
        hasNext: false,
      };
    },
  };

  const result = await fetchGrowthWidgetSourceData({
    api,
    referenceDate: new Date('2026-03-29T12:00:00Z'),
    pageSize: 2,
  });

  assert.deepEqual(result.trades.map((trade) => trade.tradeId), [10, 9, 8]);
});
