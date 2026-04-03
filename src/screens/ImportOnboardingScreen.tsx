import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import type {
  CsvImportResponse,
  ImportPreviewItem,
  OcrImportResponse,
} from '../api/contracts';
import { foloApi } from '../api/services';
import { Page, PageBackButton, PrimaryButton, SectionHeading, SurfaceCard } from '../components/ui';
import { syncAllWidgetsInBackground } from '../features/widgets';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import { formatCurrency, tradeTypeLabel } from '../lib/format';
import type { RootStackParamList } from '../navigation/types';
import { tokens } from '../theme/tokens';

function toValidPreviewIds(items: ImportPreviewItem[]) {
  return items.filter((item) => item.valid && item.selected).map((item) => item.importResultId);
}

export function ImportOnboardingScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isCompact } = useResponsiveLayout();
  const [broker, setBroker] = useState('');
  const [csvPreview, setCsvPreview] = useState<CsvImportResponse | null>(null);
  const [selectedCsvIds, setSelectedCsvIds] = useState<number[]>([]);
  const [ocrPreview, setOcrPreview] = useState<OcrImportResponse | null>(null);
  const [csvUploading, setCsvUploading] = useState(false);
  const [ocrUploading, setOcrUploading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handlePickCsv() {
    setCsvUploading(true);
    setMessage(null);

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'text/comma-separated-values', 'application/vnd.ms-excel'],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.[0]) {
        return;
      }

      const asset = result.assets[0];
      const preview = await foloApi.importPortfolioCsv(
        {
          uri: asset.uri,
          name: asset.name,
          mimeType: asset.mimeType,
        },
        broker.trim() || undefined,
      );

      setCsvPreview(preview);
      setSelectedCsvIds(toValidPreviewIds(preview.preview));
      setOcrPreview(null);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : 'CSV 업로드에 실패했습니다.',
      );
    } finally {
      setCsvUploading(false);
    }
  }

  async function handlePickOcr() {
    setOcrUploading(true);
    setMessage(null);

    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        setMessage('사진 보관함 접근 권한이 필요합니다.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 1,
      });

      if (result.canceled || !result.assets?.[0]) {
        return;
      }

      const asset = result.assets[0];
      const preview = await foloApi.importPortfolioOcr({
        uri: asset.uri,
        name: asset.fileName ?? `ocr-${Date.now()}.jpg`,
        mimeType: asset.mimeType,
      });

      setOcrPreview(preview);
      setCsvPreview(null);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : 'OCR 업로드에 실패했습니다.',
      );
    } finally {
      setOcrUploading(false);
    }
  }

  async function handleConfirmImport(importResultIds: number[]) {
    if (importResultIds.length === 0) {
      setMessage('저장할 항목을 먼저 선택해 주세요.');
      return;
    }

    setConfirming(true);
    setMessage(null);

    try {
      const result = await foloApi.confirmPortfolioImport({ importResultIds });
      syncAllWidgetsInBackground();
      setMessage(`${result.savedTrades}건의 거래를 저장했습니다.`);
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs', params: { screen: 'Portfolio' } }],
      });
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : '가져온 거래 저장에 실패했습니다.',
      );
    } finally {
      setConfirming(false);
    }
  }

  function toggleCsvSelection(importResultId: number) {
    setSelectedCsvIds((current) =>
      current.includes(importResultId)
        ? current.filter((item) => item !== importResultId)
        : [...current, importResultId],
    );
  }

  return (
    <Page
      eyebrow="Import"
      title="CSV / OCR로 가져오기"
      leading={<PageBackButton />}
    >
      <SurfaceCard tone="hero">
        <SectionHeading title="직접 추가가 더 빠르다면" />
        <PrimaryButton
          label="직접 추가로 돌아가기"
          onPress={() => navigation.navigate('PortfolioSetup')}
          variant="secondary"
        />
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeading title="CSV 가져오기" description="거래 내역 파일을 불러옵니다." />
        <TextInput
          autoCapitalize="characters"
          onChangeText={setBroker}
          placeholder="브로커 코드(선택)"
          placeholderTextColor={tokens.colors.inkMute}
          style={styles.input}
          value={broker}
        />
        <PrimaryButton
          disabled={csvUploading}
          label={csvUploading ? 'CSV 업로드 중...' : 'CSV 파일 선택'}
          onPress={handlePickCsv}
        />

        {csvPreview ? (
          <View style={styles.previewBlock}>
            <Text style={styles.previewSummary}>
              파싱 성공 {csvPreview.parsedTrades}건 · 실패 {csvPreview.failedTrades}건
            </Text>
            {csvPreview.preview.map((item) => {
              const isSelected = selectedCsvIds.includes(item.importResultId);

              return (
                <Pressable
                  key={item.importResultId}
                  disabled={!item.valid}
                  onPress={() => toggleCsvSelection(item.importResultId)}
                  style={[
                    styles.previewRow,
                    isCompact && styles.previewRowCompact,
                    item.valid && isSelected && styles.previewRowSelected,
                    !item.valid && styles.previewRowInvalid,
                  ]}
                >
                  <View style={styles.previewText}>
                    <Text style={styles.previewTitle}>
                      {item.ticker ?? '미식별'} · {item.name ?? '이름 없음'}
                    </Text>
                    <Text style={styles.previewMeta}>
                      {item.tradeType ? tradeTypeLabel(item.tradeType) : '분류 없음'} ·{' '}
                      {item.quantity ?? '-'}주 ·{' '}
                      {item.price && item.market
                        ? formatCurrency(item.price, item.market)
                        : item.price ?? '-'}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.previewStatus,
                      item.valid ? styles.previewStatusValid : styles.previewStatusInvalid,
                    ]}
                  >
                    {item.valid ? (isSelected ? '선택됨' : '선택') : '오류'}
                  </Text>
                </Pressable>
              );
            })}

            <PrimaryButton
              disabled={confirming || selectedCsvIds.length === 0}
              label={confirming ? '저장 중...' : `${selectedCsvIds.length}건 저장`}
              onPress={() => handleConfirmImport(selectedCsvIds)}
            />
          </View>
        ) : null}
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeading title="OCR 가져오기" description="캡처 이미지를 불러옵니다." />
        <PrimaryButton
          disabled={ocrUploading}
          label={ocrUploading ? 'OCR 업로드 중...' : '이미지 선택'}
          onPress={handlePickOcr}
          variant="secondary"
        />

        {ocrPreview ? (
          <View style={styles.previewBlock}>
            <Text style={styles.previewSummary}>
              OCR 신뢰도 {(ocrPreview.confidence * 100).toFixed(0)}%
            </Text>

            {ocrPreview.parsed ? (
              <>
                <View style={styles.ocrCard}>
                  <Text style={styles.previewTitle}>
                    {ocrPreview.parsed.name} · {ocrPreview.parsed.ticker}
                  </Text>
                  <Text style={styles.previewMeta}>
                    {tradeTypeLabel(ocrPreview.parsed.tradeType)} ·{' '}
                    {ocrPreview.parsed.quantity}주 · {ocrPreview.parsed.price}
                  </Text>
                </View>
                <PrimaryButton
                  disabled={confirming}
                  label={confirming ? '저장 중...' : '이 거래 저장'}
                  onPress={() =>
                    handleConfirmImport([ocrPreview.parsed!.importResultId])
                  }
                />
              </>
            ) : (
              <Text style={styles.helperText}>
                파일명 또는 이미지에서 거래를 파싱하지 못했습니다.
              </Text>
            )}
          </View>
        ) : null}
      </SurfaceCard>

      {message ? <Text style={styles.message}>{message}</Text> : null}
    </Page>
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(214, 224, 234, 0.92)',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: tokens.colors.navy,
    fontFamily: tokens.typography.body,
  },
  previewBlock: {
    gap: 12,
  },
  previewSummary: {
    fontSize: 14,
    color: tokens.colors.brandStrong,
    fontFamily: tokens.typography.body,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(214, 224, 234, 0.92)',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  previewRowCompact: {
    alignItems: 'flex-start',
    flexDirection: 'column',
  },
  previewRowSelected: {
    backgroundColor: tokens.colors.brandSoft,
    borderColor: tokens.colors.brandStrong,
  },
  previewRowInvalid: {
    backgroundColor: tokens.colors.dangerSoft,
  },
  previewText: {
    flex: 1,
    gap: 6,
  },
  previewTitle: {
    fontSize: 15,
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontWeight: '700',
  },
  previewMeta: {
    fontSize: 13,
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.body,
  },
  previewStatus: {
    fontSize: 12,
    fontFamily: tokens.typography.heading,
    fontWeight: '700',
  },
  previewStatusValid: {
    color: tokens.colors.brandStrong,
  },
  previewStatusInvalid: {
    color: tokens.colors.danger,
  },
  ocrCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(214, 224, 234, 0.92)',
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 6,
  },
  helperText: {
    fontSize: 13,
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.body,
  },
  message: {
    fontSize: 13,
    lineHeight: 22,
    color: tokens.colors.brandStrong,
    fontFamily: tokens.typography.body,
  },
});
