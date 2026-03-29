import Foundation
import WidgetKit

struct GrowthWidgetEntry: TimelineEntry {
  let date: Date
  let snapshot: GrowthWidgetSnapshot
}

enum GrowthWidgetStatus: String, Decodable {
  case active = "ACTIVE"
  case idle = "IDLE"
  case setup = "SETUP"
}

struct GrowthWidgetCell: Decodable, Hashable {
  let date: String
  let level: Int
  let isToday: Bool

  var clampedLevel: Int {
    min(max(level, 0), 4)
  }
}

struct GrowthWidgetSnapshot: Decodable {
  let schemaVersion: Int
  let generatedAt: String
  let deepLinkUrl: String
  let title: String
  let monthLabel: String
  let status: GrowthWidgetStatus
  let currentStreak: Int
  let longestStreak: Int
  let footerCopy: String
  let cells: [GrowthWidgetCell]

  var deepLink: URL? {
    URL(string: deepLinkUrl)
  }

  var isRenderable: Bool {
    schemaVersion == 1 && cells.count == 35
  }

  static func placeholder(referenceDate: Date) -> GrowthWidgetSnapshot {
    GrowthWidgetSnapshot(
      schemaVersion: 1,
      generatedAt: iso8601Formatter.string(from: referenceDate),
      deepLinkUrl: "folo://widget/growth-streak?source=widget-growth",
      title: "Growth Streak",
      monthLabel: monthFormatter.string(from: referenceDate),
      status: .setup,
      currentStreak: 0,
      longestStreak: 0,
      footerCopy: "Start your streak",
      cells: buildPlaceholderCells(referenceDate: referenceDate)
    )
  }

  private static func buildPlaceholderCells(referenceDate: Date) -> [GrowthWidgetCell] {
    let calendar = Calendar.current
    let start = calendar.startOfDay(
      for: calendar.date(byAdding: .day, value: -34, to: referenceDate) ?? referenceDate
    )

    return (0..<35).map { offset in
      let day = calendar.date(byAdding: .day, value: offset, to: start) ?? start

      return GrowthWidgetCell(
        date: dateFormatter.string(from: day),
        level: 0,
        isToday: offset == 34
      )
    }
  }
}

private let monthFormatter: DateFormatter = {
  let formatter = DateFormatter()
  formatter.locale = Locale(identifier: "en_US_POSIX")
  formatter.dateFormat = "MMMM"
  return formatter
}()

private let dateFormatter: DateFormatter = {
  let formatter = DateFormatter()
  formatter.calendar = Calendar(identifier: .gregorian)
  formatter.locale = Locale(identifier: "en_US_POSIX")
  formatter.dateFormat = "yyyy-MM-dd"
  return formatter
}()

private let iso8601Formatter: ISO8601DateFormatter = {
  let formatter = ISO8601DateFormatter()
  formatter.formatOptions = [.withInternetDateTime]
  return formatter
}()
