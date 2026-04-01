import { StyleSheet, Text, View } from 'react-native';

import { tokens } from '../theme/tokens';

const cellColors = ['#E8EEF5', '#CCE1FF', '#93C5FD', '#3B82F6', '#1D4ED8'] as const;
const defaultWeekdayLabels = ['월', '', '수', '', '금', '', ''] as const;

export type HeatmapDay = {
  key: string;
  count: number;
  dateLabel: string;
  level: number;
};

export type HeatmapWeek = {
  key: string;
  label?: string;
  days: ReadonlyArray<HeatmapDay>;
};

export function Heatmap({
  weeks,
  cellSize = 14,
  gap = 6,
  weekdayLabels = defaultWeekdayLabels,
}: {
  weeks: ReadonlyArray<HeatmapWeek>;
  cellSize?: number;
  gap?: number;
  weekdayLabels?: ReadonlyArray<string>;
}) {
  const monthLabelWidth = Math.max(cellSize + 6, 24);
  const weekdayColumnWidth = 16;

  return (
    <View style={styles.wrapper}>
      <View style={[styles.monthRow, { marginLeft: weekdayColumnWidth + gap }]}>
        {weeks.map((week) => (
          <View key={`month-${week.key}`} style={{ width: monthLabelWidth }}>
            <Text numberOfLines={1} style={styles.monthLabel}>
              {week.label ?? ''}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.board}>
        <View style={[styles.weekdayColumn, { gap, width: weekdayColumnWidth }]}>
          {weekdayLabels.map((label, index) => (
            <View
              key={`weekday-${index}`}
              style={[styles.weekdayCell, { height: cellSize, width: weekdayColumnWidth }]}
            >
              <Text style={styles.weekdayLabel}>{label}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.weekColumns, { gap }]}>
          {weeks.map((week) => (
            <View key={week.key} style={[styles.weekColumn, { gap }]}>
              {week.days.map((day) => (
                <View
                  key={day.key}
                  accessibilityLabel={`${day.dateLabel} 기록 ${day.count}건`}
                  accessible
                  style={[
                    styles.cell,
                    {
                      backgroundColor: cellColors[day.level] ?? cellColors[0],
                      height: cellSize,
                      width: cellSize,
                    },
                  ]}
                />
              ))}
            </View>
          ))}
        </View>
      </View>

      <View style={styles.legend}>
        <Text style={styles.legendText}>적음</Text>
        <View style={[styles.legendScale, { gap }]}>
          {cellColors.map((color) => (
            <View
              key={color}
              style={[
                styles.legendCell,
                {
                  backgroundColor: color,
                  height: cellSize,
                  width: cellSize,
                },
              ]}
            />
          ))}
        </View>
        <Text style={styles.legendText}>많음</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 10,
  },
  monthRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
  },
  monthLabel: {
    color: tokens.colors.inkMute,
    fontFamily: tokens.typography.body,
    fontSize: 11,
  },
  board: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 6,
  },
  weekdayColumn: {
    alignItems: 'flex-start',
  },
  weekdayCell: {
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  weekdayLabel: {
    color: tokens.colors.inkMute,
    fontFamily: tokens.typography.body,
    fontSize: 10,
  },
  weekColumns: {
    flexDirection: 'row',
  },
  weekColumn: {
    alignItems: 'center',
  },
  cell: {
    borderRadius: 4,
  },
  legend: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  legendScale: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  legendCell: {
    borderRadius: 4,
  },
  legendText: {
    color: tokens.colors.inkMute,
    fontFamily: tokens.typography.body,
    fontSize: 12,
  },
});
