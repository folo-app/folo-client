import type { NotificationItem } from '../api/contracts';
import { getTradeDetailDeepLink, getUserProfileDeepLink } from './deepLinks';
import type { RootStackParamList } from './types';

type NotificationNavigationTarget =
  | {
      name: 'TradeDetail';
      params: RootStackParamList['TradeDetail'];
      deepLink: string;
    }
  | {
      name: 'UserProfile';
      params: RootStackParamList['UserProfile'];
      deepLink: string;
    }
  | {
      name: 'Reminders';
      params: RootStackParamList['Reminders'];
      deepLink: null;
    }
  | {
      name: 'MainTabs';
      params: RootStackParamList['MainTabs'];
      deepLink: null;
    }
  | {
      name: 'People';
      params: RootStackParamList['People'];
      deepLink: null;
    };

export function resolveNotificationTarget(
  item: NotificationItem,
): NotificationNavigationTarget {
  switch (item.type) {
    case 'FOLLOW':
      if (item.targetId) {
        return {
          name: 'UserProfile',
          params: { userId: item.targetId, source: 'notification' },
          deepLink: getUserProfileDeepLink(item.targetId, 'notification'),
        };
      }

      return {
        name: 'People',
        params: undefined,
        deepLink: null,
      };
    case 'REACTION':
    case 'COMMENT':
      if (item.targetId) {
        return {
          name: 'TradeDetail',
          params: { tradeId: item.targetId, source: 'notification' },
          deepLink: getTradeDetailDeepLink(item.targetId, 'notification'),
        };
      }

      return {
        name: 'MainTabs',
        params: { screen: 'Feed' },
        deepLink: null,
      };
    case 'REMINDER':
      return {
        name: 'Reminders',
        params: { source: 'notification' },
        deepLink: null,
      };
    case 'NUDGE':
      return {
        name: 'MainTabs',
        params: { screen: 'Portfolio' },
        deepLink: null,
      };
  }
}
