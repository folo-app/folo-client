import { ActivityIndicator, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { FoloLogoMark } from '../components/FoloLogoMark';
import { tokens } from '../theme/tokens';

const bootSteps = ['보안 세션 확인', '포트폴리오 복원', '피드 상태 동기화'] as const;

export function SplashScreen() {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const compact = height < 700;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View
        style={[
          styles.shell,
          compact && styles.shellCompact,
          {
            paddingTop: Math.max(insets.top + (compact ? 16 : 24), compact ? 28 : 40),
            paddingBottom: Math.max(insets.bottom + (compact ? 20 : 28), compact ? 28 : 36),
          },
        ]}
      >
        <View style={styles.glowTop} />
        <View style={styles.glowBottom} />

        <View style={[styles.brandBlock, compact && styles.brandBlockCompact]}>
          <FoloLogoMark size={compact ? 68 : 78} />
          <Text style={[styles.brandName, compact && styles.brandNameCompact]}>FOLO</Text>
          <Text style={[styles.tagline, compact && styles.taglineCompact]}>
            밝고 빠른 투자 기록 흐름을 준비합니다
          </Text>
        </View>

        <View style={[styles.centerCopy, compact && styles.centerCopyCompact]}>
          <Text style={[styles.title, compact && styles.titleCompact]}>
            마지막 투자 흐름을 불러오는 중
          </Text>
          <Text style={[styles.subtitle, compact && styles.subtitleCompact]}>
            보안 세션을 확인하고, 포트폴리오와 친구 피드를 밝은 캔버스 위에 이어서 준비합니다.
          </Text>
        </View>

        <View style={[styles.stepPanel, compact && styles.stepPanelCompact]}>
          {bootSteps.map((step) => (
            <View key={step} style={styles.stepRow}>
              <View style={styles.stepDot} />
              <Text style={[styles.stepText, compact && styles.stepTextCompact]}>{step}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.loadingRow, compact && styles.loadingRowCompact]}>
          <ActivityIndicator color={tokens.colors.brandStrong} size="small" />
          <Text style={[styles.loadingLabel, compact && styles.loadingLabelCompact]}>
            앱 진입 준비 중
          </Text>
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
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  shellCompact: {
    paddingHorizontal: 20,
  },
  glowTop: {
    position: 'absolute',
    top: 10,
    right: -10,
    width: 240,
    height: 240,
    borderRadius: 999,
    backgroundColor: 'rgba(37, 99, 235, 0.14)',
  },
  glowBottom: {
    position: 'absolute',
    bottom: 40,
    left: -40,
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: 'rgba(15, 118, 110, 0.12)',
  },
  brandBlock: {
    gap: 10,
    alignItems: 'flex-start',
  },
  brandBlockCompact: {
    gap: 8,
  },
  brandName: {
    color: tokens.colors.navy,
    fontSize: 34,
    fontFamily: tokens.typography.heading,
    fontWeight: '800',
  },
  brandNameCompact: {
    fontSize: 30,
  },
  tagline: {
    color: tokens.colors.inkSoft,
    fontSize: 14,
    lineHeight: 22,
    fontFamily: tokens.typography.body,
  },
  taglineCompact: {
    fontSize: 13,
    lineHeight: 20,
  },
  centerCopy: {
    gap: 14,
  },
  centerCopyCompact: {
    gap: 10,
  },
  title: {
    color: tokens.colors.navy,
    fontSize: 32,
    lineHeight: 38,
    fontFamily: tokens.typography.heading,
    fontWeight: '800',
  },
  titleCompact: {
    fontSize: 28,
    lineHeight: 34,
  },
  subtitle: {
    color: tokens.colors.inkSoft,
    fontSize: 15,
    lineHeight: 24,
    fontFamily: tokens.typography.body,
  },
  subtitleCompact: {
    fontSize: 14,
    lineHeight: 22,
  },
  stepPanel: {
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(214, 224, 234, 0.9)',
    paddingHorizontal: 18,
    paddingVertical: 18,
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  stepPanelCompact: {
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 16,
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
    backgroundColor: tokens.colors.brand,
  },
  stepText: {
    color: tokens.colors.navy,
    fontSize: 14,
    fontFamily: tokens.typography.heading,
    fontWeight: '700',
  },
  stepTextCompact: {
    fontSize: 13,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    alignSelf: 'flex-start',
    backgroundColor: tokens.colors.surfaceMuted,
    borderRadius: tokens.radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(214, 224, 234, 0.86)',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  loadingRowCompact: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  loadingLabel: {
    color: tokens.colors.navy,
    fontSize: 14,
    fontFamily: tokens.typography.body,
  },
  loadingLabelCompact: {
    fontSize: 13,
  },
});
