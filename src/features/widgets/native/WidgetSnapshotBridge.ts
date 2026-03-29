import { NativeModules, Platform } from 'react-native';

import type { GrowthWidgetSnapshot } from '../types';

type NativeWidgetSnapshotBridge = {
  saveGrowthSnapshot(snapshotJson: string): Promise<void>;
  clearGrowthSnapshot(): Promise<void>;
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

export const widgetSnapshotBridge = {
  saveGrowthSnapshot: saveGrowthWidgetSnapshot,
  clearGrowthSnapshot: clearGrowthWidgetSnapshot,
};
