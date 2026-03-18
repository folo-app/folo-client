import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';

import { MetricBadge, Page, PrimaryButton, SurfaceCard } from '../components/ui';
import { onboardingHighlights } from '../data/mock';
import type { RootStackParamList } from '../navigation/types';
import { tokens } from '../theme/tokens';

export function OnboardingScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <Page
      eyebrow="Folo v0.2"
      title="친구와 함께 만드는 장기투자 루틴"
      subtitle="기획서의 핵심 구조를 바탕으로 홈, 피드, 거래 추가, 포트폴리오, 프로필까지 바로 검토할 수 있는 프론트엔드 틀을 준비했습니다."
    >
      <SurfaceCard tone="hero">
        <View style={styles.heroHeader}>
          <View style={styles.brandMark}>
            <Text style={styles.brandMarkText}>Fo</Text>
          </View>
          <View style={styles.heroCopy}>
            <Text style={styles.heroTitle}>투자판 GitHub, 그러나 더 따뜻하게</Text>
            <Text style={styles.heroDescription}>
              토스식 숫자 가독성, Xangle식 정보 정리, Matrix식 루틴 관리 감각을 하나의 경험으로 묶었습니다.
            </Text>
          </View>
        </View>
        <View style={styles.metricRow}>
          <MetricBadge label="메인 탭" value="5개" tone="brand" />
          <MetricBadge label="핵심 흐름" value="계약 연동 + 상세 화면" tone="positive" />
        </View>
        <View style={styles.buttonRow}>
          <PrimaryButton label="앱 둘러보기" onPress={() => navigation.replace('MainTabs')} />
          <PrimaryButton
            label="포트폴리오 먼저 보기"
            onPress={() => navigation.replace('MainTabs', { screen: 'Portfolio' })}
            variant="secondary"
          />
        </View>
      </SurfaceCard>

      {onboardingHighlights.map((item) => (
        <SurfaceCard key={item.title}>
          <Text style={styles.cardEyebrow}>{item.eyebrow}</Text>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardDescription}>{item.description}</Text>
        </SurfaceCard>
      ))}
    </Page>
  );
}

const styles = StyleSheet.create({
  heroHeader: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  brandMark: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: tokens.colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandMarkText: {
    color: tokens.colors.surface,
    fontSize: 28,
    fontFamily: tokens.typography.heading,
    fontWeight: '800',
  },
  heroCopy: {
    flex: 1,
    gap: 8,
  },
  heroTitle: {
    fontSize: 24,
    lineHeight: 30,
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontWeight: '800',
  },
  heroDescription: {
    fontSize: 14,
    lineHeight: 22,
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.body,
  },
  metricRow: {
    flexDirection: 'row',
    gap: 12,
  },
  buttonRow: {
    gap: 10,
  },
  cardEyebrow: {
    fontSize: 12,
    color: tokens.colors.brandStrong,
    fontFamily: tokens.typography.heading,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  cardTitle: {
    fontSize: 20,
    lineHeight: 26,
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontWeight: '800',
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 22,
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.body,
  },
});
