import assert from 'node:assert/strict';
import test from 'node:test';

import { buildNextRoutineWidgetSnapshot } from './buildNextRoutineWidgetSnapshot';

test('buildNextRoutineWidgetSnapshot returns setup placeholder when there are no reminders', () => {
  const snapshot = buildNextRoutineWidgetSnapshot({
    sourceData: { reminders: [] },
    referenceDate: new Date('2026-04-03T12:00:00Z'),
    generatedAt: new Date('2026-04-03T12:00:00Z'),
  });

  assert.equal(snapshot.status, 'SETUP');
  assert.equal(snapshot.headline, '루틴을 등록하세요');
  assert.equal(snapshot.activeCount, 0);
  assert.equal(
    snapshot.deepLinkUrl,
    'folo://widget/next-routine?source=widget-routine',
  );
});

test('buildNextRoutineWidgetSnapshot picks the nearest active reminder', () => {
  const snapshot = buildNextRoutineWidgetSnapshot({
    sourceData: {
      reminders: [
        {
          reminderId: 2,
          ticker: 'AAPL',
          name: 'Apple',
          amount: 500,
          dayOfMonth: 25,
          isActive: true,
          nextReminderDate: '2026-04-25T00:00:00Z',
        },
        {
          reminderId: 1,
          ticker: 'NVDA',
          name: 'NVIDIA',
          amount: 100000,
          dayOfMonth: 10,
          isActive: true,
          nextReminderDate: '2026-04-10T00:00:00Z',
        },
      ],
    },
    referenceDate: new Date('2026-04-03T12:00:00Z'),
    generatedAt: new Date('2026-04-03T12:00:00Z'),
  });

  assert.equal(snapshot.status, 'ACTIVE');
  assert.equal(snapshot.subheadline, 'NVDA · NVIDIA');
  assert.equal(snapshot.activeCount, 2);
  assert.match(snapshot.headline, /4월 10일/);
});

test('buildNextRoutineWidgetSnapshot falls back to paused when reminders exist but are inactive', () => {
  const snapshot = buildNextRoutineWidgetSnapshot({
    sourceData: {
      reminders: [
        {
          reminderId: 7,
          ticker: 'TSLA',
          name: 'Tesla',
          amount: 300,
          dayOfMonth: 15,
          isActive: false,
          nextReminderDate: '2026-04-15T00:00:00Z',
        },
      ],
    },
    referenceDate: new Date('2026-04-03T12:00:00Z'),
    generatedAt: new Date('2026-04-03T12:00:00Z'),
  });

  assert.equal(snapshot.status, 'PAUSED');
  assert.equal(snapshot.headline, '중지된 루틴');
  assert.equal(snapshot.footerCopy, '루틴을 다시 켜 두세요');
});
