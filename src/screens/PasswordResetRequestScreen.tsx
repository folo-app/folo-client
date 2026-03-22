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

export function PasswordResetRequestScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'PasswordResetRequest'>>();
  const [email, setEmail] = useState(route.params?.email ?? '');
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleRequestReset() {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setMessage('비밀번호를 재설정할 이메일을 입력해 주세요.');
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      await foloApi.requestPasswordReset({ email: normalizedEmail });
      navigation.navigate('Login', {
        email: normalizedEmail,
        notice: '입력한 이메일로 계정이 존재하면 임시 비밀번호를 전송했습니다. 메일함을 확인해 주세요.',
      });
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : '비밀번호 재설정 요청에 실패했습니다.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthScreenLayout
      badge="Reset Password"
      title="임시 비밀번호 받기"
      subtitle="가입한 이메일로 임시 비밀번호를 보내드리고, 기존 로그인 세션은 정리됩니다."
      footer={
        <>
          <Text style={styles.footerText}>로그인이 기억났다면</Text>
          <AuthTextLink label="로그인" onPress={() => navigation.navigate('Login')} />
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

      {message ? (
        <AuthNotice tone="danger">
          <AuthNoticeText>{message}</AuthNoticeText>
        </AuthNotice>
      ) : null}

      <PrimaryButton
        disabled={submitting}
        label={submitting ? '전송 중...' : '임시 비밀번호 받기'}
        onPress={handleRequestReset}
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
