import {
  DefaultTheme,
  NavigationContainer,
  type Theme,
} from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useAuth } from '../auth/AuthProvider';
import { BottomNav } from '../components/BottomNav';
import { AddTradeScreen } from '../screens/AddTradeScreen';
import { EmailVerificationScreen } from '../screens/EmailVerificationScreen';
import { FeedScreen } from '../screens/FeedScreen';
import { HoldingDetailScreen } from '../screens/HoldingDetailScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { ImportOnboardingScreen } from '../screens/ImportOnboardingScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { PasswordResetRequestScreen } from '../screens/PasswordResetRequestScreen';
import { PortfolioScreen } from '../screens/PortfolioScreen';
import { PortfolioSetupGateScreen } from '../screens/PortfolioSetupGateScreen';
import { PortfolioSetupReviewScreen } from '../screens/PortfolioSetupReviewScreen';
import { PortfolioSetupScreen } from '../screens/PortfolioSetupScreen';
import { PublicPortfolioScreen } from '../screens/PublicPortfolioScreen';
import { ProfileEditScreen } from '../screens/ProfileEditScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { RecoverLoginIdScreen } from '../screens/RecoverLoginIdScreen';
import { RemindersScreen } from '../screens/RemindersScreen';
import { PeopleScreen } from '../screens/PeopleScreen';
import { SignupScreen } from '../screens/SignupScreen';
import { SplashScreen } from '../screens/SplashScreen';
import { TradeDetailScreen } from '../screens/TradeDetailScreen';
import { UserFeedScreen } from '../screens/UserFeedScreen';
import { UserProfileScreen } from '../screens/UserProfileScreen';
import { KisConnectScreen } from '../screens/KisConnectScreen';
import { tokens } from '../theme/tokens';
import { appLinking } from './linking';
import type { MainTabParamList, RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<MainTabParamList>();

const routeToTab = {
  Home: 'home',
  Feed: 'feed',
  AddTrade: 'add',
  Portfolio: 'portfolio',
  Profile: 'profile',
} as const;

const tabToRoute = {
  home: 'Home',
  feed: 'Feed',
  add: 'AddTrade',
  portfolio: 'Portfolio',
  profile: 'Profile',
} as const;

const navigationTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: tokens.colors.canvas,
    card: tokens.colors.surface,
    primary: tokens.colors.navy,
    text: tokens.colors.navy,
    border: tokens.colors.line,
    notification: tokens.colors.brand,
  },
};

function MainTabsNavigator() {
  return (
    <Tabs.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={({ navigation, state }) => (
        <BottomNav
          activeTab={routeToTab[state.routeNames[state.index] as keyof MainTabParamList]}
          onChange={(tab) => navigation.navigate(tabToRoute[tab])}
        />
      )}
    >
      <Tabs.Screen component={HomeScreen} name="Home" />
      <Tabs.Screen component={FeedScreen} name="Feed" />
      <Tabs.Screen component={AddTradeScreen} name="AddTrade" />
      <Tabs.Screen component={PortfolioScreen} name="Portfolio" />
      <Tabs.Screen component={ProfileScreen} name="Profile" />
    </Tabs.Navigator>
  );
}

function RootNavigator() {
  const { status } = useAuth();

  return (
    <Stack.Navigator
      initialRouteName={status === 'authenticated' ? 'PortfolioSetupGate' : 'Login'}
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: tokens.colors.canvas },
      }}
    >
      {status === 'authenticated' ? (
        <>
          <Stack.Screen component={PortfolioSetupGateScreen} name="PortfolioSetupGate" />
          <Stack.Screen component={PortfolioSetupScreen} name="PortfolioSetup" />
          <Stack.Screen
            component={PortfolioSetupReviewScreen}
            name="PortfolioSetupReview"
          />
          <Stack.Screen component={MainTabsNavigator} name="MainTabs" />
          <Stack.Screen component={TradeDetailScreen} name="TradeDetail" />
          <Stack.Screen component={HoldingDetailScreen} name="HoldingDetail" />
          <Stack.Screen component={NotificationsScreen} name="Notifications" />
          <Stack.Screen component={RemindersScreen} name="Reminders" />
          <Stack.Screen component={ProfileEditScreen} name="ProfileEdit" />
          <Stack.Screen component={PeopleScreen} name="People" />
          <Stack.Screen component={UserProfileScreen} name="UserProfile" />
          <Stack.Screen component={UserFeedScreen} name="UserFeed" />
          <Stack.Screen component={PublicPortfolioScreen} name="PublicPortfolio" />
          <Stack.Screen component={KisConnectScreen} name="KisConnect" />
          <Stack.Screen
            component={ImportOnboardingScreen}
            name="ImportOnboarding"
          />
        </>
      ) : (
        <>
          <Stack.Screen component={LoginScreen} name="Login" />
          <Stack.Screen component={SignupScreen} name="Signup" />
          <Stack.Screen component={RecoverLoginIdScreen} name="RecoverLoginId" />
          <Stack.Screen
            component={PasswordResetRequestScreen}
            name="PasswordResetRequest"
          />
          <Stack.Screen
            component={EmailVerificationScreen}
            name="EmailVerification"
          />
        </>
      )}
    </Stack.Navigator>
  );
}

export function AppNavigator() {
  const { status } = useAuth();

  if (status === 'booting') {
    return (
      <SafeAreaProvider>
        <SplashScreen />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer linking={appLinking} theme={navigationTheme}>
        <RootNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
