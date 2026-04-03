import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

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
import { syncAllWidgetsInBackground } from '../features/widgets';
import { useRemindersData } from '../hooks/useFoloData';
import { formatCurrency } from '../lib/format';
import type { RootStackParamList } from '../navigation/types';
import { tokens } from '../theme/tokens';

export function RemindersScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Reminders'>>();
  const reminders = useRemindersData();
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<number | null>(null);
  const sourceLabel =
    route.params?.source === 'widget-routine'
      ? '위젯에서 바로 다음 루틴을 열었습니다.'
      : route.params?.source === 'notification'
        ? '알림에서 바로 이어서 들어왔습니다.'
        : null;

  async function handleToggle(reminderId: number) {
    const reminder = reminders.data.reminders.find((item) => item.reminderId === reminderId);

    if (!reminder) {
      return;
    }

    setPendingId(reminderId);
    setActionError(null);
    setActionSuccess(null);

    try {
      await foloApi.updateReminder(reminderId, {
        amount: reminder.amount,
        dayOfMonth: reminder.dayOfMonth,
        isActive: !reminder.isActive,
      });
      syncAllWidgetsInBackground();
      reminders.refresh();
      setActionSuccess('리마인더를 업데이트했습니다.');
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : '리마인더 수정에 실패했습니다.',
      );
    } finally {
      setPendingId(null);
    }
  }

  async function handleDelete(reminderId: number) {
    setPendingId(reminderId);
    setActionError(null);
    setActionSuccess(null);

    try {
      await foloApi.deleteReminder(reminderId);
      syncAllWidgetsInBackground();
      reminders.refresh();
      setActionSuccess('리마인더를 삭제했습니다.');
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : '리마인더 삭제에 실패했습니다.',
      );
    } finally {
      setPendingId(null);
    }
  }

  return (
    <Page
      eyebrow="Reminders"
      title="리마인더"
      leading={<PageBackButton />}
      action={
        <PrimaryButton
          label="루틴 등록"
          onPress={() => navigation.navigate('ReminderCreate')}
          variant="secondary"
        />
      }
    >
      <DataStatusCard
        error={reminders.error ?? actionError}
        loading={reminders.loading || pendingId !== null}
      />

      {sourceLabel ? <Text style={styles.feedback}>{sourceLabel}</Text> : null}
      {actionSuccess ? <Text style={styles.feedback}>{actionSuccess}</Text> : null}

      <SurfaceCard>
        <SectionHeading title="활성 리마인더" description={`총 ${reminders.data.reminders.length}개`} />
        {reminders.data.reminders.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>등록된 리마인더가 없습니다.</Text>
            <PrimaryButton
              label="첫 루틴 등록"
              onPress={() => navigation.navigate('ReminderCreate')}
            />
          </View>
        ) : (
          reminders.data.reminders.map((reminder, index) => (
            <View
              key={reminder.reminderId}
              style={[
                styles.row,
                index < reminders.data.reminders.length - 1 && styles.divider,
              ]}
            >
              <View style={styles.textBlock}>
                <Text style={styles.title}>
                  {reminder.ticker} · {reminder.name}
                </Text>
                <Text style={styles.subtitle}>
                  매월 {reminder.dayOfMonth}일 · {formatCurrency(reminder.amount)}
                </Text>
              </View>
              <Chip
                label={
                  pendingId === reminder.reminderId
                    ? '처리 중'
                    : reminder.isActive
                      ? '활성'
                      : '비활성'
                }
                tone={reminder.isActive ? 'positive' : 'default'}
              />
              <View style={styles.actionRow}>
                <Chip
                  label={reminder.isActive ? '중지' : '재개'}
                  onPress={() => handleToggle(reminder.reminderId)}
                />
                <Chip
                  label="삭제"
                  tone="danger"
                  onPress={() => handleDelete(reminder.reminderId)}
                />
              </View>
            </View>
          ))
        )}
      </SurfaceCard>
    </Page>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: 12,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(214, 224, 234, 0.8)',
    paddingBottom: 16,
    marginBottom: 16,
  },
  textBlock: {
    gap: 6,
    flex: 1,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  title: {
    fontSize: 15,
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontWeight: '700',
  },
  subtitle: {
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
  emptyState: {
    gap: 14,
  },
  feedback: {
    fontSize: 13,
    color: tokens.colors.brandStrong,
    fontFamily: tokens.typography.body,
  },
});
