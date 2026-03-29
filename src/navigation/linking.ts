import type { LinkingOptions } from '@react-navigation/native';

import {
  GROWTH_WIDGET_ROUTE,
  parseGrowthWidgetDeepLinkSource,
} from '../features/widgets/widgetDeepLinks';
import type { RootStackParamList } from './types';

export const appLinking: LinkingOptions<RootStackParamList> = {
  prefixes: ['folo://', 'exp+folo-client://'],
  config: {
    screens: {
      MainTabs: {
        screens: {
          Portfolio: {
            path: GROWTH_WIDGET_ROUTE,
            parse: {
              source: parseGrowthWidgetDeepLinkSource,
            },
          },
        },
      },
    },
  },
};
