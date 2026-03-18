import {
  DefaultTheme,
  NavigationContainer,
  type Theme,
} from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { BottomNav } from '../components/BottomNav';
import { AddTradeScreen } from '../screens/AddTradeScreen';
import { FeedScreen } from '../screens/FeedScreen';
import { HoldingDetailScreen } from '../screens/HoldingDetailScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { PortfolioScreen } from '../screens/PortfolioScreen';
import { ProfileEditScreen } from '../screens/ProfileEditScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { RemindersScreen } from '../screens/RemindersScreen';
import { TradeDetailScreen } from '../screens/TradeDetailScreen';
import { tokens } from '../theme/tokens';
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

export function AppNavigator() {
  return (
    <SafeAreaProvider>
      <NavigationContainer theme={navigationTheme}>
        <Stack.Navigator
          initialRouteName="Onboarding"
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: tokens.colors.canvas },
          }}
        >
          <Stack.Screen component={OnboardingScreen} name="Onboarding" />
          <Stack.Screen component={MainTabsNavigator} name="MainTabs" />
          <Stack.Screen component={TradeDetailScreen} name="TradeDetail" />
          <Stack.Screen component={HoldingDetailScreen} name="HoldingDetail" />
          <Stack.Screen component={NotificationsScreen} name="Notifications" />
          <Stack.Screen component={RemindersScreen} name="Reminders" />
          <Stack.Screen component={ProfileEditScreen} name="ProfileEdit" />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
