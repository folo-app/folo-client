import { NativeModules, Platform } from 'react-native';

import type { GrowthWidgetSnapshot, NextRoutineWidgetSnapshot } from '../types';

type NativeWidgetSnapshotBridge = {
  saveGrowthSnapshot(snapshotJson: string): Promise<void>;
  clearGrowthSnapshot(): Promise<void>;
  saveNextRoutineSnapshot(snapshotJson: string): Promise<void>;
  clearNextRoutineSnapshot(): Promise<void>;
};

const nativeBridge = NativeModules.WidgetSnapshotBridge as
  | NativeWidgetSnapshotBridge
  | undefined;

function getNativeBridge() {
  if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
    return null;
  }

  if (!nativeBridge) {
    throw new Error(
      'WidgetSnapshotBridge native module is unavailable. Rebuild the native app to include the widget bridge.',
    );
  }

  return nativeBridge;
}

export async function saveGrowthWidgetSnapshot(snapshot: GrowthWidgetSnapshot) {
  const bridge = getNativeBridge();

  if (!bridge) {
    return;
  }

  await bridge.saveGrowthSnapshot(JSON.stringify(snapshot));
}

export async function clearGrowthWidgetSnapshot() {
  const bridge = getNativeBridge();

  if (!bridge) {
    return;
  }

  await bridge.clearGrowthSnapshot();
}

export async function saveNextRoutineWidgetSnapshot(
  snapshot: NextRoutineWidgetSnapshot,
) {
  const bridge = getNativeBridge();

  if (!bridge) {
    return;
  }

  await bridge.saveNextRoutineSnapshot(JSON.stringify(snapshot));
}

export async function clearNextRoutineWidgetSnapshot() {
  const bridge = getNativeBridge();

  if (!bridge) {
    return;
  }

  await bridge.clearNextRoutineSnapshot();
}

export const widgetSnapshotBridge = {
  saveGrowthSnapshot: saveGrowthWidgetSnapshot,
  clearGrowthSnapshot: clearGrowthWidgetSnapshot,
  saveNextRoutineSnapshot: saveNextRoutineWidgetSnapshot,
  clearNextRoutineSnapshot: clearNextRoutineWidgetSnapshot,
};
