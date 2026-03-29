import SwiftUI

struct GrowthWidgetSmallView: View {
  let snapshot: GrowthWidgetSnapshot

  var body: some View {
    VStack(alignment: .leading, spacing: 12) {
      HStack(alignment: .firstTextBaseline) {
        Text(snapshot.title)
          .font(.system(size: 15, weight: .bold, design: .rounded))
          .foregroundStyle(GrowthWidgetPalette.textStrong)
          .lineLimit(1)

        Spacer(minLength: 8)

        Text(snapshot.monthLabel.uppercased())
          .font(.system(size: 11, weight: .semibold, design: .rounded))
          .foregroundStyle(GrowthWidgetPalette.textMuted)
          .lineLimit(1)
      }

      Spacer(minLength: 0)

      GrowthHeatmapGrid(cells: snapshot.cells, cellSize: 12, spacing: 4)

      Spacer(minLength: 0)

      Text(snapshot.footerCopy)
        .font(.system(size: 12, weight: .semibold, design: .rounded))
        .foregroundStyle(GrowthWidgetPalette.textMuted)
        .lineLimit(1)
    }
  }
}

struct GrowthHeatmapGrid: View {
  let cells: [GrowthWidgetCell]
  let cellSize: CGFloat
  let spacing: CGFloat

  private var rows: [[GrowthWidgetCell]] {
    cells.chunked(into: 7)
  }

  var body: some View {
    VStack(alignment: .leading, spacing: spacing) {
      ForEach(Array(rows.enumerated()), id: \.offset) { _, row in
        HStack(spacing: spacing) {
          ForEach(row, id: \.date) { cell in
            RoundedRectangle(cornerRadius: 4, style: .continuous)
              .fill(GrowthWidgetPalette.cellColor(for: cell.clampedLevel))
              .frame(width: cellSize, height: cellSize)
              .overlay {
                if cell.isToday {
                  RoundedRectangle(cornerRadius: 4, style: .continuous)
                    .stroke(GrowthWidgetPalette.todayOutline, lineWidth: 1)
                }
              }
          }
        }
      }
    }
  }
}

enum GrowthWidgetPalette {
  static let background = Color(hex: 0xFFFFFF)
  static let textStrong = Color(hex: 0x0F172A)
  static let textMuted = Color(hex: 0x6B7280)
  static let border = Color(hex: 0xE5E7EB)
  static let todayOutline = Color(hex: 0x166534)

  static func cellColor(for level: Int) -> Color {
    switch level {
    case 1:
      return Color(hex: 0xECFDF3)
    case 2:
      return Color(hex: 0xBBF7D0)
    case 3:
      return Color(hex: 0x86EFAC)
    case 4:
      return Color(hex: 0x22C55E)
    default:
      return border
    }
  }

  static func pillFill(for status: GrowthWidgetStatus) -> Color {
    switch status {
    case .active:
      return Color(hex: 0xECFDF3)
    case .idle:
      return Color(hex: 0xFEF3C7)
    case .setup:
      return Color(hex: 0xF3F4F6)
    }
  }

  static func pillText(for status: GrowthWidgetStatus) -> Color {
    switch status {
    case .active:
      return Color(hex: 0x166534)
    case .idle:
      return Color(hex: 0x92400E)
    case .setup:
      return Color(hex: 0x4B5563)
    }
  }
}

struct GrowthStatusPill: View {
  let status: GrowthWidgetStatus

  var body: some View {
    Text(status.rawValue)
      .font(.system(size: 11, weight: .bold, design: .rounded))
      .foregroundStyle(GrowthWidgetPalette.pillText(for: status))
      .padding(.horizontal, 10)
      .padding(.vertical, 5)
      .background(
        Capsule()
          .fill(GrowthWidgetPalette.pillFill(for: status))
      )
  }
}

private extension Array {
  func chunked(into size: Int) -> [[Element]] {
    stride(from: 0, to: count, by: size).map { index in
      Array(self[index..<Swift.min(index + size, count)])
    }
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
