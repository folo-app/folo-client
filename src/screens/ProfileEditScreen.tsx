import { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import type { PortfolioVisibility, ReturnVisibility } from '../api/contracts';
import { foloApi } from '../api/services';
import { DataStatusCard } from '../components/DataStatusCard';
import { Chip, Page, PrimaryButton, SectionHeading, SurfaceCard } from '../components/ui';
import { useMyProfileData } from '../hooks/useFoloData';
import { tokens } from '../theme/tokens';

const portfolioVisibilityOptions: Array<{ label: string; value: PortfolioVisibility }> = [
  { label: '전체 공개', value: 'PUBLIC' },
  { label: '친구만', value: 'FRIENDS_ONLY' },
  { label: '비공개', value: 'PRIVATE' },
];

const returnVisibilityOptions: Array<{ label: string; value: ReturnVisibility }> = [
  { label: '수익률 + 금액', value: 'RATE_AND_AMOUNT' },
  { label: '수익률만', value: 'RATE_ONLY' },
  { label: '비공개', value: 'PRIVATE' },
];

export function ProfileEditScreen() {
  const profile = useMyProfileData();
  const [nickname, setNickname] = useState(profile.data.nickname);
  const [bio, setBio] = useState(profile.data.bio ?? '');
  const [portfolioVisibility, setPortfolioVisibility] = useState<PortfolioVisibility>(
    profile.data.portfolioVisibility,
  );
  const [returnVisibility, setReturnVisibility] = useState<ReturnVisibility>(
    profile.data.returnVisibility,
  );
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setNickname(profile.data.nickname);
    setBio(profile.data.bio ?? '');
    setPortfolioVisibility(profile.data.portfolioVisibility);
    setReturnVisibility(profile.data.returnVisibility);
  }, [profile.data]);

  async function handleSave() {
    setSaving(true);
    setSubmitMessage(null);

    try {
      await foloApi.updateMyProfile({
        nickname,
        profileImage: profile.data.profileImage,
        bio,
        portfolioVisibility,
        returnVisibility,
      });
      profile.refresh();
      setSubmitMessage('프로필이 저장되었습니다.');
    } catch (error) {
      setSubmitMessage(
        error instanceof Error ? error.message : '프로필 저장에 실패했습니다.',
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Page
      eyebrow="Profile Edit"
      title="프로필 편집"
      subtitle="`PATCH /users/me` 계약에 맞춘 편집 화면입니다."
    >
      <DataStatusCard error={profile.error} loading={profile.loading} />

      <SurfaceCard>
        <SectionHeading
          title="기본 정보"
          description="닉네임과 바이오를 편집합니다."
        />
        <View style={styles.inputGroup}>
          <Text style={styles.label}>닉네임</Text>
          <TextInput onChangeText={setNickname} style={styles.input} value={nickname} />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>바이오</Text>
          <TextInput
            multiline
            onChangeText={setBio}
            style={[styles.input, styles.textArea]}
            value={bio}
          />
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeading
          title="공개 범위"
          description="PortfolioVisibility와 ReturnVisibility를 그대로 매핑했습니다."
        />
        <View style={styles.optionGroup}>
          {portfolioVisibilityOptions.map((option) => (
            <Chip
              key={option.value}
              active={portfolioVisibility === option.value}
              label={option.label}
              onPress={() => setPortfolioVisibility(option.value)}
            />
          ))}
        </View>
        <View style={styles.optionGroup}>
          {returnVisibilityOptions.map((option) => (
            <Chip
              key={option.value}
              active={returnVisibility === option.value}
              label={option.label}
              onPress={() => setReturnVisibility(option.value)}
            />
          ))}
        </View>
        {submitMessage ? <Text style={styles.message}>{submitMessage}</Text> : null}
        <PrimaryButton
          disabled={saving}
          label={saving ? '저장 중...' : '프로필 저장'}
          onPress={handleSave}
        />
      </SurfaceCard>
    </Page>
  );
}

const styles = StyleSheet.create({
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 12,
    color: tokens.colors.inkMute,
    fontFamily: tokens.typography.body,
  },
  input: {
    backgroundColor: tokens.colors.surfaceMuted,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(214, 224, 234, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: tokens.colors.navy,
    fontFamily: tokens.typography.body,
  },
  textArea: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  optionGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  message: {
    fontSize: 13,
    lineHeight: 20,
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.body,
  },
});
