import SwiftUI
import WidgetKit

private let growthWidgetKind = "FoloGrowthWidget"

struct GrowthWidgetProvider: TimelineProvider {
  private let snapshotStore = GrowthWidgetSnapshotStore()

  func placeholder(in context: Context) -> GrowthWidgetEntry {
    GrowthWidgetEntry(date: Date(), snapshot: .placeholder(referenceDate: Date()))
  }

  func getSnapshot(in context: Context, completion: @escaping (GrowthWidgetEntry) -> Void) {
    completion(entry(at: Date()))
  }

  func getTimeline(in context: Context, completion: @escaping (Timeline<GrowthWidgetEntry>) -> Void) {
    let now = Date()
    let refreshDate = Calendar.current.date(byAdding: .minute, value: 30, to: now)
      ?? now.addingTimeInterval(30 * 60)

    completion(
      Timeline(entries: [entry(at: now)], policy: .after(refreshDate))
    )
  }

  private func entry(at date: Date) -> GrowthWidgetEntry {
    GrowthWidgetEntry(date: date, snapshot: snapshotStore.readSnapshot(now: date))
  }
}

struct FoloGrowthWidget: Widget {
  var body: some WidgetConfiguration {
    StaticConfiguration(kind: growthWidgetKind, provider: GrowthWidgetProvider()) { entry in
      GrowthWidgetRootView(entry: entry)
    }
    .configurationDisplayName("Growth Streak")
    .description("Recent trading rhythm and streak progress.")
    .supportedFamilies([.systemSmall, .systemMedium])
  }
}

private struct GrowthWidgetRootView: View {
  @Environment(\.widgetFamily) private var widgetFamily

  let entry: GrowthWidgetEntry

  var body: some View {
    Group {
      switch widgetFamily {
      case .systemMedium:
        GrowthWidgetMediumView(snapshot: entry.snapshot)
      default:
        GrowthWidgetSmallView(snapshot: entry.snapshot)
      }
    }
    .modifier(GrowthWidgetChrome())
    .widgetURL(entry.snapshot.deepLink)
  }
}

private struct GrowthWidgetChrome: ViewModifier {
  @ViewBuilder
  func body(content: Content) -> some View {
    let backgroundShape = RoundedRectangle(cornerRadius: 24, style: .continuous)

    if #available(iOSApplicationExtension 17.0, *) {
      content
        .padding(16)
        .containerBackground(for: .widget) {
          backgroundShape.fill(GrowthWidgetPalette.background)
        }
        .overlay {
          backgroundShape.stroke(GrowthWidgetPalette.border, lineWidth: 1)
        }
    } else {
      content
        .padding(16)
        .background {
          backgroundShape.fill(GrowthWidgetPalette.background)
        }
        .overlay {
          backgroundShape.stroke(GrowthWidgetPalette.border, lineWidth: 1)
        }
    }
  }
}
