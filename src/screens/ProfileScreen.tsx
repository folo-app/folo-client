import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '../auth/AuthProvider';
import { Avatar } from '../components/Avatar';
import { DataStatusCard } from '../components/DataStatusCard';
import { Chip, DetailRow, Page, PrimaryButton, SectionHeading, SurfaceCard } from '../components/ui';
import {
  useMyProfileData,
  useMyTradesData,
  useNotificationsData,
  useRemindersData,
} from '../hooks/useFoloData';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import {
  formatCurrency,
  formatNumber,
  formatRelativeDate,
  notificationLabel,
  tradeTypeLabel,
  visibilityLabel,
} from '../lib/format';
import { shareProfile } from '../lib/profileShare';
import type { MainTabParamList, RootStackParamList } from '../navigation/types';
import { tokens } from '../theme/tokens';

export function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<MainTabParamList, 'Profile'>>();
  const { session, signOut } = useAuth();
  const { isCompact } = useResponsiveLayout();
  const profile = useMyProfileData();
  const notifications = useNotificationsData();
  const reminders = useRemindersData();
  const myTrades = useMyTradesData();
  const [logoutPending, setLogoutPending] = useState(false);
  const shareOnOpenTriggeredRef = useRef(false);
  const combinedError =
    profile.error ?? reminders.error ?? notifications.error ?? myTrades.error;
  const combinedLoading =
    profile.loading || reminders.loading || notifications.loading || myTrades.loading;

  async function handleLogout() {
    setLogoutPending(true);

    try {
      await signOut();
    } finally {
      setLogoutPending(false);
    }
  }

  async function handleShareProfile() {
    if (profile.data.userId <= 0) {
      return;
    }

    await shareProfile({
      userId: profile.data.userId,
      nickname: profile.data.nickname || session?.nickname || 'Folo 사용자',
    });
  }

  useEffect(() => {
    if (
      !route.params?.qaShareOnOpen ||
      shareOnOpenTriggeredRef.current ||
      profile.data.userId <= 0
    ) {
      return;
    }

    shareOnOpenTriggeredRef.current = true;
    void handleShareProfile();
  }, [profile.data.nickname, profile.data.userId, route.params?.qaShareOnOpen, session?.nickname]);

  return (
    <Page
      eyebrow="Profile"
      title="내 기록과 공개 범위"
    >
      <DataStatusCard error={combinedError} loading={combinedLoading} variant="inline" />

      <SurfaceCard tone="hero">
        <View style={[styles.profileHeader, isCompact && styles.profileHeaderCompact]}>
          <Avatar
            backgroundColor={tokens.colors.navy}
            imageUrl={profile.data.profileImage}
            name={profile.data.nickname || session?.nickname || '?'}
            size={72}
          />
          <View style={styles.profileText}>
            <Text style={styles.name}>{profile.data.nickname || session?.nickname || '내 계정'}</Text>
            {session?.email ? (
              <Text ellipsizeMode="middle" numberOfLines={1} style={styles.handle}>
                {session.email}
              </Text>
            ) : null}
            <Text style={styles.joinedAt}>가입일 {formatRelativeDate(profile.data.createdAt)}</Text>
            <Text style={styles.bio}>{profile.data.bio ?? '바이오가 아직 없습니다.'}</Text>
          </View>
        </View>
        <View style={styles.metaRow}>
          <Chip active label={`팔로워 ${profile.data.followerCount}`} tone="brand" />
          <Chip label={`팔로잉 ${profile.data.followingCount}`} />
          <Chip label={`기록 ${myTrades.data.totalCount}`} />
          <Chip label={visibilityLabel(profile.data.portfolioVisibility)} />
        </View>
        <View style={styles.profileActions}>
          <PrimaryButton
            label="프로필 공유"
            onPress={() => {
              void handleShareProfile();
            }}
          />
          <PrimaryButton
            label="프로필 편집"
            onPress={() => navigation.navigate('ProfileEdit')}
            variant="secondary"
          />
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeading
          title="공개 범위와 연결"
          description="내 프로필이 어떻게 보이고 있는지 빠르게 확인합니다."
        />
        <DetailRow
          label="포트폴리오 공개 범위"
          value={visibilityLabel(profile.data.portfolioVisibility)}
        />
        <DetailRow
          label="수익 공개 범위"
          value={visibilityLabel(profile.data.returnVisibility)}
        />
        <DetailRow label="알림 미확인 수" value={`${notifications.data.unreadCount}개`} />
        <DetailRow label="활성 리마인더" value={`${reminders.data.reminders.length}개`} />
        <View style={styles.actionStack}>
          <PrimaryButton
            label="사람 찾기"
            onPress={() => navigation.navigate('People')}
            variant="secondary"
          />
          <PrimaryButton
            label="KIS 연결"
            onPress={() => navigation.navigate('KisConnect')}
            variant="secondary"
          />
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeading
          title="내 최근 거래"
          description={`총 ${myTrades.data.totalCount}건`}
        />
        {myTrades.data.trades.length === 0 ? (
          <Text style={styles.emptyText}>아직 등록된 거래가 없습니다.</Text>
        ) : (
          myTrades.data.trades.slice(0, 3).map((trade, index) => (
            <Pressable
              key={trade.tradeId}
              onPress={() => navigation.navigate('TradeDetail', { tradeId: trade.tradeId })}
              style={[
                styles.listRow,
                index < Math.min(2, myTrades.data.trades.length - 1) && styles.divider,
              ]}
            >
              <Text style={styles.listTitle}>
                {trade.ticker} · {tradeTypeLabel(trade.tradeType)}
              </Text>
              <Text style={styles.listMeta}>
                {formatNumber(trade.totalAmount)} · {formatRelativeDate(trade.tradedAt)}
              </Text>
            </Pressable>
          ))
        )}
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeading title="리마인더" />
        {reminders.data.reminders.length === 0 ? (
          <Text style={styles.emptyText}>등록된 리마인더가 없습니다.</Text>
        ) : (
          reminders.data.reminders.slice(0, 2).map((reminder, index) => (
            <View
              key={reminder.reminderId}
              style={[
                styles.listRow,
                index < Math.min(1, reminders.data.reminders.length - 1) && styles.divider,
              ]}
            >
              <Text style={styles.listTitle}>
                {reminder.ticker} · {reminder.name}
              </Text>
              <Text style={styles.listMeta}>
                매월 {reminder.dayOfMonth}일 · {formatCurrency(reminder.amount)}
              </Text>
            </View>
          ))
        )}
        <PrimaryButton
          label="리마인더 전체 보기"
          onPress={() => navigation.navigate('Reminders')}
          variant="secondary"
        />
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeading title="알림" />
        {notifications.data.notifications.length === 0 ? (
          <Text style={styles.emptyText}>표시할 알림이 없습니다.</Text>
        ) : (
          notifications.data.notifications.slice(0, 2).map((item, index) => (
            <View
              key={item.notificationId}
              style={[
                styles.listRow,
                index < Math.min(1, notifications.data.notifications.length - 1) &&
                  styles.divider,
              ]}
            >
              <Text style={styles.listTitle}>
                {notificationLabel(item.type)} · {item.message}
              </Text>
              <Text style={styles.listMeta}>{formatRelativeDate(item.createdAt)}</Text>
            </View>
          ))
        )}
        <PrimaryButton
          label="알림 전체 보기"
          onPress={() => navigation.navigate('Notifications')}
          variant="secondary"
        />
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeading
          title="계정 관리"
          description="세션과 연결 상태를 마지막에 정리합니다."
        />
        <PrimaryButton
          disabled={logoutPending}
          label={logoutPending ? '로그아웃 중...' : '로그아웃'}
          onPress={handleLogout}
          variant="secondary"
        />
      </SurfaceCard>
    </Page>
  );
}

const styles = StyleSheet.create({
  profileHeader: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  profileHeaderCompact: {
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  profileText: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 24,
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontWeight: '800',
  },
  handle: {
    fontSize: 13,
    color: tokens.colors.brandStrong,
    fontFamily: tokens.typography.body,
  },
  joinedAt: {
    fontSize: 13,
    color: tokens.colors.inkMute,
    fontFamily: tokens.typography.body,
  },
  bio: {
    fontSize: 14,
    lineHeight: 22,
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.body,
  },
  profileActions: {
    gap: 10,
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  actionStack: {
    gap: 10,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  listRow: {
    gap: 6,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(214, 224, 234, 0.8)',
    paddingBottom: 16,
    marginBottom: 16,
  },
  listTitle: {
    fontSize: 15,
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontWeight: '700',
  },
  listMeta: {
    fontSize: 13,
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
