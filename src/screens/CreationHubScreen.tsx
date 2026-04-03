import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  Page,
  PageBackButton,
  PrimaryButton,
  SectionHeading,
  SurfaceCard,
} from '../components/ui';
import type { RootStackParamList } from '../navigation/types';
import { tokens } from '../theme/tokens';

const quickCreateActions = [
  {
    key: 'reminder',
    title: '루틴 등록',
    description: '반복 투자 일정을 만들고 다음 체크포인트를 위젯까지 바로 연결합니다.',
    icon: 'repeat-outline' as const,
    tone: 'hero' as const,
    route: 'ReminderCreate' as const,
    eyebrow: 'First-class',
  },
  {
    key: 'trade',
    title: '거래 추가',
    description: '직접 거래를 기록하고 거래일, 메모, 공개 범위까지 한 번에 남깁니다.',
    icon: 'add-circle-outline' as const,
    tone: 'default' as const,
    route: 'AddTrade' as const,
    eyebrow: 'Record',
  },
  {
    key: 'import',
    title: 'CSV / OCR 가져오기',
    description: '기존 기록을 한 번에 불러와 포트폴리오와 위젯 상태를 빠르게 채웁니다.',
    icon: 'cloud-upload-outline' as const,
    tone: 'default' as const,
    route: 'ImportOnboarding' as const,
    eyebrow: 'Import',
  },
  {
    key: 'kis',
    title: 'KIS 연결',
    description: '증권 계좌를 연결해 보유 자산과 거래 내역을 자동으로 동기화합니다.',
    icon: 'link-outline' as const,
    tone: 'default' as const,
    route: 'KisConnect' as const,
    eyebrow: 'Sync',
  },
];

export function CreationHubScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const primaryAction = quickCreateActions[0];
  const secondaryActions = quickCreateActions.slice(1);

  return (
    <Page
      eyebrow="Create"
      title="새 기록과 루틴 추가"
      subtitle="거래, 루틴, 가져오기, 계좌 연결을 한 곳에서 시작합니다."
      leading={<PageBackButton />}
    >
      <SurfaceCard tone="hero">
        <SectionHeading
          title={primaryAction.title}
          description="이번 리팩터에서 가장 먼저 올린 생성 액션입니다."
        />
        <View style={styles.heroRow}>
          <View style={styles.heroIconWrap}>
            <Ionicons color={tokens.colors.brandStrong} name={primaryAction.icon} size={22} />
          </View>
          <View style={styles.heroText}>
            <Text style={styles.heroEyebrow}>{primaryAction.eyebrow}</Text>
            <Text style={styles.heroTitle}>{primaryAction.title}</Text>
            <Text style={styles.heroDescription}>{primaryAction.description}</Text>
          </View>
        </View>
        <PrimaryButton
          label="루틴 만들기"
          onPress={() => navigation.navigate(primaryAction.route)}
        />
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeading
          title="다른 시작점"
          description="직접 입력과 가져오기 흐름을 같은 규칙으로 정리했습니다."
        />
        <View style={styles.actionStack}>
          {secondaryActions.map((action) => (
            <Pressable
              key={action.key}
              accessibilityRole="button"
              onPress={() => navigation.navigate(action.route)}
              style={({ pressed }) => [styles.actionCard, pressed && styles.actionCardPressed]}
            >
              <View style={styles.actionCardLeading}>
                <View style={styles.actionIconWrap}>
                  <Ionicons color={tokens.colors.navy} name={action.icon} size={18} />
                </View>
                <View style={styles.actionCopy}>
                  <Text style={styles.actionEyebrow}>{action.eyebrow}</Text>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                  <Text style={styles.actionDescription}>{action.description}</Text>
                </View>
              </View>
              <Ionicons color={tokens.colors.inkMute} name="chevron-forward" size={16} />
            </Pressable>
          ))}
        </View>
      </SurfaceCard>
    </Page>
  );
}

const styles = StyleSheet.create({
  heroRow: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'flex-start',
  },
  heroIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.74)',
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.12)',
  },
  heroText: {
    flex: 1,
    gap: 4,
  },
  heroEyebrow: {
    fontSize: 12,
    letterSpacing: 0.6,
    color: tokens.colors.brandStrong,
    fontFamily: tokens.typography.heading,
    fontWeight: '700',
    textTransform: 'uppercase',
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
  actionStack: {
    gap: 12,
  },
  actionCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(214, 224, 234, 0.88)',
    backgroundColor: 'rgba(255,255,255,0.86)',
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
  },
  actionCardPressed: {
    opacity: 0.88,
  },
  actionCardLeading: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    flex: 1,
  },
  actionIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.colors.surfaceMuted,
  },
  actionCopy: {
    flex: 1,
    gap: 3,
  },
  actionEyebrow: {
    fontSize: 11,
    letterSpacing: 0.5,
    color: tokens.colors.inkMute,
    fontFamily: tokens.typography.heading,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  actionTitle: {
    fontSize: 16,
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontWeight: '700',
  },
  actionDescription: {
    fontSize: 13,
    lineHeight: 20,
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.body,
  },
});
