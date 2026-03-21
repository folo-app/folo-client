import type { NavigatorScreenParams } from '@react-navigation/native';
import type { MarketType } from '../api/contracts';

export type PortfolioSetupSelection = {
  ticker: string;
  name: string;
  market: MarketType;
  currentPrice: number;
};

export type MainTabParamList = {
  Home: undefined;
  Feed: undefined;
  AddTrade: undefined;
  Portfolio: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Login:
    | {
        email?: string;
        notice?: string;
      }
    | undefined;
  Signup: undefined;
  EmailVerification:
    | {
        email?: string;
        nickname?: string;
      }
    | undefined;
  RecoverLoginId: undefined;
  PasswordResetRequest:
    | {
        email?: string;
      }
    | undefined;
  PortfolioSetupGate: undefined;
  PortfolioSetup: undefined;
  PortfolioSetupReview: {
    selections: PortfolioSetupSelection[];
  };
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  TradeDetail: { tradeId: number };
  HoldingDetail: { holdingId: number };
  Notifications: undefined;
  Reminders: undefined;
  ProfileEdit: undefined;
  People: undefined;
  UserProfile: {
    userId: number;
    nickname?: string;
  };
  UserFeed: {
    userId: number;
    nickname?: string;
  };
  PublicPortfolio: {
    userId: number;
    nickname?: string;
  };
  KisConnect: undefined;
  ImportOnboarding: undefined;
};
