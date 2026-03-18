import type { NavigatorScreenParams } from '@react-navigation/native';

export type MainTabParamList = {
  Home: undefined;
  Feed: undefined;
  AddTrade: undefined;
  Portfolio: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Onboarding: undefined;
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  TradeDetail: { tradeId: number };
  HoldingDetail: { holdingId: number };
  Notifications: undefined;
  Reminders: undefined;
  ProfileEdit: undefined;
};
