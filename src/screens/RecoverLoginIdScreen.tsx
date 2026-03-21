import { useNavigation } from '@react-navigation/native';
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

export function RecoverLoginIdScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [nickname, setNickname] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleRecover() {
    const normalizedNickname = nickname.trim();

    if (!normalizedNickname) {
      setMessage('가입할 때 사용한 닉네임을 입력해 주세요.');
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      await foloApi.recoverLoginId({ nickname: normalizedNickname });
      setMessage('가입 정보가 있으면 등록된 이메일로 로그인 아이디 안내를 보냈습니다.');
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : '아이디 찾기 요청에 실패했습니다.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthScreenLayout
      badge="Find ID"
      title="가입할 때 쓴 이메일이 기억나지 않는다면"
      subtitle="닉네임을 입력하면 가입 정보가 있는 계정에 한해 등록된 이메일 주소로 로그인 아이디 안내 메일을 보냅니다."
      footer={
        <>
          <Text style={styles.footerText}>로그인 화면으로 돌아갈까요?</Text>
          <AuthTextLink label="로그인" onPress={() => navigation.navigate('Login')} />
        </>
      }
    >
      <AuthField
        autoCapitalize="none"
        helper="친구 피드와 공개 프로필에서 사용한 닉네임 기준으로 찾습니다."
        label="닉네임"
        onChangeText={setNickname}
        placeholder="닉네임"
        value={nickname}
      />

      {message ? (
        <AuthNotice tone={message.includes('보냈습니다') ? 'positive' : 'danger'}>
          <AuthNoticeText>{message}</AuthNoticeText>
        </AuthNotice>
      ) : null}

      <PrimaryButton
        disabled={submitting}
        label={submitting ? '확인 중...' : '아이디 안내 메일 받기'}
        onPress={handleRecover}
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
