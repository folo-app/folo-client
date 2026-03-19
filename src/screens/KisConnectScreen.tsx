import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';

import { Page, PrimaryButton, SectionHeading, SurfaceCard } from '../components/ui';
import type { RootStackParamList } from '../navigation/types';
import { tokens } from '../theme/tokens';

export function KisConnectScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <Page
      eyebrow="KIS"
      title="한국투자 연결"
      subtitle="유저가 키를 직접 입력하는 방식은 접고, OAuth 기반 연결을 준비하는 구조로 전환합니다."
    >
      <SurfaceCard tone="hero">
        <SectionHeading
          title="준비 중"
          description="실서비스에서는 앱키/시크릿 직접 입력 대신, 한국투자 인증 화면으로 이동하는 연결 흐름을 제공합니다."
        />
        <Text style={styles.bodyText}>
          백엔드는 KIS OAuth 연결용 엔드포인트 설계 초안을 준비했고, 프론트는 연결 시작 버튼이 들어갈 자리를 먼저 정리했습니다.
        </Text>
        <PrimaryButton
          label="CSV/OCR로 먼저 시작"
          onPress={() => navigation.navigate('ImportOnboarding')}
        />
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeading
          title="예정된 연결 흐름"
          description="유저 입력 대신 OAuth 기반 브로커 연결로 전환합니다."
        />
        <View style={styles.bulletList}>
          <Text style={styles.bullet}>1. 앱에서 `한국투자 연결하기` 클릭</Text>
          <Text style={styles.bullet}>2. 백엔드가 KIS 인증 URL 발급</Text>
          <Text style={styles.bullet}>3. 인증 완료 후 callback으로 계정 연결</Text>
          <Text style={styles.bullet}>4. 연결된 계좌 기준으로 포트폴리오 sync 실행</Text>
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeading
          title="대안"
          description="OAuth 전환 전까지는 CSV/OCR 가져오기를 메인 온보딩으로 사용합니다."
        />
        <View style={styles.actionStack}>
          <PrimaryButton
            label="포트폴리오 시작하기"
            onPress={() => navigation.navigate('ImportOnboarding')}
            variant="secondary"
          />
          <PrimaryButton
            label="수동 거래 입력"
            onPress={() => navigation.navigate('MainTabs', { screen: 'AddTrade' })}
            variant="secondary"
          />
        </View>
      </SurfaceCard>
    </Page>
  );
}

const styles = StyleSheet.create({
  actionStack: {
    gap: 10,
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 22,
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.body,
  },
  bulletList: {
    gap: 8,
  },
  bullet: {
    fontSize: 14,
    lineHeight: 22,
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.body,
  },
});
