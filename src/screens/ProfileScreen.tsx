import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';

import { DataStatusCard } from '../components/DataStatusCard';
import { Chip, Page, PrimaryButton, SectionHeading, SurfaceCard } from '../components/ui';
import { blueprintSections } from '../data/mock';
import { useMyProfileData, useNotificationsData, useRemindersData } from '../hooks/useFoloData';
import {
  formatCurrency,
  formatRelativeDate,
  notificationLabel,
  visibilityLabel,
} from '../lib/format';
import type { RootStackParamList } from '../navigation/types';
import { tokens } from '../theme/tokens';

export function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const profile = useMyProfileData();
  const notifications = useNotificationsData();
  const reminders = useRemindersData();

  const isApiConnected =
    profile.source === 'api' &&
    notifications.source === 'api' &&
    reminders.source === 'api';

  return (
    <Page
      eyebrow="Profile"
      title="내 기록과 공개 범위"
      subtitle="프로필, 리마인더, 알림, 그리고 앞으로 구현할 화면 설계 보드를 한 곳에 모아 프론트엔드 작업 기준점을 만들었습니다."
      action={
        <Chip
          active
          label={isApiConnected ? 'API 연결' : '샘플 데이터'}
          tone={isApiConnected ? 'positive' : 'brand'}
        />
      }
    >
      <DataStatusCard
        error={profile.error ?? reminders.error ?? notifications.error}
        loading={profile.loading || reminders.loading || notifications.loading}
        source={isApiConnected ? 'api' : 'fallback'}
      />

      <SurfaceCard tone="hero">
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{profile.data.nickname.slice(0, 1)}</Text>
          </View>
          <View style={styles.profileText}>
            <Text style={styles.name}>{profile.data.nickname}</Text>
            <Text style={styles.handle}>가입일 {formatRelativeDate(profile.data.createdAt)}</Text>
            <Text style={styles.bio}>{profile.data.bio ?? '바이오가 아직 없습니다.'}</Text>
          </View>
        </View>
        <View style={styles.metaRow}>
          <Chip active label={`팔로워 ${profile.data.followerCount}`} tone="brand" />
          <Chip label={`팔로잉 ${profile.data.followingCount}`} />
          <Chip label={visibilityLabel(profile.data.portfolioVisibility)} />
        </View>
        <PrimaryButton
          label="프로필 편집"
          onPress={() => navigation.navigate('ProfileEdit')}
          variant="secondary"
        />
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeading
          title="리마인더"
          description="ReminderSetupScreen과 알림 탭으로 이어질 설정 정보입니다."
        />
        {reminders.data.reminders.slice(0, 2).map((reminder, index) => (
          <View
            key={reminder.reminderId}
            style={[
              styles.listRow,
              index < reminders.data.reminders.slice(0, 2).length - 1 && styles.divider,
            ]}
          >
            <Text style={styles.listTitle}>
              {reminder.ticker} · {reminder.name}
            </Text>
            <Text style={styles.listMeta}>
              매월 {reminder.dayOfMonth}일 · {formatCurrency(reminder.amount)}
            </Text>
          </View>
        ))}
        <PrimaryButton
          label="리마인더 전체 보기"
          onPress={() => navigation.navigate('Reminders')}
          variant="secondary"
        />
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeading
          title="알림"
          description="NOTIFICATION 기능군에서 가장 먼저 다룰 핵심 알림 패턴을 미리 넣었습니다."
        />
        {notifications.data.notifications.slice(0, 2).map((item, index) => (
          <View
            key={item.notificationId}
            style={[
              styles.listRow,
              index < notifications.data.notifications.slice(0, 2).length - 1 &&
                styles.divider,
            ]}
          >
            <Text style={styles.listTitle}>
              {notificationLabel(item.type)} · {item.message}
            </Text>
            <Text style={styles.listMeta}>{formatRelativeDate(item.createdAt)}</Text>
          </View>
        ))}
        <PrimaryButton
          label="알림 전체 보기"
          onPress={() => navigation.navigate('Notifications')}
          variant="secondary"
        />
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeading
          title="화면 설계 보드"
          description="기획서의 전체 화면 목록을 프론트엔드 작업 단위로 다시 정리한 보드입니다."
        />
        {blueprintSections.map((section) => (
          <View key={section.label} style={styles.blueprintBlock}>
            <Text style={styles.blueprintLabel}>{section.label}</Text>
            <View style={styles.blueprintChips}>
              {section.screens.map((screen) => (
                <Chip key={`${section.label}-${screen}`} label={screen} />
              ))}
            </View>
          </View>
        ))}
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
  blueprintBlock: {
    gap: 10,
  },
  blueprintLabel: {
    fontSize: 16,
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontWeight: '800',
  },
  blueprintChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
});
