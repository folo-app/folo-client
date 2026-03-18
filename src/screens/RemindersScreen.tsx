import { StyleSheet, Text, View } from 'react-native';

import { DataStatusCard } from '../components/DataStatusCard';
import { Chip, Page, SectionHeading, SurfaceCard } from '../components/ui';
import { useRemindersData } from '../hooks/useFoloData';
import { formatCurrency } from '../lib/format';
import { tokens } from '../theme/tokens';

export function RemindersScreen() {
  const reminders = useRemindersData();

  return (
    <Page
      eyebrow="Reminders"
      title="리마인더 상세 화면"
      subtitle="프로필 카드에 들어가던 리마인더 미리보기를 관리 화면으로 분리했습니다."
      action={
        <Chip
          active
          label={reminders.source === 'api' ? 'API 연결' : '샘플 데이터'}
          tone={reminders.source === 'api' ? 'positive' : 'brand'}
        />
      }
    >
      <DataStatusCard error={reminders.error} loading={reminders.loading} source={reminders.source} />

      <SurfaceCard>
        <SectionHeading
          title="활성 리마인더"
          description={`총 ${reminders.data.reminders.length}개`}
        />
        {reminders.data.reminders.map((reminder, index) => (
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
              label={reminder.isActive ? '활성' : '비활성'}
              tone={reminder.isActive ? 'positive' : 'default'}
            />
          </View>
        ))}
      </SurfaceCard>
    </Page>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'center',
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
});
