import assert from 'node:assert/strict';
import test from 'node:test';

import {
  GROWTH_WIDGET_ROUTE,
  NEXT_ROUTINE_WIDGET_ROUTE,
  getGrowthWidgetDeepLink,
  getNextRoutineWidgetDeepLink,
  parseGrowthWidgetDeepLink,
  parseNextRoutineWidgetDeepLink,
} from './widgetDeepLinks';

test('getGrowthWidgetDeepLink returns the native widget route', () => {
  assert.equal(getGrowthWidgetDeepLink(), `folo://${GROWTH_WIDGET_ROUTE}`);
});

test('getGrowthWidgetDeepLink includes the widget source query param', () => {
  assert.equal(
    getGrowthWidgetDeepLink({ source: 'widget-growth' }),
    `folo://${GROWTH_WIDGET_ROUTE}?source=widget-growth`,
  );
});

test('parseGrowthWidgetDeepLink matches the growth widget path with or without scheme', () => {
  assert.deepEqual(parseGrowthWidgetDeepLink('widget/growth-streak'), {});
  assert.deepEqual(parseGrowthWidgetDeepLink('/widget/growth-streak'), {});
  assert.deepEqual(parseGrowthWidgetDeepLink('folo://widget/growth-streak'), {});
});

test('parseGrowthWidgetDeepLink keeps the allowed widget source only', () => {
  assert.deepEqual(
    parseGrowthWidgetDeepLink('folo://widget/growth-streak?source=widget-growth'),
    { source: 'widget-growth' },
  );
  assert.deepEqual(
    parseGrowthWidgetDeepLink('folo://widget/growth-streak?source=unknown'),
    {},
  );
});

test('parseGrowthWidgetDeepLink ignores unrelated paths', () => {
  assert.equal(parseGrowthWidgetDeepLink('folo://kis/callback'), null);
  assert.equal(parseGrowthWidgetDeepLink('widget/other'), null);
});

test('getNextRoutineWidgetDeepLink returns the native widget route', () => {
  assert.equal(getNextRoutineWidgetDeepLink(), `folo://${NEXT_ROUTINE_WIDGET_ROUTE}`);
});

test('getNextRoutineWidgetDeepLink includes the widget source query param', () => {
  assert.equal(
    getNextRoutineWidgetDeepLink({ source: 'widget-routine' }),
    `folo://${NEXT_ROUTINE_WIDGET_ROUTE}?source=widget-routine`,
  );
});

test('parseNextRoutineWidgetDeepLink matches the routine widget path with or without scheme', () => {
  assert.deepEqual(parseNextRoutineWidgetDeepLink('widget/next-routine'), {});
  assert.deepEqual(parseNextRoutineWidgetDeepLink('/widget/next-routine'), {});
  assert.deepEqual(parseNextRoutineWidgetDeepLink('folo://widget/next-routine'), {});
});

test('parseNextRoutineWidgetDeepLink keeps the allowed widget source only', () => {
  assert.deepEqual(
    parseNextRoutineWidgetDeepLink('folo://widget/next-routine?source=widget-routine'),
    { source: 'widget-routine' },
  );
  assert.deepEqual(
    parseNextRoutineWidgetDeepLink('folo://widget/next-routine?source=unknown'),
    {},
  );
});
