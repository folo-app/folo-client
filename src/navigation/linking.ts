import type { LinkingOptions } from '@react-navigation/native';

import {
  GROWTH_WIDGET_ROUTE,
  NEXT_ROUTINE_WIDGET_ROUTE,
  parseGrowthWidgetDeepLinkSource,
  parseRoutineWidgetDeepLinkSource,
} from '../features/widgets/widgetDeepLinks';
import {
  parseNotificationDeepLinkSource,
  parseUserProfileDeepLinkSource,
  TRADE_DETAIL_ROUTE,
  USER_PROFILE_ROUTE,
} from './deepLinks';
import { parseQaHarnessScenario, QA_HARNESS_ROUTE } from './qa';
import type { RootStackParamList } from './types';

export const appLinking: LinkingOptions<RootStackParamList> = {
  prefixes: ['folo://', 'exp+folo-client://'],
  config: {
    screens: {
      CreationHub: 'create',
      QaHarness: {
        path: `${QA_HARNESS_ROUTE}/:scenario`,
        parse: {
          scenario: parseQaHarnessScenario,
        },
      },
      ReminderCreate: 'routines/new',
      AddTrade: 'trades/new',
      TradeDetail: {
        path: `${TRADE_DETAIL_ROUTE}/:tradeId`,
        parse: {
          tradeId: (value: string) => Number(value),
          source: parseNotificationDeepLinkSource,
        },
      },
      Notifications: 'notifications',
      UserProfile: {
        path: `${USER_PROFILE_ROUTE}/:userId`,
        parse: {
          userId: (value: string) => Number(value),
          source: parseUserProfileDeepLinkSource,
        },
      },
      Reminders: {
        path: NEXT_ROUTINE_WIDGET_ROUTE,
        parse: {
          source: parseRoutineWidgetDeepLinkSource,
        },
      },
      MainTabs: {
        screens: {
          Home: 'home',
          Feed: 'feed',
          Portfolio: {
            path: GROWTH_WIDGET_ROUTE,
            parse: {
              source: parseGrowthWidgetDeepLinkSource,
            },
          },
          Profile: 'profile',
        },
      },
    },
  },
};
