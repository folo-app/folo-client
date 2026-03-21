import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import {
  AuthField,
  AuthNotice,
  AuthNoticeText,
  AuthScreenLayout,
  AuthTextLink,
} from '../components/auth-ui';
import { PrimaryButton } from '../components/ui';
import type { RootStackParamList } from '../navigation/types';
import { foloApi } from '../api/services';
import { tokens } from '../theme/tokens';

export function PasswordResetConfirmScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'PasswordResetConfirm'>>();
  const [email, setEmail] = useState(route.params?.email ?? '');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleConfirmReset() {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || code.trim().length !== 6 || !newPassword || !confirmPassword) {
      setMessage('이메일, 6자리 코드, 새 비밀번호를 모두 입력해 주세요.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage('새 비밀번호와 확인 비밀번호가 일치하지 않습니다.');
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      await foloApi.confirmPasswordReset({
        email: normalizedEmail,
        code: code.trim(),
        newPassword,
      });
      navigation.navigate('Login', {
        email: normalizedEmail,
        notice: '비밀번호가 변경되었습니다. 새 비밀번호로 로그인해 주세요.',
      });
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : '비밀번호 재설정에 실패했습니다.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthScreenLayout
      badge="New Password"
      title="새 비밀번호를 등록하고 다시 로그인하세요"
      subtitle="이메일로 받은 6자리 재설정 코드와 새 비밀번호를 입력하면 기존 세션은 모두 만료되고 새 비밀번호로 다시 로그인할 수 있습니다."
      footer={
        <>
          <Text style={styles.footerText}>코드를 아직 못 받았나요?</Text>
          <AuthTextLink
            label="재설정 코드 다시 요청"
            onPress={() =>
              navigation.navigate('PasswordResetRequest', { email: email.trim() })
            }
          />
        </>
      }
    >
      <AuthField
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        label="이메일"
        onChangeText={setEmail}
        placeholder="you@example.com"
        value={email}
      />
      <AuthField
        keyboardType="number-pad"
        label="재설정 코드"
        maxLength={6}
        onChangeText={setCode}
        placeholder="6자리 코드"
        value={code}
      />
      <AuthField
        autoCapitalize="none"
        helper="영문, 숫자, 특수문자를 포함한 8자 이상 비밀번호"
        label="새 비밀번호"
        onChangeText={setNewPassword}
        placeholder="새 비밀번호"
        secureTextEntry
        value={newPassword}
      />
      <AuthField
        autoCapitalize="none"
        label="새 비밀번호 확인"
        onChangeText={setConfirmPassword}
        placeholder="새 비밀번호 다시 입력"
        secureTextEntry
        value={confirmPassword}
      />

      {message ? (
        <AuthNotice tone="danger">
          <AuthNoticeText>{message}</AuthNoticeText>
        </AuthNotice>
      ) : null}

      <PrimaryButton
        disabled={submitting}
        label={submitting ? '변경 중...' : '새 비밀번호 저장'}
        onPress={handleConfirmReset}
      />
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  footerText: {
    color: tokens.colors.inkSoft,
    fontSize: 14,
    fontFamily: tokens.typography.body,
  },
});
