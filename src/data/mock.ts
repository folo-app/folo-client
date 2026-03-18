export const onboardingHighlights = [
  {
    eyebrow: 'Social investing',
    title: '친구와 같이 기록하는 투자 피드',
    description:
      '매수와 매도를 카드 단위로 남기고, 즉각 반응과 댓글을 받는 투자 소셜 경험을 핵심에 둡니다.',
  },
  {
    eyebrow: 'Long-term habit',
    title: '잔디와 스트릭으로 장기투자를 습관화',
    description:
      'GitHub 잔디 감성을 차용해 보유 일수와 적립식 루틴을 눈에 보이는 성장 지표로 만듭니다.',
  },
  {
    eyebrow: 'Matrix planning',
    title: 'TODO 대시보드로 계획부터 실행까지',
    description:
      '아이젠하워식 정리 감각을 유지하면서 오늘 해야 할 투자 행동을 홈 탭에서 바로 처리하게 설계했습니다.',
  },
] as const;

export const todoItems = [
  {
    title: 'QQQ 적립식 매수 등록',
    meta: '3월 25일 · 반복 알림',
    status: '오늘 해야 함',
    tone: 'caution',
  },
  {
    title: '삼성전자 거래 코멘트 보강',
    meta: '친구 피드 공유 전',
    status: '초안 저장',
    tone: 'brand',
  },
  {
    title: '한국투자 OCR 결과 검수',
    meta: '초기 포트폴리오 세팅',
    status: '확인 필요',
    tone: 'teal',
  },
] as const;

export const quickActions = [
  '초기 세팅',
  '리마인더',
  '친구 초대',
  'OCR 가져오기',
  'CSV 임포트',
] as const;

export const setupMethods = [
  {
    title: '수동 입력',
    description: '종목 검색 후 수량과 평균단가를 직접 입력합니다.',
  },
  {
    title: 'OCR 가져오기',
    description: '증권사 캡처 업로드 후 종목, 수량, 가격을 자동 파싱합니다.',
  },
  {
    title: 'CSV 임포트',
    description: '초기 히스토리를 한 번에 넣을 때 사용합니다.',
  },
] as const;

export const tradeForm = {
  ticker: 'QQQ',
  market: 'NASDAQ',
  price: 489.32,
  comment: '이번 달 자동 적립 루틴 기록',
} as const;

export const heatmap = [
  [0, 1, 1, 2, 0, 3, 2, 1],
  [1, 2, 2, 3, 1, 4, 3, 2],
  [0, 1, 2, 2, 1, 3, 3, 2],
  [1, 1, 1, 2, 0, 2, 4, 3],
  [0, 1, 0, 1, 1, 2, 3, 2],
  [1, 2, 1, 2, 1, 3, 4, 4],
  [0, 1, 0, 1, 0, 2, 3, 2],
] as const;

export const blueprintSections = [
  {
    label: '온보딩',
    screens: ['Splash', 'Onboarding', 'Login', 'SignUp', 'PortfolioSetup'],
  },
  {
    label: '홈',
    screens: ['Home', 'TodoDetail'],
  },
  {
    label: '피드',
    screens: ['Feed', 'TradeDetail', 'Search'],
  },
  {
    label: '거래 추가',
    screens: ['TradeAdd', 'TickerSearch'],
  },
  {
    label: '포트폴리오',
    screens: ['Portfolio', 'HoldingDetail', 'Grass', 'Ranking'],
  },
  {
    label: '프로필',
    screens: ['Profile', 'OtherProfile', 'FollowList', 'Notification', 'Settings'],
  },
] as const;
