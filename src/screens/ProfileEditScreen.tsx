import { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import type { CurrencyCode, PortfolioVisibility, ReturnVisibility } from '../api/contracts';
import { useAuth } from '../auth/AuthProvider';
import { foloApi } from '../api/services';
import { DataStatusCard } from '../components/DataStatusCard';
import { ProfileImageField } from '../components/ProfileImageField';
import {
  Chip,
  Page,
  PageBackButton,
  PrimaryButton,
  SectionHeading,
  SurfaceCard,
} from '../components/ui';
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

const displayCurrencyOptions: Array<{ label: string; value: CurrencyCode }> = [
  { label: '원화 기준', value: 'KRW' },
  { label: '달러 기준', value: 'USD' },
];

export function ProfileEditScreen() {
  const { session } = useAuth();
  const profile = useMyProfileData();
  const [nickname, setNickname] = useState(profile.data.nickname);
  const [profileImage, setProfileImage] = useState<string | null>(
    profile.data.profileImage,
  );
  const [bio, setBio] = useState(profile.data.bio ?? '');
  const [portfolioVisibility, setPortfolioVisibility] = useState<PortfolioVisibility>(
    profile.data.portfolioVisibility,
  );
  const [returnVisibility, setReturnVisibility] = useState<ReturnVisibility>(
    profile.data.returnVisibility,
  );
  const [displayCurrency, setDisplayCurrency] = useState<CurrencyCode>(
    profile.data.displayCurrency,
  );
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [changingPassword, setChangingPassword] = useState(false);
  const canManagePassword = session?.authProvider === 'EMAIL';

  useEffect(() => {
    setNickname(profile.data.nickname);
    setProfileImage(profile.data.profileImage);
    setBio(profile.data.bio ?? '');
    setPortfolioVisibility(profile.data.portfolioVisibility);
    setReturnVisibility(profile.data.returnVisibility);
    setDisplayCurrency(profile.data.displayCurrency);
  }, [profile.data]);

  async function handleSave() {
    setSaving(true);
    setSubmitMessage(null);

    try {
      await foloApi.updateMyProfile({
        nickname,
        profileImage,
        bio,
        portfolioVisibility,
        returnVisibility,
        displayCurrency,
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

  async function handleChangePassword() {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMessage('현재 비밀번호와 새 비밀번호를 모두 입력해 주세요.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage('새 비밀번호 확인이 일치하지 않습니다.');
      return;
    }

    setChangingPassword(true);
    setPasswordMessage(null);

    try {
      await foloApi.changeMyPassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordMessage('비밀번호가 변경되었습니다.');
    } catch (error) {
      setPasswordMessage(
        error instanceof Error ? error.message : '비밀번호 변경에 실패했습니다.',
      );
    } finally {
      setChangingPassword(false);
    }
  }

  return (
    <Page
      eyebrow="Profile Edit"
      title="프로필 편집"
      leading={<PageBackButton />}
    >
      <DataStatusCard error={profile.error} loading={profile.loading} />

      <SurfaceCard>
        <SectionHeading title="기본 정보" />
        <View style={styles.inputGroup}>
          <Text style={styles.label}>닉네임</Text>
          <TextInput onChangeText={setNickname} style={styles.input} value={nickname} />
        </View>
        <ProfileImageField
          fallbackName={nickname || 'Folo'}
          helper="프로필 사진은 갤러리에서 선택한 뒤 바로 업로드됩니다."
          label="프로필 이미지"
          onChange={setProfileImage}
          value={profileImage}
        />
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
        <SectionHeading title="공개 범위" description="누가 내 기록을 볼 수 있는지 정합니다." />
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
        <Text style={styles.label}>평가 통화</Text>
        <View style={styles.optionGroup}>
          {displayCurrencyOptions.map((option) => (
            <Chip
              key={option.value}
              active={displayCurrency === option.value}
              label={option.label}
              onPress={() => setDisplayCurrency(option.value)}
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

      {canManagePassword ? (
        <SurfaceCard>
          <SectionHeading
            title="비밀번호 변경"
            description="현재 비밀번호를 확인한 뒤 새 비밀번호로 바꿉니다."
          />
          <View style={styles.inputGroup}>
            <Text style={styles.label}>현재 비밀번호</Text>
            <TextInput
              autoCapitalize="none"
              onChangeText={setCurrentPassword}
              secureTextEntry
              style={styles.input}
              value={currentPassword}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>새 비밀번호</Text>
            <TextInput
              autoCapitalize="none"
              onChangeText={setNewPassword}
              secureTextEntry
              style={styles.input}
              value={newPassword}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>새 비밀번호 확인</Text>
            <TextInput
              autoCapitalize="none"
              onChangeText={setConfirmPassword}
              secureTextEntry
              style={styles.input}
              value={confirmPassword}
            />
          </View>
          <Text style={styles.passwordHint}>
            영문, 숫자, 특수문자를 포함한 8자 이상 비밀번호를 사용해 주세요.
          </Text>
          {passwordMessage ? <Text style={styles.message}>{passwordMessage}</Text> : null}
          <PrimaryButton
            disabled={changingPassword}
            label={changingPassword ? '변경 중...' : '비밀번호 변경'}
            onPress={handleChangePassword}
          />
        </SurfaceCard>
      ) : null}
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
  passwordHint: {
    fontSize: 12,
    lineHeight: 18,
    color: tokens.colors.inkMute,
    fontFamily: tokens.typography.body,
  },
});
