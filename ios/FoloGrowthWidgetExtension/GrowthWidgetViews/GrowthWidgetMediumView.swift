import SwiftUI

struct GrowthWidgetMediumView: View {
  let snapshot: GrowthWidgetSnapshot

  var body: some View {
    HStack(alignment: .top, spacing: 18) {
      VStack(alignment: .leading, spacing: 12) {
        HStack(alignment: .top) {
          VStack(alignment: .leading, spacing: 4) {
            Text(snapshot.title)
              .font(.system(size: 17, weight: .bold, design: .rounded))
              .foregroundStyle(GrowthWidgetPalette.textStrong)
              .lineLimit(1)

            Text(snapshot.monthLabel)
              .font(.system(size: 12, weight: .semibold, design: .rounded))
              .foregroundStyle(GrowthWidgetPalette.textMuted)
              .lineLimit(1)
          }

          Spacer(minLength: 8)

          GrowthStatusPill(status: snapshot.status)
        }

        GrowthHeatmapGrid(cells: snapshot.cells, cellSize: 14, spacing: 4)

        Text(snapshot.footerCopy)
          .font(.system(size: 12, weight: .semibold, design: .rounded))
          .foregroundStyle(GrowthWidgetPalette.textMuted)
          .lineLimit(1)
      }
      .frame(maxWidth: .infinity, alignment: .leading)

      VStack(alignment: .leading, spacing: 12) {
        GrowthMetricBlock(label: "CURRENT STREAK", value: snapshot.currentStreak)
        GrowthMetricBlock(label: "LONGEST STREAK", value: snapshot.longestStreak)
      }
      .frame(width: 104, alignment: .leading)
    }
  }
}

private struct GrowthMetricBlock: View {
  let label: String
  let value: Int

  var body: some View {
    VStack(alignment: .leading, spacing: 6) {
      Text(label)
        .font(.system(size: 10, weight: .bold, design: .rounded))
        .foregroundStyle(GrowthWidgetPalette.textMuted)
        .lineLimit(1)
        .minimumScaleFactor(0.85)

      Text("\(max(value, 0))")
        .font(.system(size: 30, weight: .heavy, design: .rounded))
        .monospacedDigit()
        .foregroundStyle(GrowthWidgetPalette.textStrong)
        .lineLimit(1)
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
