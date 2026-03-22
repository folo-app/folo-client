import { StyleSheet, Text, View } from 'react-native';

import { tokens } from '../theme/tokens';

export type AllocationVisualItem = {
  key: string;
  label: string;
  ratio: number;
  color: string;
  value?: string;
  meta?: string;
};

type AllocationBarProps = {
  items: AllocationVisualItem[];
  height?: number;
};

type AllocationLegendProps = {
  items: AllocationVisualItem[];
  limit?: number;
};

function normalizedRatio(value: number) {
  return value > 1 ? value : value * 100;
}

export function AllocationBar({
  items,
  height = 18,
}: AllocationBarProps) {
  const visibleItems = items.filter((item) => item.ratio > 0);

  if (visibleItems.length === 0) {
    return <View style={[styles.track, { height }]} />;
  }

  return (
    <View style={[styles.track, { height }]}>
      {visibleItems.map((item) => (
        <View
          key={item.key}
          style={[
            styles.segment,
            {
              backgroundColor: item.color,
              flexGrow: Math.max(normalizedRatio(item.ratio), 1),
            },
          ]}
        />
      ))}
    </View>
  );
}

export function AllocationLegend({
  items,
  limit = items.length,
}: AllocationLegendProps) {
  const visibleItems = items.slice(0, limit);

  return (
    <View style={styles.legendList}>
      {visibleItems.map((item) => (
        <View key={item.key} style={styles.legendRow}>
          <View style={styles.legendIdentity}>
            <View
              style={[
                styles.legendDot,
                {
                  backgroundColor: item.color,
                },
              ]}
            />
            <View style={styles.legendText}>
              <Text numberOfLines={1} style={styles.legendLabel}>
                {item.label}
              </Text>
              {item.meta ? <Text style={styles.legendMeta}>{item.meta}</Text> : null}
            </View>
          </View>
          <View style={styles.legendNumbers}>
            {item.value ? <Text style={styles.legendValue}>{item.value}</Text> : null}
            <Text style={styles.legendRatio}>{normalizedRatio(item.ratio).toFixed(1)}%</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    borderRadius: 999,
    backgroundColor: 'rgba(214, 224, 234, 0.6)',
    overflow: 'hidden',
    flexDirection: 'row',
  },
  segment: {
    height: '100%',
  },
  legendList: {
    gap: 10,
  },
  legendRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  legendIdentity: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 10,
    minWidth: 0,
  },
  legendDot: {
    borderRadius: 999,
    height: 10,
    width: 10,
  },
  legendText: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  legendLabel: {
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontSize: 14,
    fontWeight: '700',
  },
  legendMeta: {
    color: tokens.colors.inkMute,
    fontFamily: tokens.typography.body,
    fontSize: 12,
  },
  legendNumbers: {
    alignItems: 'flex-end',
    gap: 2,
    minWidth: 92,
  },
  legendValue: {
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.body,
    fontSize: 12,
  },
  legendRatio: {
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontSize: 14,
    fontWeight: '700',
  },
});
