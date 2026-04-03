import type { NavigatorScreenParams } from '@react-navigation/native';
import type { MarketType } from '../api/contracts';
import type { QaHarnessScenario } from './qa';

export type PortfolioSetupSelection = {
  ticker: string;
  name: string;
  market: MarketType;
  currentPrice: number;
};

export type MainTabParamList = {
  Home: undefined;
  Feed:
    | {
        qaAutoLoadMore?: boolean;
      }
    | undefined;
  Portfolio:
    | {
        source?: 'widget-growth';
      }
    | undefined;
  Profile:
    | {
        qaShareOnOpen?: boolean;
      }
    | undefined;
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
  CreationHub: undefined;
  QaHarness: {
    scenario: QaHarnessScenario;
  };
  ReminderCreate: undefined;
  AddTrade: undefined;
  AddTradeReview: {
    selection: PortfolioSetupSelection;
  };
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  TradeDetail: {
    tradeId: number;
    source?: 'notification';
  };
  HoldingDetail: { holdingId: number };
  Notifications: undefined;
  Reminders:
    | {
        source?: 'notification' | 'widget-routine';
      }
    | undefined;
  ProfileEdit: undefined;
  People: undefined;
  UserProfile: {
    userId: number;
    nickname?: string;
    source?: 'notification' | 'profile-share';
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
