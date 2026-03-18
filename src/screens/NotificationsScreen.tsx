import { StyleSheet, Text, View } from 'react-native';

import { DataStatusCard } from '../components/DataStatusCard';
import { Chip, Page, SectionHeading, SurfaceCard } from '../components/ui';
import { useNotificationsData } from '../hooks/useFoloData';
import { formatDateLabel, notificationLabel } from '../lib/format';
import { tokens } from '../theme/tokens';

export function NotificationsScreen() {
  const notifications = useNotificationsData();

  return (
    <Page
      eyebrow="Notifications"
      title="알림 상세 화면"
      subtitle="프로필 프리뷰에서 잘려 나가던 알림 목록을 별도 화면으로 분리했습니다."
      action={
        <Chip
          active
          label={notifications.source === 'api' ? 'API 연결' : '샘플 데이터'}
          tone={notifications.source === 'api' ? 'positive' : 'brand'}
        />
      }
    >
      <DataStatusCard
        error={notifications.error}
        loading={notifications.loading}
        source={notifications.source}
      />

      <SurfaceCard tone="hero">
        <Text style={styles.heroValue}>{notifications.data.unreadCount}개</Text>
        <Text style={styles.heroLabel}>읽지 않은 알림</Text>
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeading
          title="전체 알림"
          description="NotificationListResponse를 그대로 표시합니다."
        />
        {notifications.data.notifications.map((item, index) => (
          <View
            key={item.notificationId}
            style={[
              styles.item,
              index < notifications.data.notifications.length - 1 && styles.divider,
            ]}
          >
            <View style={styles.row}>
              <Text style={styles.type}>{notificationLabel(item.type)}</Text>
              <Chip
                label={item.isRead ? '읽음' : '미읽음'}
                tone={item.isRead ? 'default' : 'brand'}
              />
            </View>
            <Text style={styles.message}>{item.message}</Text>
            <Text style={styles.time}>{formatDateLabel(item.createdAt)}</Text>
          </View>
        ))}
      </SurfaceCard>
    </Page>
  );
}

const styles = StyleSheet.create({
  heroValue: {
    fontSize: 32,
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontWeight: '800',
  },
  heroLabel: {
    fontSize: 14,
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.body,
  },
  item: {
    gap: 8,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(214, 224, 234, 0.8)',
    paddingBottom: 16,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'center',
  },
  type: {
    fontSize: 14,
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontWeight: '700',
  },
  message: {
    fontSize: 14,
    lineHeight: 22,
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.body,
  },
  time: {
    fontSize: 12,
    color: tokens.colors.inkMute,
    fontFamily: tokens.typography.body,
  },
});
