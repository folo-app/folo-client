import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import type {
  KisConnectionPhase,
  KisConnectionStatusResponse,
} from '../api/contracts';
import { foloApi } from '../api/services';
import { Chip, Page, PrimaryButton, SectionHeading, SurfaceCard } from '../components/ui';
import { useMutation, useQuery } from '../hooks/query';
import { formatDateLabel } from '../lib/format';
import type { RootStackParamList } from '../navigation/types';
import { tokens } from '../theme/tokens';

const emptyStatus: KisConnectionStatusResponse = {
  connected: false,
  phase: 'PREPARING',
  oauthEnabled: false,
  clientConfigured: false,
  connectionAvailable: false,
  lastSyncedAt: null,
  connectedAt: null,
  connectedAccount: null,
  nextStep: '',
};

function phaseLabel(phase: KisConnectionPhase) {
  switch (phase) {
    case 'CONNECTED':
      return '연결 완료';
    case 'READY':
      return '연결 준비 완료';
    case 'CONFIG_MISSING':
      return '서버 설정 필요';
    case 'PREPARING':
      return '준비 중';
  }
}

function parseDeepLinkMessage(url: string) {
  if (!url.startsWith('folo://kis/callback')) {
    return null;
  }

  const queryString = url.split('?')[1] ?? '';
  const params = new URLSearchParams(queryString);
  const status = params.get('status');
  const message = params.get('message');

  if (!message) {
    return null;
  }

  return {
    status,
    message,
  };
}

