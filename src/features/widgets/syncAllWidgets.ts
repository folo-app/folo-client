import {
  clearGrowthWidgetSnapshotInBackground,
  syncGrowthWidgetSnapshotInBackground,
} from './syncGrowthWidgetSnapshot';
import {
  clearNextRoutineWidgetSnapshotInBackground,
  syncNextRoutineWidgetSnapshotInBackground,
} from './syncNextRoutineWidgetSnapshot';

export function syncAllWidgetsInBackground() {
  syncGrowthWidgetSnapshotInBackground();
  syncNextRoutineWidgetSnapshotInBackground();
}

export function clearAllWidgetsInBackground() {
  clearGrowthWidgetSnapshotInBackground();
  clearNextRoutineWidgetSnapshotInBackground();
}
