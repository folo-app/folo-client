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
