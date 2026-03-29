import Foundation

struct GrowthWidgetSnapshotStore {
  private let appGroupIdentifier = "group.com.godten.folo"
  private let growthSnapshotKey = "growth_widget_snapshot"
  private let decoder = JSONDecoder()

  func readSnapshot(now: Date = Date()) -> GrowthWidgetSnapshot {
    guard
      let sharedDefaults = UserDefaults(suiteName: appGroupIdentifier),
      let snapshotJson = sharedDefaults.string(forKey: growthSnapshotKey),
      let data = snapshotJson.data(using: .utf8),
      let snapshot = try? decoder.decode(GrowthWidgetSnapshot.self, from: data),
      snapshot.isRenderable
    else {
      return .placeholder(referenceDate: now)
    }

    return snapshot
  }
}
