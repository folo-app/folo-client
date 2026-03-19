import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useAuth } from '../auth/AuthProvider';
import {
  AuthField,
  AuthNotice,
  AuthNoticeText,
  AuthScreenLayout,
  AuthTextLink,
} from '../components/auth-ui';
import { PrimaryButton } from '../components/ui';
import type { RootStackParamList } from '../navigation/types';
import { tokens } from '../theme/tokens';

export function LoginScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { pendingVerification, signIn } = useAuth();
  const [email, setEmail] = useState(pendingVerification?.email ?? '');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleLogin() {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      setMessage('이메일과 비밀번호를 모두 입력해 주세요.');
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const result = await signIn({
        email: normalizedEmail,
        password,
      });

      if (result === 'verification_required') {
        navigation.navigate('EmailVerification', { email: normalizedEmail });
        return;
      }
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : '로그인에 실패했습니다. 다시 시도해 주세요.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthScreenLayout
      badge="Account Access"
      title="친구와 함께 보는 투자 기록, 계정으로 바로 시작"
      subtitle="이메일 인증이 완료된 계정으로 로그인하면 홈, 피드, 포트폴리오, 프로필까지 실제 앱 흐름으로 진입합니다."
      footer={
        <>
          <Text style={styles.footerText}>아직 계정이 없나요?</Text>
          <AuthTextLink label="회원가입" onPress={() => navigation.navigate('Signup')} />
        </>
      }
    >
      <AuthNotice>
        <AuthNoticeText>
          이메일 인증이 끝나지 않았다면 로그인 시 인증 코드 입력 화면으로 바로 이어집니다.
        </AuthNoticeText>
      </AuthNotice>

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
        autoCapitalize="none"
        autoComplete="password"
        helper="영문, 숫자, 특수문자를 포함한 비밀번호를 입력합니다."
        label="비밀번호"
        onChangeText={setPassword}
        placeholder="비밀번호"
        secureTextEntry
        value={password}
      />

      {message ? (
        <AuthNotice tone="danger">
          <AuthNoticeText>{message}</AuthNoticeText>
        </AuthNotice>
      ) : null}

      <PrimaryButton
        disabled={submitting}
        label={submitting ? '로그인 중...' : '이메일로 로그인'}
        onPress={handleLogin}
      />

      <View style={styles.inlineRow}>
        <Text style={styles.inlineText}>인증 코드를 다시 입력해야 하나요?</Text>
        <AuthTextLink
          label="이메일 인증"
          onPress={() => navigation.navigate('EmailVerification', { email: email.trim() })}
        />
      </View>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  footerText: {
    color: tokens.colors.inkSoft,
    fontSize: 14,
    fontFamily: tokens.typography.body,
  },
  inlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  inlineText: {
    color: tokens.colors.inkSoft,
    fontSize: 13,
    fontFamily: tokens.typography.body,
  },
});
