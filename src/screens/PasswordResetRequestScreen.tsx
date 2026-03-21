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
      navigation.navigate('PasswordResetConfirm', { email: normalizedEmail });
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
      title="비밀번호를 다시 설정할 수 있도록 코드를 보내드릴게요"
      subtitle="가입한 이메일 주소를 입력하면 계정이 있는 경우 재설정 코드를 보내고, 다음 화면에서 새 비밀번호를 등록할 수 있습니다."
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
        label={submitting ? '코드 전송 중...' : '재설정 코드 받기'}
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
