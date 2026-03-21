import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
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

export function EmailVerificationScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'EmailVerification'>>();
  const { clearPendingVerification, confirmEmail, pendingVerification, resendVerification } =
    useAuth();
  const [code, setCode] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  const targetEmail =
    route.params?.email ?? pendingVerification?.email ?? '';
  const targetNickname =
    route.params?.nickname ?? pendingVerification?.nickname ?? '';
  const hasEmail = Boolean(targetEmail);
  const subtitle = hasEmail
    ? `${targetEmail}로 발송된 6자리 인증 코드를 입력하면 바로 세션이 발급됩니다.`
    : '인증할 이메일이 아직 정해지지 않았습니다. 로그인 또는 회원가입 화면으로 돌아가 다시 시작해 주세요.';

  async function handleConfirm() {
    if (!hasEmail) {
      setMessage('인증할 이메일이 없습니다. 로그인 화면으로 돌아가 주세요.');
      return;
    }

    if (code.trim().length !== 6) {
      setMessage('6자리 인증 코드를 입력해 주세요.');
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      await confirmEmail({
        email: targetEmail,
        code: code.trim(),
      });
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : '이메일 인증에 실패했습니다.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    if (!hasEmail) {
      setMessage('재발송할 이메일이 없습니다. 로그인 화면으로 돌아가 주세요.');
      return;
    }

    setResending(true);
    setMessage(null);

    try {
      await resendVerification(targetEmail);
      setMessage('인증 코드를 다시 발송했습니다. 메일함을 확인해 주세요.');
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : '인증 코드 재발송에 실패했습니다.',
      );
    } finally {
      setResending(false);
    }
  }

  return (
    <AuthScreenLayout
      badge="Email Verification"
      title={targetNickname ? `${targetNickname}님의 계정을 활성화하세요` : '이메일 인증을 마무리하세요'}
      subtitle={subtitle}
      footer={
        <>
          <Text style={styles.footerText}>다른 계정으로 다시 시작하려면</Text>
          <AuthTextLink
            label="로그인으로 이동"
            onPress={() => {
              clearPendingVerification();
              navigation.navigate('Login');
            }}
          />
        </>
      }
    >
      {hasEmail ? (
        <AuthNotice>
          <AuthNoticeText>
            메일함에 보이지 않으면 스팸함을 확인한 뒤 코드를 다시 요청해 주세요.
          </AuthNoticeText>
        </AuthNotice>
      ) : (
        <AuthNotice tone="danger">
          <AuthNoticeText>
            인증 이메일이 없어 현재 단계에서는 진행할 수 없습니다.
          </AuthNoticeText>
        </AuthNotice>
      )}

      <AuthField
        keyboardType="number-pad"
        label="인증 코드"
        maxLength={6}
        onChangeText={setCode}
        placeholder="6자리 코드"
        value={code}
      />

      {message ? (
        <AuthNotice tone={message.includes('다시 발송') ? 'positive' : 'danger'}>
          <AuthNoticeText>{message}</AuthNoticeText>
        </AuthNotice>
      ) : null}

      <PrimaryButton
        disabled={!hasEmail || submitting}
        label={submitting ? '인증 중...' : '이메일 인증 완료'}
        onPress={handleConfirm}
      />

      <View style={styles.inlineRow}>
        <Text style={styles.inlineText}>인증 메일을 못 받았나요?</Text>
        <AuthTextLink
          label={resending ? '재발송 중...' : '코드 다시 받기'}
          onPress={resending ? undefined : handleResend}
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
