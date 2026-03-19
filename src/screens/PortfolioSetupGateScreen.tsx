import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { foloApi } from '../api/services';
import { useAuth } from '../auth/AuthProvider';
import { PrimaryButton, SurfaceCard } from '../components/ui';
import type { RootStackParamList } from '../navigation/types';
import { tokens } from '../theme/tokens';

export function PortfolioSetupGateScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let alive = true;

    async function checkPortfolioEntry() {
      setLoading(true);
      setError(null);

      try {
        const [portfolio, tradeList] = await Promise.all([
          foloApi.getPortfolio(),
          foloApi.getMyTrades({ page: 0, size: 1 }),
        ]);

        if (!alive) {
          return;
        }

        const needsPortfolioSetup =
          portfolio.holdings.length === 0 && tradeList.totalCount === 0;

        navigation.reset({
          index: 0,
          routes: [
            needsPortfolioSetup
              ? { name: 'PortfolioSetup' }
              : { name: 'MainTabs', params: { screen: 'Home' } },
          ],
        });
      } catch (reason) {
        if (!alive) {
          return;
        }
        setError(
          reason instanceof Error
            ? reason.message
            : '포트폴리오 상태를 확인하지 못했습니다.',
        );
        setLoading(false);
      }
    }

    checkPortfolioEntry();

    return () => {
      alive = false;
    };
  }, [navigation]);

  async function handleLogout() {
    setLoggingOut(true);

    try {
      await signOut();
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <View style={styles.shell}>
        <SurfaceCard tone="hero">
          <Text style={styles.eyebrow}>Portfolio Setup</Text>
          <Text style={styles.title}>첫 포트폴리오를 확인하고 있습니다</Text>
          <Text style={styles.subtitle}>
            거래 기록과 보유 종목이 비어 있으면 메인 화면 대신 초기 포트폴리오
            추가 화면으로 바로 연결합니다.
          </Text>

          {loading ? (
            <View style={styles.loaderRow}>
              <ActivityIndicator color={tokens.colors.brandStrong} size="small" />
              <Text style={styles.loaderText}>포트폴리오 상태 확인 중</Text>
            </View>
          ) : null}

          {error ? (
            <View style={styles.errorBlock}>
              <Text style={styles.errorText}>{error}</Text>
              <PrimaryButton
                label="다시 확인"
                onPress={() => {
                  setLoading(true);
                  setError(null);
                  navigation.replace('PortfolioSetupGate');
                }}
              />
              <PrimaryButton
                disabled={loggingOut}
                label={loggingOut ? '로그아웃 중...' : '로그아웃'}
                onPress={handleLogout}
                variant="secondary"
              />
            </View>
          ) : null}
        </SurfaceCard>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: tokens.colors.canvas,
  },
  shell: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    width: '100%',
    maxWidth: tokens.layout.maxWidth,
    alignSelf: 'center',
  },
  eyebrow: {
    fontSize: 12,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: tokens.colors.brandStrong,
    fontFamily: tokens.typography.heading,
    fontWeight: '700',
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 24,
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.body,
  },
  loaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  loaderText: {
    fontSize: 14,
    color: tokens.colors.brandStrong,
    fontFamily: tokens.typography.body,
  },
  errorBlock: {
    gap: 12,
  },
  errorText: {
    fontSize: 14,
    lineHeight: 22,
    color: tokens.colors.danger,
    fontFamily: tokens.typography.body,
  },
});
