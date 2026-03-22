import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { foloApi } from '../api/services';
import { DataStatusCard } from '../components/DataStatusCard';
import {
  Chip,
  Page,
  PageBackButton,
  PrimaryButton,
  SectionHeading,
  SurfaceCard,
} from '../components/ui';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import { useNotificationsData } from '../hooks/useFoloData';
import { formatDateLabel, notificationLabel } from '../lib/format';
import { tokens } from '../theme/tokens';

export function NotificationsScreen() {
  const notifications = useNotificationsData();
  const { isCompact } = useResponsiveLayout();
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [markingAll, setMarkingAll] = useState(false);

  async function handleMarkAllRead() {
    setMarkingAll(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      await foloApi.markAllNotificationsRead();
      notifications.refresh();
      setActionSuccess('모든 알림을 읽음 처리했습니다.');
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : '알림 읽음 처리에 실패했습니다.',
      );
    } finally {
      setMarkingAll(false);
    }
  }

  async function handleMarkRead(notificationId: number) {
    setPendingId(notificationId);
    setActionError(null);
    setActionSuccess(null);

    try {
      await foloApi.markNotificationRead(notificationId);
      notifications.refresh();
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : '알림 읽음 처리에 실패했습니다.',
      );
    } finally {
      setPendingId(null);
    }
  }

  return (
    <Page
      eyebrow="Notifications"
      title="알림"
      leading={<PageBackButton />}
      action={
        notifications.data.unreadCount > 0 ? (
          <PrimaryButton
            label={markingAll ? '처리 중...' : '전체 읽음'}
            onPress={handleMarkAllRead}
            variant="secondary"
            disabled={markingAll}
          />
        ) : undefined
      }
    >
      <DataStatusCard
        error={notifications.error ?? actionError}
        loading={notifications.loading || markingAll || pendingId !== null}
      />

      {actionSuccess ? <Text style={styles.feedback}>{actionSuccess}</Text> : null}

      <SurfaceCard tone="hero">
        <Text style={styles.heroValue}>{notifications.data.unreadCount}개</Text>
        <Text style={styles.heroLabel}>읽지 않은 알림</Text>
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeading title="전체 알림" />
        {notifications.data.notifications.length === 0 ? (
          <Text style={styles.emptyText}>표시할 알림이 없습니다.</Text>
        ) : (
          notifications.data.notifications.map((item, index) => (
            <Pressable
              key={item.notificationId}
              disabled={item.isRead || pendingId === item.notificationId}
              onPress={() => {
                if (!item.isRead) {
                  handleMarkRead(item.notificationId);
                }
              }}
              style={[
                styles.item,
                isCompact && styles.itemCompact,
                !item.isRead && styles.itemUnread,
                index < notifications.data.notifications.length - 1 && styles.divider,
              ]}
            >
              <View style={[styles.row, isCompact && styles.rowCompact]}>
                <Text style={styles.type}>{notificationLabel(item.type)}</Text>
                <Chip
                  label={
                    pendingId === item.notificationId
                      ? '처리 중'
                      : item.isRead
                        ? '읽음'
                        : '미읽음'
                  }
                  tone={item.isRead ? 'default' : 'brand'}
                />
              </View>
              <Text style={styles.message}>{item.message}</Text>
              <Text style={styles.time}>{formatDateLabel(item.createdAt)}</Text>
            </Pressable>
          ))
        )}
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
    borderRadius: 18,
    paddingHorizontal: 2,
    paddingVertical: 2,
  },
  itemCompact: {
    gap: 10,
  },
  itemUnread: {
    backgroundColor: 'rgba(233, 240, 255, 0.52)',
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
  rowCompact: {
    alignItems: 'flex-start',
    flexDirection: 'column',
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
  emptyText: {
    fontSize: 14,
    lineHeight: 22,
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.body,
  },
  feedback: {
    fontSize: 13,
    color: tokens.colors.brandStrong,
    fontFamily: tokens.typography.body,
  },
});
