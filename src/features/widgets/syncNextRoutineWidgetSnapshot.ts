import { buildNextRoutineWidgetSnapshot } from './buildNextRoutineWidgetSnapshot';
import { fetchNextRoutineWidgetSourceData } from './fetchNextRoutineWidgetSourceData';
import {
  clearNextRoutineWidgetSnapshot,
  saveNextRoutineWidgetSnapshot,
} from './native/WidgetSnapshotBridge';
import type {
  NextRoutineWidgetSnapshot,
  NextRoutineWidgetSourceData,
} from './types';

export type SyncNextRoutineWidgetSnapshotOptions = {
  fetchSourceData?: () => Promise<NextRoutineWidgetSourceData>;
  persistSnapshot?: (snapshot: NextRoutineWidgetSnapshot) => Promise<void> | void;
  referenceDate?: Date;
  generatedAt?: Date;
};

export async function syncNextRoutineWidgetSnapshot({
  fetchSourceData = fetchNextRoutineWidgetSourceData,
  persistSnapshot = saveNextRoutineWidgetSnapshot,
  referenceDate,
  generatedAt,
}: SyncNextRoutineWidgetSnapshotOptions = {}) {
  const sourceData = await fetchSourceData();
  const snapshot = buildNextRoutineWidgetSnapshot({
    sourceData,
    referenceDate,
    generatedAt,
  });

  await persistSnapshot?.(snapshot);
  return snapshot;
}

function reportNextRoutineWidgetSyncError(error: unknown) {
  console.warn(
    '[widgets] Next routine widget sync failed:',
    error instanceof Error ? error.message : error,
  );
}

export function syncNextRoutineWidgetSnapshotInBackground(
  options?: SyncNextRoutineWidgetSnapshotOptions,
) {
  void syncNextRoutineWidgetSnapshot(options).catch(reportNextRoutineWidgetSyncError);
}

export function clearNextRoutineWidgetSnapshotInBackground() {
  void clearNextRoutineWidgetSnapshot().catch(reportNextRoutineWidgetSyncError);
}
