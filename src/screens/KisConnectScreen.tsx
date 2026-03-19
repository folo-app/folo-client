import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import type {
  KisConnectionStartResponse,
  KisConnectionStatusResponse,
} from '../api/contracts';
import { foloApi } from '../api/services';
import { Chip, Page, PrimaryButton, SectionHeading, SurfaceCard } from '../components/ui';
import type { RootStackParamList } from '../navigation/types';
import { tokens } from '../theme/tokens';

function phaseLabel(phase: KisConnectionStatusResponse['phase']) {
  switch (phase) {
    case 'READY':
      return '연결 준비 완료';
    case 'CONFIG_MISSING':
      return '서버 설정 필요';
    case 'PREPARING':
      return '준비 중';
  }
}

export function KisConnectScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [status, setStatus] = useState<KisConnectionStatusResponse | null>(null);
  const [startResult, setStartResult] = useState<KisConnectionStartResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function loadStatus() {
      setLoading(true);
      setMessage(null);

      try {
        const result = await foloApi.getKisConnectionStatus();
        if (alive) {
          setStatus(result);
        }
      } catch (error) {
        if (alive) {
          setMessage(
            error instanceof Error
              ? error.message
              : 'KIS 연결 상태를 불러오지 못했습니다.',
          );
        }
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    }

    loadStatus();

    return () => {
      alive = false;
    };
  }, []);

  async function handleStart() {
    setStarting(true);
    setMessage(null);

    try {
      const result = await foloApi.startKisConnection();
      setStartResult(result);
      setMessage(result.nextStep);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'KIS 연결 시작 요청에 실패했습니다.',
      );
    } finally {
      setStarting(false);
    }
  }

  return (
    <Page
      eyebrow="KIS"
      title="한국투자 연결"
      subtitle="직접 키를 입력받는 UX는 제거했고, 서비스 공용 OAuth 연결 준비 상태를 실제 백엔드 응답으로 보여줍니다."
    >
      <SurfaceCard tone="hero">
        <SectionHeading
          title="현재 연결 상태"
          description="초기 포트폴리오 구성은 직접 추가가 메인이고, KIS 연결은 이후 자동 동기화 수단으로 붙입니다."
        />

        {loading ? (
          <View style={styles.loaderRow}>
            <ActivityIndicator color={tokens.colors.brandStrong} size="small" />
            <Text style={styles.helperText}>KIS 연결 상태를 불러오는 중</Text>
          </View>
        ) : status ? (
          <>
            <View style={styles.phaseRow}>
              <Chip
                active
                label={phaseLabel(status.phase)}
                tone={status.connectionAvailable ? 'positive' : 'brand'}
              />
              <Chip label={status.oauthEnabled ? 'OAuth 사용' : 'OAuth 비활성'} />
              <Chip
                label={status.clientConfigured ? '서버 설정 완료' : '서버 설정 없음'}
              />
            </View>
            <Text style={styles.bodyText}>{status.nextStep}</Text>
            <View style={styles.actionStack}>
              <PrimaryButton
                disabled={!status.connectionAvailable || starting}
                label={
                  starting
                    ? '연결 시작 준비 중...'
                    : status.connectionAvailable
                      ? 'OAuth 시작 skeleton 호출'
                      : '아직 연결 시작 불가'
                }
                onPress={handleStart}
              />
              <PrimaryButton
                label="직접 포트폴리오 추가"
                onPress={() => navigation.navigate('PortfolioSetup')}
                variant="secondary"
              />
            </View>
          </>
        ) : null}
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeading
          title="현재 제품 방향"
          description="초기 유저는 메인 진입 전에 직접 포트폴리오를 만들고, CSV/OCR는 하단 보조 옵션으로 둡니다."
        />
        <View style={styles.bulletList}>
          <Text style={styles.bullet}>1. 로그인 직후 포트폴리오가 비어 있으면 직접 추가 화면으로 이동</Text>
          <Text style={styles.bullet}>2. CSV/OCR는 수동 입력이 번거로운 경우에만 보조적으로 사용</Text>
          <Text style={styles.bullet}>3. KIS OAuth는 서비스 공용 제휴 키와 redirect 기반으로 자동화</Text>
        </View>
      </SurfaceCard>

      {startResult ? (
        <SurfaceCard>
          <SectionHeading
            title="OAuth 시작 skeleton 응답"
            description="프론트에서 실제 연결 버튼을 누르면 백엔드가 어떤 값을 돌려주는지 확인할 수 있습니다."
          />
          <Text style={styles.bodyText}>
            {startResult.authorizationMethod ?? '-'} {startResult.authorizationUrl ?? '-'}
          </Text>
          <Text style={styles.helperText}>
            request fields {Object.keys(startResult.requestFields ?? {}).length}개 · state{' '}
            {startResult.state ?? '-'}
          </Text>
        </SurfaceCard>
      ) : null}

      <SurfaceCard>
        <SectionHeading
          title="대안 경로"
          description="자동 연결이 준비되기 전에도 직접 추가와 파일 가져오기로 앱을 바로 사용할 수 있습니다."
        />
        <View style={styles.actionStack}>
          <PrimaryButton
            label="CSV / OCR 가져오기"
            onPress={() => navigation.navigate('ImportOnboarding')}
            variant="secondary"
          />
          <PrimaryButton
            label="포트폴리오 직접 추가"
            onPress={() => navigation.navigate('PortfolioSetup')}
            variant="secondary"
          />
        </View>
      </SurfaceCard>

      {message ? <Text style={styles.message}>{message}</Text> : null}
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
  helperText: {
    fontSize: 13,
    color: tokens.colors.brandStrong,
    fontFamily: tokens.typography.body,
  },
  loaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  phaseRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  message: {
    fontSize: 13,
    lineHeight: 22,
    color: tokens.colors.brandStrong,
    fontFamily: tokens.typography.body,
  },
});
