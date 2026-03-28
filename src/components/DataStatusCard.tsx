import { StyleSheet, Text, View } from 'react-native';

import { SurfaceCard } from './ui';
import { tokens } from '../theme/tokens';

export function DataStatusCard({
  loading,
  error,
  variant = 'card',
}: {
  loading: boolean;
  error: string | null;
  variant?: 'card' | 'inline';
}) {
  if (!loading && !error) {
    return null;
  }

  const title = loading ? '불러오는 중입니다.' : '데이터 상태를 확인해 주세요.';

  if (variant === 'inline') {
    return (
      <View style={[styles.inlineShell, error ? styles.inlineShellError : styles.inlineShellLoading]}>
        <Text style={styles.inlineTitle}>{title}</Text>
        {error ? <Text style={styles.inlineDescription}>{error}</Text> : null}
      </View>
    );
  }

  return (
    <SurfaceCard tone="muted">
      <Text style={styles.title}>{title}</Text>
      {error ? <Text style={styles.description}>{error}</Text> : null}
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 14,
    lineHeight: 22,
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontWeight: '700',
  },
  description: {
    fontSize: 13,
    lineHeight: 20,
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.body,
  },
  inlineShell: {
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  inlineShellLoading: {
    backgroundColor: 'rgba(248, 250, 252, 0.88)',
    borderColor: 'rgba(214, 224, 234, 0.92)',
  },
  inlineShellError: {
    backgroundColor: 'rgba(255, 245, 245, 0.92)',
    borderColor: 'rgba(239, 68, 68, 0.18)',
  },
  inlineTitle: {
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontSize: 13,
    fontWeight: '700',
  },
  inlineDescription: {
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.body,
    fontSize: 12,
    lineHeight: 18,
  },
});
