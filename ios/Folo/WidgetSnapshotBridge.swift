import Foundation
import React
import WidgetKit

@objc(WidgetSnapshotBridge)
final class WidgetSnapshotBridge: NSObject {
  private let growthWidgetKind = "FoloGrowthWidget"
  private let appGroupIdentifier = "group.com.godten.folo"
  private let growthSnapshotKey = "growth_widget_snapshot"

  @objc
  static func requiresMainQueueSetup() -> Bool {
    false
  }

  @objc(saveGrowthSnapshot:resolver:rejecter:)
  func saveGrowthSnapshot(
    _ snapshotJson: String,
    resolver resolve: RCTPromiseResolveBlock,
    rejecter reject: RCTPromiseRejectBlock
  ) {
    do {
      try validateSnapshotJson(snapshotJson)
      guard let sharedDefaults = UserDefaults(suiteName: appGroupIdentifier) else {
        reject(
          "E_APP_GROUP_UNAVAILABLE",
          "Unable to access the App Group container for widget snapshots.",
          nil
        )
        return
      }

      sharedDefaults.set(snapshotJson, forKey: growthSnapshotKey)
      sharedDefaults.synchronize()
      reloadWidgets()
      resolve(nil)
    } catch {
      reject(
        "E_WIDGET_SNAPSHOT_SAVE_FAILED",
        "Failed to save the growth widget snapshot.",
        error
      )
    }
  }

  @objc(clearGrowthSnapshot:rejecter:)
  func clearGrowthSnapshot(
    _ resolve: RCTPromiseResolveBlock,
    rejecter reject: RCTPromiseRejectBlock
  ) {
    guard let sharedDefaults = UserDefaults(suiteName: appGroupIdentifier) else {
      reject(
        "E_APP_GROUP_UNAVAILABLE",
        "Unable to access the App Group container for widget snapshots.",
        nil
      )
      return
    }

    sharedDefaults.removeObject(forKey: growthSnapshotKey)
    sharedDefaults.synchronize()
    reloadWidgets()
    resolve(nil)
  }

  private func validateSnapshotJson(_ snapshotJson: String) throws {
    let data = Data(snapshotJson.utf8)
    _ = try JSONSerialization.jsonObject(with: data)
  }

  private func reloadWidgets() {
    if #available(iOS 14.0, *) {
      WidgetCenter.shared.reloadTimelines(ofKind: growthWidgetKind)
    }
  }
}
