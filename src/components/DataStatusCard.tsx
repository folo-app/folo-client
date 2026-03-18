import { StyleSheet, Text } from 'react-native';

import { SurfaceCard } from './ui';
import { tokens } from '../theme/tokens';

export function DataStatusCard({
  source,
  loading,
  error,
}: {
  source: 'api' | 'fallback';
  loading: boolean;
  error: string | null;
}) {
  if (!loading && source === 'api' && !error) {
    return null;
  }

  const title = loading
    ? '백엔드 데이터를 불러오는 중입니다.'
    : source === 'fallback'
      ? '백엔드 미연결 상태라 샘플 데이터로 표시 중입니다.'
      : '데이터 상태를 확인해 주세요.';

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
});
