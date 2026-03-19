import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';

import { Chip, Page, PrimaryButton, SectionHeading, SurfaceCard } from '../components/ui';
import type { RootStackParamList } from '../navigation/types';
import { tokens } from '../theme/tokens';

export function ImportOnboardingScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <Page
      eyebrow="Import"
      title="포트폴리오 시작하기"
      subtitle="초기 세팅은 CSV/OCR 가져오기를 중심으로 안내하고, 수동 입력은 개별 거래 보정용으로 둡니다."
    >
      <SurfaceCard tone="hero">
        <SectionHeading
          title="권장 순서"
          description="실제 앱의 첫 경험은 대량 가져오기와 계좌 스냅샷 복원에 맞춥니다."
        />
        <View style={styles.stepList}>
          <View style={styles.stepRow}>
            <Chip active label="1" tone="brand" />
            <View style={styles.stepText}>
              <Text style={styles.stepTitle}>CSV로 거래 내역 불러오기</Text>
              <Text style={styles.stepDescription}>
                증권사 내역을 한 번에 가져와 초기 포트폴리오를 채우는 메인 경로입니다.
              </Text>
            </View>
            <Chip label="준비 중" />
          </View>
          <View style={styles.stepRow}>
            <Chip active label="2" tone="brand" />
            <View style={styles.stepText}>
              <Text style={styles.stepTitle}>OCR로 보유 화면 스캔</Text>
              <Text style={styles.stepDescription}>
                모바일 스크린샷이나 캡처 이미지를 인식해 빠르게 초안을 만듭니다.
              </Text>
            </View>
            <Chip label="준비 중" />
          </View>
          <View style={styles.stepRow}>
            <Chip active label="3" tone="brand" />
            <View style={styles.stepText}>
              <Text style={styles.stepTitle}>수동으로 거래 한 건 추가</Text>
              <Text style={styles.stepDescription}>
                가져오기 이후 누락 거래 보정이나 메모 작성은 수동 입력이 더 적합합니다.
              </Text>
            </View>
            <Chip label="사용 가능" tone="positive" />
          </View>
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeading
          title="현재 상태"
          description="백엔드는 CSV/OCR endpoint를 이미 갖고 있고, 프론트 업로드 UI는 다음 단계에서 붙입니다."
        />
        <Text style={styles.bodyText}>
          지금은 수동 입력 화면을 계속 사용할 수 있고, CSV/OCR 업로드 화면은 준비중 구조로 우선 배치했습니다.
        </Text>
        <View style={styles.actionStack}>
          <PrimaryButton
            label="수동 거래 입력"
            onPress={() => navigation.navigate('MainTabs', { screen: 'AddTrade' })}
          />
          <PrimaryButton
            label="KIS 연결 준비 상태 보기"
            onPress={() => navigation.navigate('KisConnect')}
            variant="secondary"
          />
        </View>
      </SurfaceCard>
    </Page>
  );
}

const styles = StyleSheet.create({
  stepList: {
    gap: 14,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  stepText: {
    flex: 1,
    gap: 4,
  },
  stepTitle: {
    fontSize: 15,
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontWeight: '700',
  },
  stepDescription: {
    fontSize: 13,
    lineHeight: 20,
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.body,
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 22,
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.body,
  },
  actionStack: {
    gap: 10,
  },
});
