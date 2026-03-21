import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
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
  const route = useRoute<RouteProp<RootStackParamList, 'Login'>>();
  const { pendingVerification, signIn } = useAuth();
  const [email, setEmail] = useState(
    route.params?.email ?? pendingVerification?.email ?? '',
  );
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(route.params?.notice ?? null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (route.params?.email) {
      setEmail(route.params.email);
    }
    if (route.params?.notice) {
      setMessage(route.params.notice);
    }
  }, [route.params?.email, route.params?.notice]);

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
      badge="Sign In"
      heroVariant="compact"
      title={`포트폴리오와 친구 피드,\n한 번에 이어 보기`}
      subtitle="로그인하면 마지막 기록과 투자 루틴이 바로 이어집니다."
      footer={
        <>
          <Text style={styles.footerText}>처음이라면</Text>
          <AuthTextLink label="회원가입" onPress={() => navigation.navigate('Signup')} />
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
        label={submitting ? '로그인 중...' : '로그인'}
        onPress={handleLogin}
      />

      <View style={styles.linkGrid}>
        <View style={styles.inlineRow}>
          <Text style={styles.inlineText}>가입 이메일이 기억나지 않나요?</Text>
          <AuthTextLink
            label="아이디 찾기"
            onPress={() => navigation.navigate('RecoverLoginId')}
          />
        </View>
        <View style={styles.inlineRow}>
          <Text style={styles.inlineText}>비밀번호를 잊어버렸나요?</Text>
          <AuthTextLink
            label="임시 비밀번호 받기"
            onPress={() =>
              navigation.navigate('PasswordResetRequest', { email: email.trim() })
            }
          />
        </View>
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
  linkGrid: {
    gap: 6,
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
