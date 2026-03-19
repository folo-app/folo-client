import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { useAuth } from '../auth/AuthProvider';
import { ProfileImageField } from '../components/ProfileImageField';
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

export function SignupScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSignup() {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedNickname = nickname.trim();

    if (!normalizedEmail || !normalizedNickname || !password) {
      setMessage('이메일, 닉네임, 비밀번호를 모두 입력해 주세요.');
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const pending = await signUp({
        email: normalizedEmail,
        nickname: normalizedNickname,
        password,
        profileImage,
      });

      navigation.navigate('EmailVerification', {
        email: pending?.email ?? normalizedEmail,
        nickname: pending?.nickname ?? normalizedNickname,
      });
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : '회원가입에 실패했습니다. 다시 시도해 주세요.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthScreenLayout
      badge="Create Account"
      title="실제 서비스용 계정을 만들고 인증까지 마무리"
      subtitle="회원가입이 완료되면 인증 코드가 발송되고, 코드 확인 후 즉시 메인 앱 세션이 생성됩니다."
      footer={
        <>
          <Text style={styles.footerText}>이미 계정이 있나요?</Text>
          <AuthTextLink label="로그인" onPress={() => navigation.navigate('Login')} />
        </>
      }
    >
      <AuthNotice>
        <AuthNoticeText>
          비밀번호는 8자 이상이며 영문, 숫자, 특수문자를 모두 포함해야 합니다.
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
        helper="친구 피드와 포트폴리오 공개 화면에 표시됩니다."
        label="닉네임"
        onChangeText={setNickname}
        placeholder="닉네임"
        value={nickname}
      />
      <AuthField
        autoCapitalize="none"
        label="비밀번호"
        onChangeText={setPassword}
        placeholder="비밀번호"
        secureTextEntry
        value={password}
      />
      <ProfileImageField
        fallbackName={nickname || email || 'Folo'}
        helper="선택 사항입니다. URL 입력 대신 사진 앨범에서 바로 고를 수 있습니다."
        label="프로필 이미지"
        onChange={setProfileImage}
        value={profileImage}
      />

      {message ? (
        <AuthNotice tone="danger">
          <AuthNoticeText>{message}</AuthNoticeText>
        </AuthNotice>
      ) : null}

      <PrimaryButton
        disabled={submitting}
        label={submitting ? '가입 중...' : '회원가입하고 인증하기'}
        onPress={handleSignup}
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
