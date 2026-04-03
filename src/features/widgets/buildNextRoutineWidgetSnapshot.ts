import { formatCurrency } from '../../lib/format';
import { getNextRoutineWidgetDeepLink } from './widgetDeepLinks';
import type {
  NextRoutineWidgetSnapshot,
  NextRoutineWidgetSourceData,
  NextRoutineWidgetSourceReminder,
  NextRoutineWidgetStatus,
} from './types';

export type BuildNextRoutineWidgetSnapshotOptions = {
  sourceData: NextRoutineWidgetSourceData;
  referenceDate?: Date;
  generatedAt?: Date;
};

export function buildNextRoutineWidgetSnapshot({
  sourceData,
  referenceDate = new Date(),
  generatedAt = new Date(),
}: BuildNextRoutineWidgetSnapshotOptions): NextRoutineWidgetSnapshot {
  const activeReminders = sortReminders(sourceData.reminders.filter((item) => item.isActive));

  if (activeReminders.length > 0) {
    return buildSnapshot({
      reminder: activeReminders[0],
      status: 'ACTIVE',
      generatedAt,
      headline: `${formatReminderDate(activeReminders[0].nextReminderDate, referenceDate)} 체크`,
      footerCopy:
        activeReminders.length > 1
          ? `활성 루틴 ${activeReminders.length}개`
          : '다음 루틴을 확인하세요',
      activeCount: activeReminders.length,
    });
  }

  const pausedReminders = sortReminders(sourceData.reminders);

  if (pausedReminders.length > 0) {
    return buildSnapshot({
      reminder: pausedReminders[0],
      status: 'PAUSED',
      generatedAt,
      headline: '중지된 루틴',
      footerCopy:
        pausedReminders.length > 1
          ? `중지된 루틴 ${pausedReminders.length}개`
          : '루틴을 다시 켜 두세요',
      activeCount: 0,
    });
  }

  return {
    schemaVersion: 1,
    generatedAt: generatedAt.toISOString(),
    deepLinkUrl: getNextRoutineWidgetDeepLink({ source: 'widget-routine' }),
    title: 'Next Routine',
    status: 'SETUP',
    headline: '루틴을 등록하세요',
    subheadline: 'Creation Hub에서 일정과 금액을 정합니다',
    amountLabel: '다음 루틴이 위젯에 표시됩니다',
    footerCopy: 'First-class routine',
    activeCount: 0,
    dayOfMonth: null,
  };
}

function buildSnapshot({
  reminder,
  status,
  generatedAt,
  headline,
  footerCopy,
  activeCount,
}: {
  reminder: NextRoutineWidgetSourceReminder;
  status: NextRoutineWidgetStatus;
  generatedAt: Date;
  headline: string;
  footerCopy: string;
  activeCount: number;
}): NextRoutineWidgetSnapshot {
  return {
    schemaVersion: 1,
    generatedAt: generatedAt.toISOString(),
    deepLinkUrl: getNextRoutineWidgetDeepLink({ source: 'widget-routine' }),
    title: 'Next Routine',
    status,
    headline,
    subheadline: `${reminder.ticker} · ${reminder.name}`,
    amountLabel: `매월 ${reminder.dayOfMonth}일 · ${formatCurrency(reminder.amount)}`,
    footerCopy,
    activeCount,
    dayOfMonth: reminder.dayOfMonth,
  };
}

function sortReminders(reminders: ReadonlyArray<NextRoutineWidgetSourceReminder>) {
  return [...reminders].sort((left, right) => {
    const dateDiff = parseReminderTime(left.nextReminderDate) - parseReminderTime(right.nextReminderDate);

    if (Number.isFinite(dateDiff) && dateDiff !== 0) {
      return dateDiff;
    }

    if (left.dayOfMonth !== right.dayOfMonth) {
      return left.dayOfMonth - right.dayOfMonth;
    }

    return left.reminderId - right.reminderId;
  });
}

function parseReminderTime(nextReminderDate: string) {
  const time = new Date(nextReminderDate).getTime();
  return Number.isFinite(time) ? time : Number.POSITIVE_INFINITY;
}

function formatReminderDate(nextReminderDate: string, fallbackDate: Date) {
  const parsed = new Date(nextReminderDate);
  const date = Number.isFinite(parsed.getTime()) ? parsed : fallbackDate;

  return new Intl.DateTimeFormat('ko-KR', {
    month: 'long',
    day: 'numeric',
  }).format(date);
}
