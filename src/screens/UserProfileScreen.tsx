import { useEffect, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';

import { useAuth } from '../auth/AuthProvider';
import type { PublicProfileResponse } from '../api/contracts';
import { foloApi } from '../api/services';
import { DataStatusCard } from '../components/DataStatusCard';
import { Chip, Page, PrimaryButton, SectionHeading, SurfaceCard } from '../components/ui';
import { visibilityLabel } from '../lib/format';
import type { RootStackParamList } from '../navigation/types';
import { tokens } from '../theme/tokens';

export function UserProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'UserProfile'>>();
  const { session } = useAuth();
  const [profile, setProfile] = useState<PublicProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function loadProfile() {
    setLoading(true);
    setError(null);

    try {
      const response = await foloApi.getUserProfile(route.params.userId);
      setProfile(response);
    } catch (nextError) {
      setError(
        nextError instanceof Error ? nextError.message : '프로필을 불러오지 못했습니다.',
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, [route.params.userId]);

  async function handleToggleFollow() {
    if (!profile || profile.userId === session?.userId) {
      return;
    }

    setPending(true);
    setError(null);

    try {
      if (profile.isFollowing) {
        await foloApi.unfollowUser(profile.userId);
      } else {
        await foloApi.followUser(profile.userId);
      }

      await loadProfile();
    } catch (nextError) {
      setError(
        nextError instanceof Error ? nextError.message : '팔로우 상태를 바꾸지 못했습니다.',
      );
    } finally {
      setPending(false);
    }
  }

  const isSelf = profile?.userId === session?.userId;

  return (
    <Page
      eyebrow="Profile"
      title={profile?.nickname ? `${profile.nickname} 프로필` : '사용자 프로필'}
      subtitle="공개 프로필, 팔로우 상태, 포트폴리오 접근 가능 여부를 확인합니다."
    >
      <DataStatusCard error={error} loading={loading || pending} />

      {profile ? (
        <>
          <SurfaceCard tone="hero">
            <View style={styles.header}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{profile.nickname.slice(0, 1).toUpperCase()}</Text>
              </View>
              <View style={styles.headerText}>
                <Text style={styles.name}>{profile.nickname}</Text>
                <Text style={styles.bio}>{profile.bio ?? '등록된 소개가 없습니다.'}</Text>
              </View>
            </View>
            <View style={styles.metaRow}>
              <Chip active label={`팔로워 ${profile.followerCount}`} tone="brand" />
              <Chip label={`팔로잉 ${profile.followingCount}`} />
              <Chip label={visibilityLabel(profile.portfolioVisibility)} />
            </View>
            {!isSelf ? (
              <PrimaryButton
                label={
                  pending
                    ? '처리 중...'
                    : profile.isFollowing
                      ? '언팔로우'
                      : '팔로우'
                }
                onPress={handleToggleFollow}
                variant={profile.isFollowing ? 'secondary' : 'primary'}
                disabled={pending}
              />
            ) : (
              <PrimaryButton
                label="내 프로필로 이동"
                onPress={() => navigation.navigate('MainTabs', { screen: 'Profile' })}
                variant="secondary"
              />
            )}
          </SurfaceCard>

          <SurfaceCard>
            <SectionHeading
              title="포트폴리오 접근"
              description="상대가 설정한 공개 범위 기준으로 현재 접근 가능 여부를 표시합니다."
            />
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>현재 상태</Text>
              <Text style={styles.statusValue}>
                {profile.isAccessible ? '열람 가능' : '열람 제한'}
              </Text>
            </View>
            <Text style={styles.statusText}>
              {profile.isAccessible
                ? '상세 포트폴리오/개인 피드 화면을 이어서 붙이면 이 계정의 공개 범위를 기준으로 진입시킬 수 있습니다.'
                : '지금은 공개 범위 때문에 포트폴리오를 열 수 없습니다. 친구 공개 계정은 상호 팔로우가 되어야 접근 가능합니다.'}
            </Text>
          </SurfaceCard>
        </>
      ) : !loading ? (
        <SurfaceCard>
          <Text style={styles.emptyText}>사용자 정보를 찾을 수 없습니다.</Text>
        </SurfaceCard>
      ) : null}
    </Page>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: tokens.colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: tokens.colors.surface,
    fontSize: 28,
    fontFamily: tokens.typography.heading,
    fontWeight: '800',
  },
  headerText: {
    gap: 6,
    flex: 1,
  },
  name: {
    fontSize: 24,
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontWeight: '800',
  },
  bio: {
    fontSize: 14,
    lineHeight: 22,
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.body,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statusLabel: {
    fontSize: 14,
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.body,
  },
  statusValue: {
    fontSize: 14,
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontWeight: '700',
  },
  statusText: {
    fontSize: 14,
    lineHeight: 22,
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.body,
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 22,
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.body,
  },
});