export function KisConnectScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [deepLinkMessage, setDeepLinkMessage] = useState<string | null>(null);

  const status = useQuery({
    queryFn: () => foloApi.getKisConnectionStatus(),
    initialData: emptyStatus,
  });
  const startMutation = useMutation({
    mutationFn: async (variables: { customerName: string; phoneNumber: string }) =>
      foloApi.startKisConnection(variables),
  });
  const disconnectMutation = useMutation({
    mutationFn: async () => foloApi.disconnectKisConnection(),
  });
  const syncMutation = useMutation({
    mutationFn: async () => foloApi.syncPortfolio(),
  });

  useEffect(() => {
    let alive = true;

    Linking.getInitialURL().then((url) => {
      if (!alive || !url) {
        return;
      }
      const parsed = parseDeepLinkMessage(url);
      if (parsed?.message) {
        setDeepLinkMessage(parsed.message);
        status.refresh();
      }
    });

    const subscription = Linking.addEventListener('url', ({ url }) => {
      const parsed = parseDeepLinkMessage(url);
      if (parsed?.message) {
        setDeepLinkMessage(parsed.message);
        status.refresh();
      }
    });

    return () => {
      alive = false;
      subscription.remove();
    };
  }, [status]);

  async function handleStart() {
    setMessage(null);

    try {
      const result = await startMutation.mutate({
        customerName: customerName.trim(),
        phoneNumber: phoneNumber.trim(),
      });

      setMessage(result.nextStep);
      if (result.launchUrl) {
        await Linking.openURL(result.launchUrl);
      }
    } catch {}
  }

  async function handleDisconnect() {
    try {
      await disconnectMutation.mutate(undefined);
      setDeepLinkMessage('KIS 연결을 해제했습니다.');
      status.refresh();
    } catch {}
  }

  async function handleSync() {
    try {
      const result = await syncMutation.mutate(undefined);
      setDeepLinkMessage(
        `동기화 완료: 보유 ${result.syncedHoldings}개, 거래 ${result.syncedTrades}건`,
      );
      status.refresh();
    } catch {}
  }

  return (
    <Page
      eyebrow="KIS"
      title="한국투자 연결"
      subtitle="서비스 공용 OAuth로 연결하고, 성공 시 앱으로 돌아와 계좌 상태와 동기화 액션을 이어서 보여줍니다."
    >
      <SurfaceCard tone="hero">
        <SectionHeading
          title="현재 연결 상태"
          description="직접 키를 받지 않고, 사용자 실명과 휴대폰번호로 KIS 인증을 시작합니다."
        />

        {status.loading ? (
          <View style={styles.loaderRow}>
            <ActivityIndicator color={tokens.colors.brandStrong} size="small" />
            <Text style={styles.helperText}>KIS 연결 상태를 불러오는 중</Text>
          </View>
        ) : (
          <>
            <View style={styles.phaseRow}>
              <Chip
                active
                label={phaseLabel(status.data.phase)}
                tone={status.data.connected ? 'positive' : 'brand'}
              />
              <Chip label={status.data.oauthEnabled ? 'OAuth 사용' : 'OAuth 비활성'} />
              <Chip
                label={status.data.clientConfigured ? '서버 설정 완료' : '서버 설정 없음'}
              />
            </View>
            <Text style={styles.bodyText}>{status.data.nextStep}</Text>
            {status.data.connectedAt ? (
              <View style={styles.metaList}>
                <Text style={styles.metaText}>
                  연결 시각 {formatDateLabel(status.data.connectedAt)}
                </Text>
                <Text style={styles.metaText}>
                  연결 계좌 {status.data.connectedAccount ?? '-'}
                </Text>
              </View>
            ) : null}
          </>
        )}
      </SurfaceCard>

      {status.data.connected ? (
        <SurfaceCard>
          <SectionHeading
            title="연결 완료 후 액션"
            description="KIS 연결이 끝났다면 바로 포트폴리오 동기화와 연결 해제를 처리할 수 있습니다."
          />
          <View style={styles.actionStack}>
            <PrimaryButton
              label={syncMutation.pending ? '동기화 중...' : '포트폴리오 동기화'}
              onPress={handleSync}
              disabled={syncMutation.pending}
            />
            <PrimaryButton
              label={disconnectMutation.pending ? '해제 중...' : 'KIS 연결 해제'}
              onPress={handleDisconnect}
              disabled={disconnectMutation.pending}
              variant="secondary"
            />
          </View>
        </SurfaceCard>
      ) : (
        <SurfaceCard>
          <SectionHeading
            title="OAuth 시작 정보"
            description="KIS authorizeP가 요구하는 실명과 휴대폰번호를 입력한 뒤 브라우저 인증으로 이동합니다."
          />
          <TextInput
            autoCapitalize="words"
            onChangeText={setCustomerName}
            placeholder="실명"
            placeholderTextColor={tokens.colors.inkMute}
            style={styles.input}
            value={customerName}
          />
          <TextInput
            keyboardType="phone-pad"
            onChangeText={setPhoneNumber}
            placeholder="휴대폰번호 (01012345678)"
            placeholderTextColor={tokens.colors.inkMute}
            style={styles.input}
            value={phoneNumber}
          />
          <View style={styles.actionStack}>
            <PrimaryButton
              disabled={!status.data.connectionAvailable || startMutation.pending}
              label={
                startMutation.pending
                  ? '브라우저 인증 준비 중...'
                  : status.data.connectionAvailable
                    ? 'KIS 인증 시작'
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
        </SurfaceCard>
      )}

      <SurfaceCard>
        <SectionHeading
          title="대안 경로"
          description="초기 유저는 수동 포트폴리오 추가가 메인이고, CSV/OCR는 하단 보조 옵션으로 둡니다."
        />
        <View style={styles.actionStack}>
          <PrimaryButton
            label="포트폴리오 직접 추가"
            onPress={() => navigation.navigate('PortfolioSetup')}
            variant="secondary"
          />
          <PrimaryButton
            label="CSV / OCR 가져오기"
            onPress={() => navigation.navigate('ImportOnboarding')}
            variant="secondary"
          />
        </View>
      </SurfaceCard>

      {deepLinkMessage ? <Text style={styles.message}>{deepLinkMessage}</Text> : null}
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {status.error ? <Text style={styles.message}>{status.error}</Text> : null}
      {startMutation.error ? <Text style={styles.message}>{startMutation.error}</Text> : null}
      {disconnectMutation.error ? (
        <Text style={styles.message}>{disconnectMutation.error}</Text>
      ) : null}
      {syncMutation.error ? <Text style={styles.message}>{syncMutation.error}</Text> : null}
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
  helperText: {
    fontSize: 13,
    color: tokens.colors.brandStrong,
    fontFamily: tokens.typography.body,
  },
  input: {
    minHeight: 58,
    backgroundColor: 'rgba(255,255,255,0.84)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(214, 224, 234, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    lineHeight: 22,
    color: tokens.colors.navy,
    fontFamily: tokens.typography.body,
  },
  loaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  message: {
    fontSize: 13,
    lineHeight: 22,
    color: tokens.colors.brandStrong,
    fontFamily: tokens.typography.body,
  },
  metaList: {
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: tokens.colors.inkMute,
    fontFamily: tokens.typography.body,
  },
  phaseRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
});
