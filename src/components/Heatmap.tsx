import { StyleSheet, Text, View } from 'react-native';

import { tokens } from '../theme/tokens';

const cellColors = ['#E8EEF5', '#CCE1FF', '#93C5FD', '#3B82F6', '#1D4ED8'] as const;

export function Heatmap({ values }: { values: ReadonlyArray<ReadonlyArray<number>> }) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.grid}>
        {values.map((row, rowIndex) => (
          <View key={`row-${rowIndex}`} style={styles.row}>
            {row.map((value, columnIndex) => (
              <View
                key={`cell-${rowIndex}-${columnIndex}`}
                style={[styles.cell, { backgroundColor: cellColors[value] ?? cellColors[0] }]}
              />
            ))}
          </View>
        ))}
      </View>
      <View style={styles.legend}>
        <Text style={styles.legendText}>적음</Text>
        <View style={styles.legendScale}>
          {cellColors.map((color) => (
            <View key={color} style={[styles.legendCell, { backgroundColor: color }]} />
          ))}
        </View>
        <Text style={styles.legendText}>많음</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 12,
  },
  grid: {
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    gap: 6,
  },
  cell: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 8,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  legendScale: {
    flexDirection: 'row',
    gap: 6,
    flex: 1,
    justifyContent: 'center',
  },
  legendCell: {
    width: 18,
    height: 18,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: tokens.colors.inkMute,
    fontFamily: tokens.typography.body,
  },
});
