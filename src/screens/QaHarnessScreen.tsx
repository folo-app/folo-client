import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ReactNode } from 'react';
import { useEffect, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { DataStatusCard } from '../components/DataStatusCard';
import {
  Page,
  PrimaryButton,
  SectionHeading,
  SurfaceCard,
} from '../components/ui';
import {
  buildGrowthWidgetSnapshot,
  buildNextRoutineWidgetSnapshot,
  syncAllWidgetsInBackground,
} from '../features/widgets';
import { useMyTradesData, useRemindersData } from '../hooks/useFoloData';
import {
  QA_ADD_TRADE_SELECTION,
  QA_PORTFOLIO_SETUP_SELECTIONS,
  type QaHarnessScenario,
} from '../navigation/qa';
import type { RootStackParamList } from '../navigation/types';
import { tokens } from '../theme/tokens';

const QA_SCENARIO_ITEMS: Array<{
  key: QaHarnessScenario;
  title: string;
  description: string;
}> = [
  {
    key: 'widgets',
    title: '위젯 프리뷰',
    description: '현재 스냅샷을 한 화면에서 보고 다시 저장합니다.',
  },
  {
    key: 'feed-pagination',
    title: '피드 페이지네이션',
    description: '자동 추가 로드가 반영된 피드 상태를 바로 엽니다.',
  },
  {
    key: 'profile-share',
    title: '프로필 공유',
    description: '공유 시트를 자동으로 열어 런타임 캡처를 돕습니다.',
  },
  {
    key: 'trade-review',
    title: '수동 거래 리뷰',
    description: '고정 fixture로 리뷰 화면을 재현합니다.',
  },
  {
    key: 'portfolio-setup-review',
    title: '초기 세팅 리뷰',
    description: '고정 fixture로 포트폴리오 세팅 리뷰를 재현합니다.',
  },
];

export function QaHarnessScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'QaHarness'>>();
  const reminders = useRemindersData();
  const myTrades = useMyTradesData();
  const scenario = route.params.scenario;

  const growthSnapshot = useMemo(
    () =>
      buildGrowthWidgetSnapshot({
        sourceData: {
          trades: myTrades.data.trades.map((trade) => ({
            tradeId: trade.tradeId,
            tradedAt: trade.tradedAt,
          })),
        },
      }),
    [myTrades.data.trades],
  );

  const nextRoutineSnapshot = useMemo(
    () =>
      buildNextRoutineWidgetSnapshot({
        sourceData: {
          reminders: reminders.data.reminders.map((reminder) => ({
            reminderId: reminder.reminderId,
            ticker: reminder.ticker,
            name: reminder.name,
            amount: reminder.amount,
            dayOfMonth: reminder.dayOfMonth,
            isActive: reminder.isActive,
            nextReminderDate: reminder.nextReminderDate,
          })),
        },
      }),
    [reminders.data.reminders],
  );

  useEffect(() => {
    switch (scenario) {
      case 'feed-pagination':
        navigation.replace('MainTabs', {
          screen: 'Feed',
          params: {
            qaAutoLoadMore: true,
          },
        });
        return;
      case 'profile-share':
        navigation.replace('MainTabs', {
          screen: 'Profile',
          params: {
            qaShareOnOpen: true,
          },
        });
        return;
      case 'trade-review':
        navigation.replace('AddTradeReview', {
          selection: QA_ADD_TRADE_SELECTION,
        });
        return;
      case 'portfolio-setup-review':
        navigation.replace('PortfolioSetupReview', {
          selections: QA_PORTFOLIO_SETUP_SELECTIONS,
        });
        return;
      case 'widgets':
        return;
    }
  }, [navigation, scenario]);

  useEffect(() => {
    if (scenario !== 'widgets' || reminders.loading || myTrades.loading) {
      return;
    }

    syncAllWidgetsInBackground();
  }, [
    growthSnapshot.generatedAt,
    myTrades.loading,
    nextRoutineSnapshot.generatedAt,
    reminders.loading,
    scenario,
  ]);

  if (scenario !== 'widgets') {
    return (
      <Page
        eyebrow="QA"
        title="시나리오 이동 중"
        subtitle="내부 QA 경로에서 대상 화면으로 바로 전환합니다."
      >
        <SurfaceCard tone="utility">
          <Text style={styles.transitionTitle}>{qaScenarioTitle(scenario)}</Text>
          <Text style={styles.transitionDescription}>
            {qaScenarioDescription(scenario)}
          </Text>
        </SurfaceCard>
      </Page>
    );
  }

  return (
    <Page
      eyebrow="QA"
      title="Runtime QA Harness"
      subtitle="공개 딥링크 대신 내부 QA 경로와 위젯 프리뷰를 유지합니다."
    >
      <DataStatusCard
        error={reminders.error ?? myTrades.error}
        loading={reminders.loading || myTrades.loading}
        variant="inline"
      />

      <SurfaceCard>
        <SectionHeading
          title="Growth Streak"
          description="실제 거래 데이터로 계산한 현재 위젯 스냅샷입니다."
          actionLabel="다시 저장"
          onActionPress={() => syncAllWidgetsInBackground()}
        />
        <View style={[styles.widgetPreviewGrid, styles.widgetPreviewGridCompact]}>
          <WidgetPreviewCard label="Small" minHeight={200}>
            <Text style={styles.widgetEyebrow}>{growthSnapshot.title}</Text>
            <Text style={styles.widgetHeadline}>{`${growthSnapshot.currentStreak}일 연속`}</Text>
            <Text style={styles.widgetSubheadline}>
              최장 {growthSnapshot.longestStreak}일 · {growthSnapshot.monthLabel}
            </Text>
            <View style={styles.heatmapGrid}>
              {growthSnapshot.cells.map((cell) => (
                <View
                  key={cell.date}
                  style={[
                    styles.heatmapCell,
                    heatmapLevelStyles[cell.level],
                    cell.isToday && styles.heatmapCellToday,
                  ]}
                />
              ))}
            </View>
            <Text style={styles.widgetFooter}>{growthSnapshot.footerCopy}</Text>
          </WidgetPreviewCard>

          <WidgetPreviewCard label="Medium" minHeight={200}>
            <Text style={styles.widgetEyebrow}>{growthSnapshot.title}</Text>
            <View style={styles.widgetMediumHeader}>
              <View style={styles.widgetMetricBlock}>
                <Text style={styles.widgetMetricLabel}>현재</Text>
                <Text style={styles.widgetMetricValue}>{growthSnapshot.currentStreak}일</Text>
              </View>
              <View style={styles.widgetMetricBlock}>
                <Text style={styles.widgetMetricLabel}>최장</Text>
                <Text style={styles.widgetMetricValue}>{growthSnapshot.longestStreak}일</Text>
              </View>
            </View>
            <View style={styles.heatmapGrid}>
              {growthSnapshot.cells.map((cell) => (
                <View
                  key={`${cell.date}-medium`}
                  style={[
                    styles.heatmapCell,
                    heatmapLevelStyles[cell.level],
                    cell.isToday && styles.heatmapCellToday,
                  ]}
                />
              ))}
            </View>
            <Text style={styles.widgetFooter}>{growthSnapshot.footerCopy}</Text>
          </WidgetPreviewCard>
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeading
          title="Next Routine"
          description="실제 리마인더 데이터로 계산한 현재 위젯 스냅샷입니다."
        />
        <View style={[styles.widgetPreviewGrid, styles.widgetPreviewGridCompact]}>
          <WidgetPreviewCard label="Small" minHeight={176}>
            <Text style={styles.widgetEyebrow}>{nextRoutineSnapshot.title}</Text>
            <Text style={styles.widgetHeadline}>{nextRoutineSnapshot.headline}</Text>
            <Text style={styles.widgetSubheadline}>{nextRoutineSnapshot.subheadline}</Text>
            <Text style={styles.widgetAmount}>{nextRoutineSnapshot.amountLabel}</Text>
            <Text style={styles.widgetFooter}>{nextRoutineSnapshot.footerCopy}</Text>
          </WidgetPreviewCard>

          <WidgetPreviewCard label="Medium" minHeight={176}>
            <Text style={styles.widgetEyebrow}>{nextRoutineSnapshot.title}</Text>
            <View style={styles.widgetRoutineHeader}>
              <Text style={styles.widgetHeadline}>{nextRoutineSnapshot.headline}</Text>
              <View style={styles.statusChip}>
                <Text style={styles.statusChipLabel}>{nextRoutineSnapshot.status}</Text>
              </View>
            </View>
            <Text style={styles.widgetSubheadline}>{nextRoutineSnapshot.subheadline}</Text>
            <Text style={styles.widgetAmount}>{nextRoutineSnapshot.amountLabel}</Text>
            <View style={styles.widgetMetaRow}>
              <Text style={styles.widgetMeta}>{`활성 ${nextRoutineSnapshot.activeCount}개`}</Text>
              <Text style={styles.widgetMeta}>{nextRoutineSnapshot.deepLinkUrl}</Text>
            </View>
            <Text style={styles.widgetFooter}>{nextRoutineSnapshot.footerCopy}</Text>
          </WidgetPreviewCard>
        </View>
        <View style={styles.widgetActionRow}>
          <PrimaryButton label="리마인더 관리 열기" onPress={() => navigation.navigate('Reminders')} />
          <PrimaryButton
            label="Creation Hub 열기"
            onPress={() => navigation.navigate('CreationHub')}
            variant="secondary"
          />
        </View>
      </SurfaceCard>

      <SurfaceCard tone="utility">
        <SectionHeading
          title="시나리오 바로 열기"
          description="런타임 캡처가 필요한 흐름만 내부 라우트에 남깁니다."
        />
        <View style={styles.scenarioStack}>
          {QA_SCENARIO_ITEMS.map((item) => (
            <Pressable
              key={item.key}
              accessibilityRole="button"
              onPress={() => navigation.replace('QaHarness', { scenario: item.key })}
              style={({ pressed }) => [
                styles.scenarioCard,
                item.key === scenario && styles.scenarioCardActive,
                pressed && styles.scenarioCardPressed,
              ]}
            >
              <View style={styles.scenarioText}>
                <Text style={styles.scenarioTitle}>{item.title}</Text>
                <Text style={styles.scenarioDescription}>{item.description}</Text>
              </View>
              <Text style={styles.scenarioPath}>{`folo://qa/${item.key}`}</Text>
            </Pressable>
          ))}
        </View>
      </SurfaceCard>
    </Page>
  );
}

