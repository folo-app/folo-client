import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import type { PortfolioSyncResponse } from '../api/contracts';
import { foloApi } from '../api/services';
import { DataStatusCard } from '../components/DataStatusCard';
import { Page, PrimaryButton, SectionHeading, SurfaceCard } from '../components/ui';
import { formatDateLabel } from '../lib/format';
import { tokens } from '../theme/tokens';

export function KisConnectScreen() {
  const [kisAppKey, setKisAppKey] = useState('');
  const [kisAppSecret, setKisAppSecret] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<PortfolioSyncResponse | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await foloApi.updateKisKey({
        kisAppKey: kisAppKey.trim(),
        kisAppSecret: kisAppSecret.trim(),
      });
      setSuccess('KIS 앱키를 저장했습니다.');
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'KIS 키 저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveAndSync() {
    setSyncing(true);
    setError(null);
    setSuccess(null);

    try {
      await foloApi.updateKisKey({
        kisAppKey: kisAppKey.trim(),
        kisAppSecret: kisAppSecret.trim(),
      });
      const result = await foloApi.syncPortfolio();
      setSyncResult(result);
      setSuccess('KIS 키 저장과 포트폴리오 동기화가 완료되었습니다.');
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : '동기화에 실패했습니다.');
    } finally {
      setSyncing(false);
    }
  }

  return (
    <Page
      eyebrow="KIS"
      title="한국투자 연결"
      subtitle="앱키/시크릿을 저장하고 포트폴리오 sync를 실행할 수 있습니다."
    >
      <DataStatusCard error={error} loading={saving || syncing} />
      {success ? <Text style={styles.feedback}>{success}</Text> : null}

      <SurfaceCard tone="hero">
        <SectionHeading
          title="연결 정보"
          description="백엔드는 입력한 앱키/시크릿을 저장한 뒤 `/portfolio/sync`에서 사용합니다."
        />
        <View style={styles.inputGroup}>
          <Text style={styles.fieldLabel}>KIS App Key</Text>
          <TextInput
            autoCapitalize="none"
            onChangeText={setKisAppKey}
            placeholder="앱키를 입력하세요"
            placeholderTextColor={tokens.colors.inkMute}
            style={styles.input}
            value={kisAppKey}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.fieldLabel}>KIS App Secret</Text>
          <TextInput
            autoCapitalize="none"
            onChangeText={setKisAppSecret}
            placeholder="시크릿을 입력하세요"
            placeholderTextColor={tokens.colors.inkMute}
            style={styles.input}
            secureTextEntry
            value={kisAppSecret}
          />
        </View>
        <View style={styles.actionStack}>
          <PrimaryButton
            label={saving ? '저장 중...' : '키 저장'}
            onPress={handleSave}
            variant="secondary"
            disabled={saving || syncing}
          />
          <PrimaryButton
            label={syncing ? '동기화 중...' : '저장 후 동기화'}
            onPress={handleSaveAndSync}
            disabled={saving || syncing}
          />
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeading
          title="주의"
          description="현재 백엔드는 KIS 연동 키를 저장한 뒤 sync 시점에 사용합니다."
        />
        <Text style={styles.bodyText}>
          실제 KIS live 연동이 아니라 stub 데이터 환경이면, 키 저장은 성공해도 sync 결과는 백엔드 stub 설정에 따라 달라질 수 있습니다.
        </Text>
      </SurfaceCard>

      {syncResult ? (
        <SurfaceCard>
          <SectionHeading
            title="최근 sync 결과"
            description="방금 실행한 `/portfolio/sync` 응답입니다."
          />
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>반영된 보유 종목</Text>
            <Text style={styles.statusValue}>{syncResult.syncedHoldings}개</Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>반영된 거래</Text>
            <Text style={styles.statusValue}>{syncResult.syncedTrades}건</Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>동기화 시각</Text>
            <Text style={styles.statusValue}>{formatDateLabel(syncResult.syncedAt)}</Text>
          </View>
        </SurfaceCard>
      ) : null}
    </Page>
  );
}

const styles = StyleSheet.create({
  inputGroup: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 12,
    color: tokens.colors.inkMute,
    fontFamily: tokens.typography.body,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.84)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(214, 224, 234, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: tokens.colors.navy,
    fontFamily: tokens.typography.body,
  },
  actionStack: {
    gap: 10,
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 22,
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.body,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statusLabel: {
    fontSize: 14,
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.body,
  },
  statusValue: {
    fontSize: 14,
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontWeight: '700',
  },
  feedback: {
    fontSize: 13,
    color: tokens.colors.brandStrong,
    fontFamily: tokens.typography.body,
  },
});
