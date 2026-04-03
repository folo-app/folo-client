import type { MarketType } from '../api/contracts';
import type { PortfolioSetupSelection } from './types';

export const QA_HARNESS_ROUTE = 'qa';

export const QA_HARNESS_SCENARIOS = [
  'widgets',
  'feed-pagination',
  'profile-share',
  'trade-review',
  'portfolio-setup-review',
] as const;

export type QaHarnessScenario = (typeof QA_HARNESS_SCENARIOS)[number];

const supportedQaScenarios = new Set<string>(QA_HARNESS_SCENARIOS);

function createSelection({
  ticker,
  name,
  market,
  currentPrice,
}: {
  ticker: string;
  name: string;
  market: MarketType;
  currentPrice: number;
}): PortfolioSetupSelection {
  return {
    ticker,
    name,
    market,
    currentPrice,
  };
}

export const QA_ADD_TRADE_SELECTION = createSelection({
  ticker: 'AAPL',
  name: 'Apple Inc.',
  market: 'NASDAQ',
  currentPrice: 255.63,
});

export const QA_PORTFOLIO_SETUP_SELECTIONS = [
  QA_ADD_TRADE_SELECTION,
  createSelection({
    ticker: '005930',
    name: '삼성전자',
    market: 'KRX',
    currentPrice: 78400,
  }),
];

export function parseQaHarnessScenario(
  value: string | null | undefined,
): QaHarnessScenario | undefined {
  if (!value || !supportedQaScenarios.has(value)) {
    return undefined;
  }

  return value as QaHarnessScenario;
}

export function getQaHarnessDeepLink(scenario: QaHarnessScenario) {
  return `folo://${QA_HARNESS_ROUTE}/${scenario}`;
}
