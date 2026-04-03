import SwiftUI
import WidgetKit

private let growthWidgetKind = "FoloGrowthWidget"
private let nextRoutineWidgetKind = "FoloNextRoutineWidget"

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

struct NextRoutineWidgetProvider: TimelineProvider {
  private let snapshotStore = GrowthWidgetSnapshotStore()

  func placeholder(in context: Context) -> NextRoutineWidgetEntry {
    NextRoutineWidgetEntry(date: Date(), snapshot: .placeholder(referenceDate: Date()))
  }

  func getSnapshot(in context: Context, completion: @escaping (NextRoutineWidgetEntry) -> Void) {
    completion(entry(at: Date()))
  }

  func getTimeline(
    in context: Context,
    completion: @escaping (Timeline<NextRoutineWidgetEntry>) -> Void
  ) {
    let now = Date()
    let refreshDate = Calendar.current.date(byAdding: .minute, value: 30, to: now)
      ?? now.addingTimeInterval(30 * 60)

    completion(
      Timeline(entries: [entry(at: now)], policy: .after(refreshDate))
    )
  }

  private func entry(at date: Date) -> NextRoutineWidgetEntry {
    NextRoutineWidgetEntry(date: date, snapshot: snapshotStore.readNextRoutineSnapshot(now: date))
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

struct NextRoutineWidget: Widget {
  var body: some WidgetConfiguration {
    StaticConfiguration(kind: nextRoutineWidgetKind, provider: NextRoutineWidgetProvider()) { entry in
      NextRoutineRootView(entry: entry)
    }
    .configurationDisplayName("Next Routine")
    .description("The next investing routine you should check.")
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

private struct NextRoutineRootView: View {
  @Environment(\.widgetFamily) private var widgetFamily

  let entry: NextRoutineWidgetEntry

  var body: some View {
    Group {
      switch widgetFamily {
      case .systemMedium:
        NextRoutineWidgetMediumView(snapshot: entry.snapshot)
      default:
        NextRoutineWidgetSmallView(snapshot: entry.snapshot)
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

private struct NextRoutineWidgetSmallView: View {
  let snapshot: NextRoutineWidgetSnapshot

  var body: some View {
    VStack(alignment: .leading, spacing: 12) {
      HStack(alignment: .firstTextBaseline, spacing: 8) {
        Text(snapshot.title)
          .font(.system(size: 15, weight: .bold, design: .rounded))
          .foregroundStyle(GrowthWidgetPalette.textStrong)
          .lineLimit(1)

        Spacer(minLength: 0)
        RoutineStatusPill(status: snapshot.status)
      }

      Spacer(minLength: 0)

      VStack(alignment: .leading, spacing: 6) {
        Text(snapshot.headline)
          .font(.system(size: 22, weight: .heavy, design: .rounded))
          .foregroundStyle(GrowthWidgetPalette.textStrong)
          .lineLimit(2)
          .minimumScaleFactor(0.7)

        Text(snapshot.subheadline)
          .font(.system(size: 12, weight: .semibold, design: .rounded))
          .foregroundStyle(GrowthWidgetPalette.textMuted)
          .lineLimit(1)

        Text(snapshot.amountLabel)
          .font(.system(size: 12, weight: .semibold, design: .rounded))
          .foregroundStyle(GrowthWidgetPalette.textStrong)
          .lineLimit(2)
      }

      Spacer(minLength: 0)

      Text(snapshot.footerCopy)
        .font(.system(size: 12, weight: .semibold, design: .rounded))
        .foregroundStyle(GrowthWidgetPalette.textMuted)
        .lineLimit(1)
    }
  }
}

private struct NextRoutineWidgetMediumView: View {
  let snapshot: NextRoutineWidgetSnapshot

  var body: some View {
    HStack(alignment: .top, spacing: 18) {
      VStack(alignment: .leading, spacing: 12) {
        HStack(alignment: .top, spacing: 8) {
          VStack(alignment: .leading, spacing: 4) {
            Text(snapshot.title)
              .font(.system(size: 17, weight: .bold, design: .rounded))
              .foregroundStyle(GrowthWidgetPalette.textStrong)
              .lineLimit(1)

            Text(snapshot.footerCopy)
              .font(.system(size: 12, weight: .semibold, design: .rounded))
              .foregroundStyle(GrowthWidgetPalette.textMuted)
              .lineLimit(1)
          }

          Spacer(minLength: 0)
          RoutineStatusPill(status: snapshot.status)
        }

        VStack(alignment: .leading, spacing: 6) {
          Text(snapshot.headline)
            .font(.system(size: 24, weight: .heavy, design: .rounded))
            .foregroundStyle(GrowthWidgetPalette.textStrong)
            .lineLimit(2)
            .minimumScaleFactor(0.7)

          Text(snapshot.subheadline)
            .font(.system(size: 13, weight: .semibold, design: .rounded))
            .foregroundStyle(GrowthWidgetPalette.textMuted)
            .lineLimit(1)

          Text(snapshot.amountLabel)
            .font(.system(size: 13, weight: .semibold, design: .rounded))
            .foregroundStyle(GrowthWidgetPalette.textStrong)
            .lineLimit(2)
          }
      }
      .frame(maxWidth: .infinity, alignment: .leading)

      VStack(alignment: .leading, spacing: 12) {
        RoutineMetricBlock(label: "ACTIVE", value: "\(max(snapshot.activeCount, 0))")
        RoutineMetricBlock(
          label: "DAY",
          value: snapshot.dayOfMonth.map { "\($0)일" } ?? "--"
        )
      }
      .frame(width: 96, alignment: .leading)
    }
  }
}

private struct RoutineStatusPill: View {
  let status: NextRoutineWidgetStatus

  var body: some View {
    Text(routineStatusLabel(status))
      .font(.system(size: 11, weight: .bold, design: .rounded))
      .foregroundStyle(RoutineWidgetPalette.pillText(for: status))
      .padding(.horizontal, 10)
      .padding(.vertical, 5)
      .background(
        Capsule()
          .fill(RoutineWidgetPalette.pillFill(for: status))
      )
  }
}

private struct RoutineMetricBlock: View {
  let label: String
  let value: String

  var body: some View {
    VStack(alignment: .leading, spacing: 6) {
      Text(label)
        .font(.system(size: 10, weight: .bold, design: .rounded))
        .foregroundStyle(GrowthWidgetPalette.textMuted)
        .lineLimit(1)

      Text(value)
        .font(.system(size: 26, weight: .heavy, design: .rounded))
        .foregroundStyle(GrowthWidgetPalette.textStrong)
        .lineLimit(1)
        .minimumScaleFactor(0.7)
    }
    .frame(maxWidth: .infinity, alignment: .leading)
    .padding(.vertical, 10)
    .padding(.horizontal, 12)
    .background(
      RoundedRectangle(cornerRadius: 16, style: .continuous)
        .fill(GrowthWidgetPalette.background)
    )
    .overlay(
      RoundedRectangle(cornerRadius: 16, style: .continuous)
        .stroke(GrowthWidgetPalette.border, lineWidth: 1)
    )
  }
}

private enum RoutineWidgetPalette {
  static func pillFill(for status: NextRoutineWidgetStatus) -> Color {
    switch status {
    case .active:
      return Color(hex: 0xE9F0FF)
    case .paused:
      return Color(hex: 0xFEF3C7)
    case .setup:
      return Color(hex: 0xF3F4F6)
    }
  }

  static func pillText(for status: NextRoutineWidgetStatus) -> Color {
    switch status {
    case .active:
      return Color(hex: 0x1D4ED8)
    case .paused:
      return Color(hex: 0x92400E)
    case .setup:
      return Color(hex: 0x4B5563)
    }
  }
}

private func routineStatusLabel(_ status: NextRoutineWidgetStatus) -> String {
  switch status {
  case .active:
    return "Ready"
  case .paused:
    return "Paused"
  case .setup:
    return "New"
  }
}

private extension Color {
  init(hex: UInt32) {
    let red = Double((hex >> 16) & 0xFF) / 255.0
    let green = Double((hex >> 8) & 0xFF) / 255.0
    let blue = Double(hex & 0xFF) / 255.0

    self.init(.sRGB, red: red, green: green, blue: blue, opacity: 1)
  }
}
