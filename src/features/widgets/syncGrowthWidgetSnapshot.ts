import { buildGrowthWidgetSnapshot } from './buildGrowthWidgetSnapshot';
import {
  fetchGrowthWidgetSourceData,
  type FetchGrowthWidgetSourceDataOptions,
} from './fetchGrowthWidgetSourceData';
import type { GrowthWidgetSnapshot, GrowthWidgetSourceData } from './types';

export type SyncGrowthWidgetSnapshotOptions = {
  fetchOptions?: FetchGrowthWidgetSourceDataOptions;
  fetchSourceData?: (
    options?: FetchGrowthWidgetSourceDataOptions,
  ) => Promise<GrowthWidgetSourceData>;
  persistSnapshot?: (snapshot: GrowthWidgetSnapshot) => Promise<void> | void;
  referenceDate?: Date;
  generatedAt?: Date;
};

export async function syncGrowthWidgetSnapshot({
  fetchOptions,
  fetchSourceData = fetchGrowthWidgetSourceData,
  persistSnapshot,
  referenceDate,
  generatedAt,
}: SyncGrowthWidgetSnapshotOptions = {}) {
  const sourceData = await fetchSourceData({
    ...fetchOptions,
    referenceDate: referenceDate ?? fetchOptions?.referenceDate,
  });
  const snapshot = buildGrowthWidgetSnapshot({
    sourceData,
    referenceDate,
    generatedAt,
  });

  await persistSnapshot?.(snapshot);
  return snapshot;
}
