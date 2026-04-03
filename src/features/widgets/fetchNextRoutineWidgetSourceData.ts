import { foloApi } from '../../api/services';
import type {
  NextRoutineWidgetSourceData,
  NextRoutineWidgetSourceReminder,
} from './types';

type NextRoutineWidgetRemindersApi = {
  getReminders(): Promise<{
    reminders: NextRoutineWidgetSourceReminder[];
  }>;
};

export async function fetchNextRoutineWidgetSourceData(
  api: NextRoutineWidgetRemindersApi = foloApi,
): Promise<NextRoutineWidgetSourceData> {
  const response = await api.getReminders();

  return {
    reminders: response.reminders.map((item) => ({
      reminderId: item.reminderId,
      ticker: item.ticker,
      name: item.name,
      amount: item.amount,
      dayOfMonth: item.dayOfMonth,
      isActive: item.isActive,
      nextReminderDate: item.nextReminderDate,
    })),
  };
}
