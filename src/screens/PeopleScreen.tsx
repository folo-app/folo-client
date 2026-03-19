import { useDeferredValue, useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useAuth } from '../auth/AuthProvider';
import type { FollowUserItem, UserSearchItem } from '../api/contracts';
import { foloApi } from '../api/services';
import { DataStatusCard } from '../components/DataStatusCard';
import {
  Chip,
  Page,
  PrimaryButton,
  SectionHeading,
  SurfaceCard,
} from '../components/ui';
import { formatNumber } from '../lib/format';
import type { RootStackParamList } from '../navigation/types';
import { tokens } from '../theme/tokens';

export function PeopleScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { session } = useAuth();
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query.trim());
  const [results, setResults] = useState<UserSearchItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [graphLoading, setGraphLoading] = useState(true);
  const [graphError, setGraphError] = useState<string | null>(null);
  const [followers, setFollowers] = useState<FollowUserItem[]>([]);
  const [followings, setFollowings] = useState<FollowUserItem[]>([]);
  const [pendingUserId, setPendingUserId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function loadGraph() {
    setGraphLoading(true);
    setGraphError(null);

    try {
      const [followersResponse, followingsResponse] = await Promise.all([
        foloApi.getFollowers(0, 6),
        foloApi.getFollowings(0, 6),
      ]);

      setFollowers(followersResponse.followers ?? []);
      setFollowings(followingsResponse.followings ?? []);
    } catch (error) {
      setGraphError(
        error instanceof Error ? error.message : '팔로우 목록을 불러오지 못했습니다.',
      );
    } finally {
      setGraphLoading(false);
    }
  }

  useEffect(() => {
    loadGraph();
  }, []);

  useEffect(() => {
    let alive = true;

    if (deferredQuery.length < 2) {
      setResults([]);
      setTotalCount(0);
      setSearchError(null);
      setSearchLoading(false);
      return () => {
        alive = false;
      };
    }

    setSearchLoading(true);
    setSearchError(null);

    foloApi
      .searchUsers(deferredQuery)
      .then((response) => {
        if (!alive) {
          return;
        }

        const visibleResults = response.users.filter(
          (item) => item.userId !== session?.userId,
        );
        setResults(visibleResults);
        setTotalCount(visibleResults.length);
      })
      .catch((error) => {
        if (!alive) {
          return;
        }
        setResults([]);
        setTotalCount(0);
        setSearchError(
          error instanceof Error ? error.message : '사용자 검색에 실패했습니다.',
        );
      })
      .finally(() => {
        if (alive) {
          setSearchLoading(false);
        }
      });

    return () => {
      alive = false;
    };
  }, [deferredQuery, session?.userId]);

  async function handleToggleFollow(userId: number, isFollowing: boolean) {
    setPendingUserId(userId);
    setActionError(null);

    try {
      if (isFollowing) {
        await foloApi.unfollowUser(userId);
      } else {
        await foloApi.followUser(userId);
      }

      setResults((current) =>
        current.map((item) =>
          item.userId === userId ? { ...item, isFollowing: !isFollowing } : item,
        ),
      );
      setFollowers((current) =>
        current.map((item) =>
          item.userId === userId ? { ...item, isFollowing: !isFollowing } : item,
        ),
      );
      await loadGraph();
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : '팔로우 상태를 바꾸지 못했습니다.',
      );
    } finally {
      setPendingUserId(null);
    }
  }

  function renderUserRow(user: {
    userId: number;
    nickname: string;
    profileImage: string | null;
    isFollowing: boolean;
    followerCount?: number;
  }) {
    const isSelf = user.userId === session?.userId;

    return (
      <Pressable
        key={user.userId}
        onPress={() =>
          navigation.navigate('UserProfile', {
            userId: user.userId,
            nickname: user.nickname,
          })
        }
        style={styles.userRow}
      >
        <View style={styles.userIdentity}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user.nickname.slice(0, 1).toUpperCase()}</Text>
          </View>
          <View style={styles.userText}>
            <Text style={styles.userName}>{user.nickname}</Text>
            <Text style={styles.userMeta}>
              {user.followerCount !== undefined
                ? `팔로워 ${formatNumber(user.followerCount)}명`
                : user.isFollowing
                  ? '현재 팔로우 중'
                  : '아직 팔로우하지 않음'}
            </Text>
          </View>
        </View>
        {isSelf ? (
          <Chip label="나" active tone="brand" />
        ) : (
          <Chip
            label={
              pendingUserId === user.userId
                ? '처리 중'
                : user.isFollowing
                  ? '언팔로우'
                  : '팔로우'
            }
            tone={user.isFollowing ? 'default' : 'brand'}
            onPress={() => handleToggleFollow(user.userId, user.isFollowing)}
          />
        )}
      </Pressable>
    );
  }

  const combinedError = searchError ?? graphError ?? actionError;
  const combinedLoading =
    searchLoading || graphLoading || pendingUserId !== null;

  return (
    <Page
      eyebrow="People"
      title="사람 찾기"
      subtitle="닉네임으로 사용자를 검색하고, 현재 팔로우 관계를 바로 바꿀 수 있습니다."
    >
      <DataStatusCard error={combinedError} loading={combinedLoading} />

      <SurfaceCard tone="hero">
        <SectionHeading
          title="검색"
          description="닉네임 2자 이상 입력 시 실제 `/users/search` 결과를 가져옵니다."
        />
        <TextInput
          onChangeText={setQuery}
          placeholder="예: followcheck, godten"
          placeholderTextColor={tokens.colors.inkMute}
          style={styles.input}
          value={query}
        />
        <Text style={styles.helperText}>
          검색 결과를 누르면 공개 프로필을 열 수 있습니다.
        </Text>
      </SurfaceCard>

      {deferredQuery.length >= 2 ? (
        <SurfaceCard>
          <SectionHeading
            title="검색 결과"
            description={`현재 ${totalCount}명`}
          />
          {results.length === 0 && !searchLoading ? (
            <Text style={styles.emptyText}>조건에 맞는 사용자가 없습니다.</Text>
          ) : (
            results.map((user, index) => (
              <View
                key={user.userId}
                style={[index < results.length - 1 && styles.divider]}
              >
                {renderUserRow(user)}
              </View>
            ))
          )}
        </SurfaceCard>
      ) : (
        <>
          <SurfaceCard>
            <SectionHeading
              title="내 팔로잉"
              description={`현재 ${followings.length}명 미리보기`}
            />
            {followings.length === 0 ? (
              <Text style={styles.emptyText}>
                아직 팔로우한 사용자가 없습니다. 검색으로 첫 연결을 만들어 보세요.
              </Text>
            ) : (
              followings.map((user, index) => (
                <View
                  key={user.userId}
                  style={[index < followings.length - 1 && styles.divider]}
                >
                  {renderUserRow(user)}
                </View>
              ))
            )}
          </SurfaceCard>

          <SurfaceCard>
            <SectionHeading
              title="나를 팔로우한 사람"
              description={`현재 ${followers.length}명 미리보기`}
            />
            {followers.length === 0 ? (
              <Text style={styles.emptyText}>아직 팔로워가 없습니다.</Text>
            ) : (
              followers.map((user, index) => (
                <View
                  key={user.userId}
                  style={[index < followers.length - 1 && styles.divider]}
                >
                  {renderUserRow(user)}
                </View>
              ))
            )}
          </SurfaceCard>
        </>
      )}

      <SurfaceCard tone="muted">
        <SectionHeading
          title="다음 단계"
          description="사용자 상세 피드와 공개 포트폴리오 화면은 이어서 붙일 수 있습니다."
        />
        <PrimaryButton
          label="피드로 돌아가기"
          variant="secondary"
          onPress={() => navigation.navigate('MainTabs', { screen: 'Feed' })}
        />
      </SurfaceCard>
    </Page>
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: 'rgba(255,255,255,0.84)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(214, 224, 234, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: tokens.colors.navy,
    fontFamily: tokens.typography.body,
  },
  helperText: {
    fontSize: 12,
    color: tokens.colors.brandStrong,
    fontFamily: tokens.typography.body,
  },
  userRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  userIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: tokens.colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 17,
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontWeight: '800',
  },
  userText: {
    gap: 4,
    flex: 1,
  },
  userName: {
    fontSize: 15,
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontWeight: '700',
  },
  userMeta: {
    fontSize: 13,
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.body,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(214, 224, 234, 0.8)',
    paddingBottom: 16,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 22,
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.body,
  },
});
