import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { tokens } from '../theme/tokens';

const bootSteps = [
  '세션 상태 확인',
  '리프레시 토큰 검증',
  '앱 환경 초기화',
] as const;

export function SplashScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.shell}>
        <View style={styles.glowTop} />
        <View style={styles.glowBottom} />

        <View style={styles.heroCard}>
          <View style={styles.brandMark}>
            <Text style={styles.brandMarkText}>Fo</Text>
          </View>
          <Text style={styles.eyebrow}>Folo Secure Boot</Text>
          <Text style={styles.title}>투자 기록과 관계를 불러오는 중</Text>
          <Text style={styles.subtitle}>
            로그인 상태를 확인하고, 마지막 세션이 있으면 안전하게 메인 앱으로 복원합니다.
          </Text>

          <View style={styles.stepList}>
            {bootSteps.map((step) => (
              <View key={step} style={styles.stepRow}>
                <View style={styles.stepDot} />
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.loadingRow}>
          <ActivityIndicator color={tokens.colors.brandStrong} size="small" />
          <Text style={styles.loadingLabel}>Folo 앱 진입 준비 중</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: tokens.colors.canvas,
  },
  shell: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 24,
  },
  glowTop: {
    position: 'absolute',
    top: 70,
    right: -30,
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: 'rgba(37, 99, 235, 0.13)',
  },
  glowBottom: {
    position: 'absolute',
    bottom: 90,
    left: -50,
    width: 180,
    height: 180,
    borderRadius: 999,
    backgroundColor: 'rgba(15, 118, 110, 0.11)',
  },
  heroCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 34,
    backgroundColor: tokens.colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(214, 224, 234, 0.76)',
    padding: 28,
    gap: 18,
    ...tokens.shadow,
  },
  brandMark: {
    width: 78,
    height: 78,
    borderRadius: 26,
    backgroundColor: tokens.colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandMarkText: {
    color: tokens.colors.surface,
    fontSize: 32,
    fontFamily: tokens.typography.heading,
    fontWeight: '800',
  },
  eyebrow: {
    fontSize: 12,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: tokens.colors.brandStrong,
    fontFamily: tokens.typography.heading,
    fontWeight: '700',
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
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
  stepList: {
    gap: 12,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: tokens.colors.brand,
  },
  stepText: {
    color: tokens.colors.navy,
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
    color: tokens.colors.inkSoft,
    fontSize: 14,
    fontFamily: tokens.typography.body,
  },
});
