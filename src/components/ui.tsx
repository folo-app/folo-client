import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { tokens } from '../theme/tokens';

type PageProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  action?: ReactNode;
  children: ReactNode;
};

type SurfaceCardProps = {
  children: ReactNode;
  tone?: 'default' | 'hero' | 'muted';
};

type PrimaryButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary';
};

type ChipProps = {
  label: string;
  active?: boolean;
  tone?: 'default' | 'brand' | 'positive' | 'danger';
  onPress?: () => void;
};

type MetricBadgeProps = {
  label: string;
  value: string;
  tone?: 'default' | 'brand' | 'positive' | 'danger';
};

export function Page({ eyebrow, title, subtitle, action, children }: PageProps) {
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.shell}>
        <View style={styles.glowLarge} />
        <View style={styles.glowSmall} />
        <View style={styles.header}>
          <Text style={styles.eyebrow}>{eyebrow}</Text>
          <View style={styles.headerRow}>
            <View style={styles.titleBlock}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.subtitle}>{subtitle}</Text>
            </View>
            {action}
          </View>
        </View>
        {children}
      </View>
    </ScrollView>
  );
}

export function SurfaceCard({ children, tone = 'default' }: SurfaceCardProps) {
  return <View style={[styles.card, cardToneStyles[tone]]}>{children}</View>;
}

export function PrimaryButton({
  label,
  onPress,
  variant = 'primary',
}: PrimaryButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === 'primary' ? styles.buttonPrimary : styles.buttonSecondary,
        pressed && styles.buttonPressed,
      ]}
    >
      <Text
        style={[
          styles.buttonText,
          variant === 'primary' ? styles.buttonPrimaryText : styles.buttonSecondaryText,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function Chip({ label, active, tone = 'default', onPress }: ChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        chipToneStyles[tone],
        active && styles.chipActive,
        pressed && styles.buttonPressed,
      ]}
    >
      <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>{label}</Text>
    </Pressable>
  );
}

export function MetricBadge({
  label,
  value,
  tone = 'default',
}: MetricBadgeProps) {
  return (
    <View style={[styles.metricBadge, metricToneStyles[tone]]}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

export function SectionHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <View style={styles.sectionHeading}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionDescription}>{description}</Text>
    </View>
  );
}

const cardToneStyles = StyleSheet.create({
  default: {
    backgroundColor: tokens.colors.surface,
  },
  hero: {
    backgroundColor: '#E9F0FF',
  },
  muted: {
    backgroundColor: tokens.colors.surfaceMuted,
  },
});

const chipToneStyles = StyleSheet.create({
  default: {
    backgroundColor: tokens.colors.surfaceMuted,
  },
  brand: {
    backgroundColor: tokens.colors.brandSoft,
  },
  positive: {
    backgroundColor: tokens.colors.positiveSoft,
  },
  danger: {
    backgroundColor: tokens.colors.dangerSoft,
  },
});

const metricToneStyles = StyleSheet.create({
  default: {
    backgroundColor: 'rgba(255,255,255,0.78)',
  },
  brand: {
    backgroundColor: tokens.colors.brandSoft,
  },
  positive: {
    backgroundColor: tokens.colors.positiveSoft,
  },
  danger: {
    backgroundColor: tokens.colors.dangerSoft,
  },
});

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 128,
  },
  shell: {
    width: '100%',
    maxWidth: tokens.layout.maxWidth,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingTop: 28,
    gap: 18,
  },
  glowLarge: {
    position: 'absolute',
    top: -80,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: 'rgba(37, 99, 235, 0.12)',
  },
  glowSmall: {
    position: 'absolute',
    top: 60,
    left: -50,
    width: 140,
    height: 140,
    borderRadius: 999,
    backgroundColor: 'rgba(15, 118, 110, 0.10)',
  },
  header: {
    paddingTop: 12,
    gap: 10,
  },
  eyebrow: {
    fontSize: 12,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: tokens.colors.brandStrong,
    fontFamily: tokens.typography.heading,
    fontWeight: '700',
  },
  headerRow: {
    gap: 16,
  },
  titleBlock: {
    gap: 8,
  },
  title: {
    fontSize: 32,
    lineHeight: 38,
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 24,
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.body,
  },
  card: {
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    borderColor: 'rgba(214, 224, 234, 0.72)',
    padding: 20,
    gap: 16,
    ...tokens.shadow,
  },
  button: {
    borderRadius: tokens.radius.pill,
    paddingHorizontal: 18,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPrimary: {
    backgroundColor: tokens.colors.navy,
  },
  buttonSecondary: {
    backgroundColor: tokens.colors.surface,
    borderWidth: 1,
    borderColor: tokens.colors.line,
  },
  buttonPrimaryText: {
    color: tokens.colors.surface,
  },
  buttonSecondaryText: {
    color: tokens.colors.navy,
  },
  buttonText: {
    fontSize: 15,
    fontFamily: tokens.typography.heading,
    fontWeight: '700',
  },
  buttonPressed: {
    opacity: 0.88,
  },
  chip: {
    borderRadius: tokens.radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignSelf: 'flex-start',
  },
  chipActive: {
    backgroundColor: tokens.colors.navy,
  },
  chipLabel: {
    fontSize: 13,
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.heading,
    fontWeight: '600',
  },
  chipLabelActive: {
    color: tokens.colors.surface,
  },
  metricBadge: {
    flex: 1,
    borderRadius: 18,
    padding: 14,
    gap: 6,
  },
  metricLabel: {
    fontSize: 12,
    color: tokens.colors.inkMute,
    fontFamily: tokens.typography.body,
  },
  metricValue: {
    fontSize: 16,
    color: tokens.colors.ink,
    fontFamily: tokens.typography.heading,
    fontWeight: '700',
  },
  sectionHeading: {
    gap: 4,
  },
  sectionTitle: {
    fontSize: 20,
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontWeight: '800',
  },
  sectionDescription: {
    fontSize: 14,
    color: tokens.colors.inkSoft,
    lineHeight: 22,
    fontFamily: tokens.typography.body,
  },
});
