import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

import { tokens } from '../theme/tokens';

export type AllocationVisualItem = {
  key: string;
  label: string;
  ratio: number;
  color: string;
  value?: string;
  meta?: string;
};

export type MonthlyDividendVisualItem = {
  key: string;
  label: string;
  amount: number;
};

type AllocationBarProps = {
  items: AllocationVisualItem[];
  height?: number;
};

type AllocationLegendProps = {
  items: AllocationVisualItem[];
  limit?: number;
};

type AllocationLegendGridProps = {
  items: AllocationVisualItem[];
  limit?: number;
  columns?: 1 | 2;
};

type AllocationDonutChartProps = {
  items: AllocationVisualItem[];
  size?: number;
  strokeWidth?: number;
  centerLabel?: string;
  centerSubLabel?: string;
};

type MonthlyDividendChartProps = {
  items: MonthlyDividendVisualItem[];
};

function normalizedRatio(value: number) {
  return value > 1 ? value : value * 100;
}

function formatCompactAmount(value: number) {
  return new Intl.NumberFormat('ko-KR', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

export function AllocationDonutChart({
  items,
  size = 184,
  strokeWidth = 24,
  centerLabel,
  centerSubLabel,
}: AllocationDonutChartProps) {
  const visibleItems = items
    .map((item) => ({ ...item, normalizedRatio: normalizedRatio(item.ratio) }))
    .filter((item) => item.normalizedRatio > 0);
  const total = visibleItems.reduce((sum, item) => sum + item.normalizedRatio, 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let progress = 0;

  return (
    <View style={[styles.donutWrap, { width: size, height: size }]}>
      <Svg height={size} width={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          fill="none"
          r={radius}
          stroke="rgba(214, 224, 234, 0.52)"
          strokeWidth={strokeWidth}
        />
        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
          {visibleItems.map((item) => {
            const ratio = total > 0 ? item.normalizedRatio / total : 0;
            const segmentLength = circumference * ratio;
            const strokeDasharray = `${segmentLength} ${circumference - segmentLength}`;
            const strokeDashoffset = -progress * circumference;

            progress += ratio;

            return (
              <Circle
                key={item.key}
                cx={size / 2}
                cy={size / 2}
                fill="none"
                r={radius}
                stroke={item.color}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="butt"
                strokeWidth={strokeWidth}
              />
            );
          })}
        </G>
      </Svg>
      <View style={styles.donutCenter}>
        {centerSubLabel ? <Text style={styles.donutCenterSub}>{centerSubLabel}</Text> : null}
        {centerLabel ? (
          <Text
            adjustsFontSizeToFit
            minimumFontScale={0.5}
            numberOfLines={1}
            style={[
              styles.donutCenterLabel,
              size <= 160 && styles.donutCenterLabelCompact,
            ]}
          >
            {centerLabel}
          </Text>
        ) : null}
      </View>
    </View>
  );
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

export function AllocationLegendGrid({
  items,
  limit = items.length,
  columns = 2,
}: AllocationLegendGridProps) {
  const visibleItems = items.slice(0, limit);
  const singleColumn = columns === 1;

  return (
    <View style={[styles.legendGrid, singleColumn && styles.legendGridSingleColumn]}>
      {visibleItems.map((item) => (
        <View
          key={item.key}
          style={[styles.legendGridItem, singleColumn && styles.legendGridItemSingleColumn]}
        >
          <View style={styles.legendIdentity}>
            <View
              style={[
                styles.legendDot,
                {
                  backgroundColor: item.color,
                },
              ]}
            />
            <Text numberOfLines={1} style={styles.legendGridLabel}>
              {item.label}
            </Text>
          </View>
          <Text style={styles.legendGridRatio}>{normalizedRatio(item.ratio).toFixed(1)}%</Text>
        </View>
      ))}
    </View>
  );
}

export function MonthlyDividendChart({ items }: MonthlyDividendChartProps) {
  const maxAmount = Math.max(...items.map((item) => item.amount), 0);

  return (
    <View style={styles.dividendChart}>
      {items.map((item) => {
        const ratio = maxAmount > 0 ? item.amount / maxAmount : 0;
        const barHeight = maxAmount > 0 ? 18 + ratio * 72 : 10;
        const highlighted = maxAmount > 0 && item.amount === maxAmount;

        return (
          <View key={item.key} style={styles.dividendColumn}>
            <Text style={styles.dividendValue}>
              {item.amount > 0 ? formatCompactAmount(item.amount) : ''}
            </Text>
            <View style={styles.dividendTrack}>
              <View
                style={[
                  styles.dividendBar,
                  {
                    backgroundColor: highlighted ? '#F4B740' : '#25314D',
                    height: barHeight,
                  },
                ]}
              />
            </View>
            <Text style={styles.dividendMonth}>{item.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  donutWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    width: '74%',
  },
  donutCenterSub: {
    color: tokens.colors.inkMute,
    fontFamily: tokens.typography.body,
    fontSize: 11,
    textAlign: 'center',
  },
  donutCenterLabel: {
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  donutCenterLabelCompact: {
    fontSize: 14,
  },
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
  legendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  legendGridSingleColumn: {
    flexDirection: 'column',
    flexWrap: 'nowrap',
  },
  legendGridItem: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minWidth: '47%',
    maxWidth: '48%',
    gap: 10,
  },
  legendGridItemSingleColumn: {
    minWidth: '100%',
    maxWidth: '100%',
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
  legendGridLabel: {
    color: tokens.colors.navy,
    flex: 1,
    fontFamily: tokens.typography.heading,
    fontSize: 13,
    fontWeight: '700',
  },
  legendGridRatio: {
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.heading,
    fontSize: 13,
    fontWeight: '700',
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
  dividendChart: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 8,
    minHeight: 126,
  },
  dividendColumn: {
    flex: 1,
    gap: 8,
    minWidth: 0,
  },
  dividendValue: {
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.body,
    fontSize: 10,
    minHeight: 14,
    textAlign: 'center',
  },
  dividendTrack: {
    alignItems: 'center',
    height: 92,
    justifyContent: 'flex-end',
  },
  dividendBar: {
    borderRadius: 8,
    width: '100%',
  },
  dividendMonth: {
    color: tokens.colors.inkMute,
    fontFamily: tokens.typography.body,
    fontSize: 11,
    textAlign: 'center',
  },
});