function WidgetPreviewCard({
  label,
  minHeight,
  children,
}: {
  label: string;
  minHeight: number;
  children: ReactNode;
}) {
  return (
    <View style={styles.widgetPreviewColumn}>
      <Text style={styles.previewLabel}>{label}</Text>
      <View style={[styles.widgetPreviewCard, { minHeight }]}>{children}</View>
    </View>
  );
}

function qaScenarioTitle(scenario: QaHarnessScenario) {
  return QA_SCENARIO_ITEMS.find((item) => item.key === scenario)?.title ?? 'QA 시나리오';
}

function qaScenarioDescription(scenario: QaHarnessScenario) {
  return (
    QA_SCENARIO_ITEMS.find((item) => item.key === scenario)?.description ??
    '내부 QA 화면으로 이동합니다.'
  );
}

const heatmapLevelStyles = StyleSheet.create({
  0: {
    backgroundColor: '#E6EEF8',
  },
  1: {
    backgroundColor: '#C2D9FF',
  },
  2: {
    backgroundColor: '#94BFFF',
  },
  3: {
    backgroundColor: '#4E87F6',
  },
  4: {
    backgroundColor: '#255BDA',
  },
});

const styles = StyleSheet.create({
  transitionTitle: {
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontSize: 17,
    fontWeight: '800',
  },
  transitionDescription: {
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.body,
    fontSize: 13,
    lineHeight: 20,
  },
  scenarioStack: {
    gap: 10,
  },
  scenarioCard: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderColor: 'rgba(214, 224, 234, 0.88)',
    borderRadius: 18,
    borderWidth: 1,
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  scenarioCardActive: {
    backgroundColor: tokens.colors.brandSoft,
    borderColor: 'rgba(37, 99, 235, 0.16)',
  },
  scenarioCardPressed: {
    opacity: 0.88,
  },
  scenarioText: {
    gap: 4,
  },
  scenarioTitle: {
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontSize: 15,
    fontWeight: '700',
  },
  scenarioDescription: {
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.body,
    fontSize: 12,
    lineHeight: 18,
  },
  scenarioPath: {
    color: tokens.colors.brandStrong,
    fontFamily: tokens.typography.body,
    fontSize: 12,
  },
  widgetPreviewGrid: {
    flexDirection: 'row',
    gap: 14,
  },
  widgetPreviewGridCompact: {
    flexWrap: 'wrap',
  },
  widgetPreviewColumn: {
    flex: 1,
    gap: 8,
    minWidth: 240,
  },
  previewLabel: {
    color: tokens.colors.inkMute,
    fontFamily: tokens.typography.body,
    fontSize: 12,
  },
  widgetPreviewCard: {
    backgroundColor: '#F7FAFF',
    borderColor: 'rgba(214, 224, 234, 0.9)',
    borderRadius: 28,
    borderWidth: 1,
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  widgetEyebrow: {
    color: tokens.colors.inkMute,
    fontFamily: tokens.typography.body,
    fontSize: 12,
  },
  widgetHeadline: {
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontSize: 24,
    fontWeight: '800',
  },
  widgetSubheadline: {
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.body,
    fontSize: 13,
    lineHeight: 20,
  },
  widgetAmount: {
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontSize: 16,
    fontWeight: '700',
  },
  widgetFooter: {
    color: tokens.colors.brandStrong,
    fontFamily: tokens.typography.heading,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 'auto',
  },
  widgetMediumHeader: {
    flexDirection: 'row',
    gap: 10,
  },
  widgetMetricBlock: {
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderRadius: 18,
    flex: 1,
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  widgetMetricLabel: {
    color: tokens.colors.inkMute,
    fontFamily: tokens.typography.body,
    fontSize: 11,
  },
  widgetMetricValue: {
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontSize: 18,
    fontWeight: '700',
  },
  heatmapGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  heatmapCell: {
    borderRadius: 5,
    height: 14,
    width: 14,
  },
  heatmapCellToday: {
    borderColor: tokens.colors.navy,
    borderWidth: 1,
  },
  widgetRoutineHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  statusChip: {
    backgroundColor: tokens.colors.surface,
    borderColor: 'rgba(214, 224, 234, 0.9)',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusChipLabel: {
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontSize: 11,
    fontWeight: '700',
  },
  widgetMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  widgetMeta: {
    color: tokens.colors.inkMute,
    fontFamily: tokens.typography.body,
    fontSize: 11,
  },
  widgetActionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
});
