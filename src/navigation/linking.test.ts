import assert from 'node:assert/strict';
import test from 'node:test';

import { getStateFromPath } from '@react-navigation/core';

import { appLinking } from './linking';

test('appLinking routes growth widget deep links to the Portfolio tab', () => {
  const state = getStateFromPath('widget/growth-streak?source=widget-growth', appLinking.config);

  assert.ok(state);

  const mainTabsRoute = state.routes[0] as
    | {
        name: string;
        state?: {
          routes: Array<{ name: string; params?: Record<string, unknown> }>;
        };
      }
    | undefined;

  assert.equal(mainTabsRoute?.name, 'MainTabs');
  assert.equal(mainTabsRoute?.state?.routes[0]?.name, 'Portfolio');
  assert.deepEqual(mainTabsRoute?.state?.routes[0]?.params, {
    source: 'widget-growth',
  });
});

test('appLinking routes next routine widget deep links to the reminders screen', () => {
  const state = getStateFromPath('widget/next-routine?source=widget-routine', appLinking.config);

  assert.ok(state);
  assert.equal(state.routes[0]?.name, 'Reminders');
  assert.deepEqual(state.routes[0]?.params, {
    source: 'widget-routine',
  });
});

test('appLinking routes profile deep links to the user profile screen', () => {
  const state = getStateFromPath('users/42?source=profile-share', appLinking.config);

  assert.ok(state);
  assert.equal(state.routes[0]?.name, 'UserProfile');
  assert.deepEqual(state.routes[0]?.params, {
    userId: 42,
    source: 'profile-share',
  });
});

test('appLinking routes trade deep links to the trade detail screen', () => {
  const state = getStateFromPath('trades/18?source=notification', appLinking.config);

  assert.ok(state);
  assert.equal(state.routes[0]?.name, 'TradeDetail');
  assert.deepEqual(state.routes[0]?.params, {
    tradeId: 18,
    source: 'notification',
  });
});

test('appLinking routes the feed tab deep link to the main tabs navigator', () => {
  const state = getStateFromPath('feed', appLinking.config);

  assert.ok(state);

  const mainTabsRoute = state.routes[0] as
    | {
        name: string;
        state?: {
          routes: Array<{ name: string; params?: Record<string, unknown> }>;
        };
      }
    | undefined;

  assert.equal(mainTabsRoute?.name, 'MainTabs');
  assert.equal(mainTabsRoute?.state?.routes[0]?.name, 'Feed');
});

test('appLinking routes notifications deep links to the notifications screen', () => {
  const state = getStateFromPath('notifications', appLinking.config);

  assert.ok(state);
  assert.equal(state.routes[0]?.name, 'Notifications');
});

test('appLinking routes QA widget harness deep links', () => {
  const state = getStateFromPath('qa/widgets', appLinking.config);

  assert.ok(state);
  assert.equal(state.routes[0]?.name, 'QaHarness');
  assert.deepEqual(state.routes[0]?.params, {
    scenario: 'widgets',
  });
});

test('appLinking routes QA feed pagination deep links', () => {
  const state = getStateFromPath('qa/feed-pagination', appLinking.config);

  assert.ok(state);
  assert.equal(state.routes[0]?.name, 'QaHarness');
  assert.deepEqual(state.routes[0]?.params, {
    scenario: 'feed-pagination',
  });
});

test('appLinking routes QA profile share deep links', () => {
  const state = getStateFromPath('qa/profile-share', appLinking.config);

  assert.ok(state);
  assert.equal(state.routes[0]?.name, 'QaHarness');
  assert.deepEqual(state.routes[0]?.params, {
    scenario: 'profile-share',
  });
});

test('appLinking routes QA review deep links through the internal harness', () => {
  const addTradeReview = getStateFromPath('qa/trade-review', appLinking.config);
  const portfolioSetupReview = getStateFromPath(
    'qa/portfolio-setup-review',
    appLinking.config,
  );

  assert.ok(addTradeReview);
  assert.ok(portfolioSetupReview);
  assert.equal(addTradeReview.routes[0]?.name, 'QaHarness');
  assert.deepEqual(addTradeReview.routes[0]?.params, {
    scenario: 'trade-review',
  });
  assert.equal(portfolioSetupReview.routes[0]?.name, 'QaHarness');
  assert.deepEqual(portfolioSetupReview.routes[0]?.params, {
    scenario: 'portfolio-setup-review',
  });
});
