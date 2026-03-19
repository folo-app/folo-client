import { StyleSheet, Text } from 'react-native';

import { SurfaceCard } from './ui';
import { tokens } from '../theme/tokens';

export function DataStatusCard({
  loading,
  error,
}: {
  loading: boolean;
  error: string | null;
}) {
  if (!loading && !error) {
    return null;
  }

  return (
    <SurfaceCard tone="muted">
      <Text style={styles.title}>
        {loading ? '백엔드 데이터를 불러오는 중입니다.' : '데이터 상태를 확인해 주세요.'}
      </Text>
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
});
