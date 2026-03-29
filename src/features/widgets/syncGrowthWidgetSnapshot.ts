import { buildGrowthWidgetSnapshot } from './buildGrowthWidgetSnapshot';
import {
  fetchGrowthWidgetSourceData,
  type FetchGrowthWidgetSourceDataOptions,
} from './fetchGrowthWidgetSourceData';
import {
  clearGrowthWidgetSnapshot,
  saveGrowthWidgetSnapshot,
} from './native/WidgetSnapshotBridge';
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
  persistSnapshot = saveGrowthWidgetSnapshot,
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

function reportGrowthWidgetSyncError(error: unknown) {
  console.warn(
    '[widgets] Growth widget sync failed:',
    error instanceof Error ? error.message : error,
  );
}

export function syncGrowthWidgetSnapshotInBackground(
  options?: SyncGrowthWidgetSnapshotOptions,
) {
  void syncGrowthWidgetSnapshot(options).catch(reportGrowthWidgetSyncError);
}

export function clearGrowthWidgetSnapshotInBackground() {
  void clearGrowthWidgetSnapshot().catch(reportGrowthWidgetSyncError);
}
