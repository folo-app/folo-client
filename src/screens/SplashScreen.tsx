import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { tokens } from '../theme/tokens';

const bootSteps = ['보안 세션 확인', '포트폴리오 복원', '피드 상태 동기화'] as const;

export function SplashScreen() {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View
        style={[
          styles.shell,
          {
            paddingTop: Math.max(insets.top + 24, 40),
            paddingBottom: Math.max(insets.bottom + 28, 36),
          },
        ]}
      >
        <View style={styles.glowTop} />
        <View style={styles.glowBottom} />

        <View style={styles.brandBlock}>
          <View style={styles.brandMark}>
            <Text style={styles.brandMarkText}>Fo</Text>
          </View>
          <Text style={styles.brandName}>FOLO</Text>
          <Text style={styles.tagline}>투자 기록과 관계를 가장 빠르게 이어주는 앱</Text>
        </View>

        <View style={styles.centerCopy}>
          <Text style={styles.title}>마지막 투자 흐름을 불러오는 중</Text>
          <Text style={styles.subtitle}>
            보안 세션을 확인하고, 포트폴리오와 친구 피드를 안전하게 이어서 준비합니다.
          </Text>
        </View>

        <View style={styles.stepList}>
          {bootSteps.map((step) => (
            <View key={step} style={styles.stepRow}>
              <View style={styles.stepDot} />
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>

        <View style={styles.loadingRow}>
          <ActivityIndicator color={tokens.colors.surface} size="small" />
          <Text style={styles.loadingLabel}>앱 진입 준비 중</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: tokens.colors.navy,
  },
  shell: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  glowTop: {
    position: 'absolute',
    top: 40,
    right: -20,
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: 'rgba(96, 165, 250, 0.20)',
  },
  glowBottom: {
    position: 'absolute',
    bottom: 60,
    left: -40,
    width: 200,
    height: 200,
    borderRadius: 999,
    backgroundColor: 'rgba(45, 212, 191, 0.18)',
  },
  brandBlock: {
    gap: 10,
  },
  brandMark: {
    width: 78,
    height: 78,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  brandMarkText: {
    color: tokens.colors.surface,
    fontSize: 32,
    fontFamily: tokens.typography.heading,
    fontWeight: '800',
  },
  brandName: {
    color: tokens.colors.surface,
    fontSize: 34,
    fontFamily: tokens.typography.heading,
    fontWeight: '800',
  },
  tagline: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 14,
    lineHeight: 22,
    fontFamily: tokens.typography.body,
  },
  centerCopy: {
    gap: 14,
  },
  title: {
    color: tokens.colors.surface,
    fontSize: 32,
    lineHeight: 38,
    fontFamily: tokens.typography.heading,
    fontWeight: '800',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 15,
    lineHeight: 24,
    fontFamily: tokens.typography.body,
  },
  stepList: {
    gap: 12,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stepDot: {
    width: 9,
    height: 9,
    borderRadius: 999,
    backgroundColor: '#7DD3FC',
  },
  stepText: {
    color: tokens.colors.surface,
    fontSize: 14,
    fontFamily: tokens.typography.heading,
    fontWeight: '700',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  loadingLabel: {
    color: 'rgba(255,255,255,0.84)',
    fontSize: 14,
    fontFamily: tokens.typography.body,
  },
});
