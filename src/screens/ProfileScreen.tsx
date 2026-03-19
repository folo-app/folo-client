import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '../auth/AuthProvider';
import { Avatar } from '../components/Avatar';
import { DataStatusCard } from '../components/DataStatusCard';
import { Chip, Page, PrimaryButton, SectionHeading, SurfaceCard } from '../components/ui';
import {
  useMyProfileData,
  useMyTradesData,
  useNotificationsData,
  useRemindersData,
} from '../hooks/useFoloData';
import {
  formatCurrency,
  formatNumber,
  formatRelativeDate,
  notificationLabel,
  tradeTypeLabel,
  visibilityLabel,
} from '../lib/format';
import type { RootStackParamList } from '../navigation/types';
import { tokens } from '../theme/tokens';

export function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { session, signOut } = useAuth();
  const profile = useMyProfileData();
  const notifications = useNotificationsData();
  const reminders = useRemindersData();
  const myTrades = useMyTradesData();
  const [logoutPending, setLogoutPending] = useState(false);
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

  return (
    <Page
      eyebrow="Profile"
      title="내 기록과 공개 범위"
      subtitle="프로필 정보, 공개 범위, 알림과 리마인더, 최근 거래를 실제 응답 기준으로 보여줍니다."
    >
      <DataStatusCard error={combinedError} loading={combinedLoading} />

      <SurfaceCard tone="hero">
        <View style={styles.profileHeader}>
          <Avatar
            backgroundColor={tokens.colors.navy}
            imageUrl={profile.data.profileImage}
            name={profile.data.nickname || session?.nickname || '?'}
            size={72}
          />
          <View style={styles.profileText}>
            <Text style={styles.name}>{profile.data.nickname || session?.nickname || '내 계정'}</Text>
            {session?.email ? <Text style={styles.handle}>{session.email}</Text> : null}
            <Text style={styles.joinedAt}>가입일 {formatRelativeDate(profile.data.createdAt)}</Text>
            <Text style={styles.bio}>{profile.data.bio ?? '바이오가 아직 없습니다.'}</Text>
          </View>
        </View>
        <View style={styles.metaRow}>
          <Chip active label={`팔로워 ${profile.data.followerCount}`} tone="brand" />
          <Chip label={`팔로잉 ${profile.data.followingCount}`} />
          <Chip label={visibilityLabel(profile.data.portfolioVisibility)} />
        </View>
        <View style={styles.profileActions}>
          <PrimaryButton
            label="프로필 편집"
            onPress={() => navigation.navigate('ProfileEdit')}
            variant="secondary"
          />
          <PrimaryButton
            disabled={logoutPending}
            label={logoutPending ? '로그아웃 중...' : '로그아웃'}
            onPress={handleLogout}
            variant="secondary"
          />
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeading
          title="계정 상태"
          description="로그인 계정과 공개 범위를 함께 확인합니다."
        />
        <View style={styles.listRow}>
          <Text style={styles.listTitle}>포트폴리오 공개 범위</Text>
          <Text style={styles.listMeta}>{visibilityLabel(profile.data.portfolioVisibility)}</Text>
        </View>
        <View style={styles.listRow}>
          <Text style={styles.listTitle}>수익 공개 범위</Text>
          <Text style={styles.listMeta}>{visibilityLabel(profile.data.returnVisibility)}</Text>
        </View>
        <View style={styles.listRow}>
          <Text style={styles.listTitle}>알림 미확인 수</Text>
          <Text style={styles.listMeta}>{notifications.data.unreadCount}개</Text>
        </View>
        <View style={styles.actionStack}>
          <PrimaryButton
            label="사람 찾기"
            onPress={() => navigation.navigate('People')}
            variant="secondary"
          />
          <PrimaryButton
            label="포트폴리오 직접 추가"
            onPress={() => navigation.navigate('PortfolioSetup')}
            variant="secondary"
          />
          <PrimaryButton
            label="KIS 연결 준비 상태"
            onPress={() => navigation.navigate('KisConnect')}
            variant="secondary"
          />
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeading
          title="리마인더"
          description="실제 등록된 정기 투자 리마인더입니다."
        />
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
        <SectionHeading
          title="알림"
          description="최근 알림만 미리 보여주고 전체 화면으로 이동할 수 있습니다."
        />
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
    </Page>
  );
}

const styles = StyleSheet.create({
  profileHeader: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
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
