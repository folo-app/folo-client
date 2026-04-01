# UI/UX 실행 계획

기준 문서:

- `docs/yc-ceo-gstack-uiux-review.md`
- `docs/home-feed-portfolio-wireframes.md`
- `AGENTS.md`

목표:

- `Home`, `Feed`, `Portfolio`를 더 강하게 역할 분리한다.
- 각 변경을 작은 리뷰 가능한 슬라이스로 나눈다.
- 매 슬라이스마다 코드 영향 범위와 검증 기준을 분명히 둔다.

## 원칙

1. 기본 브랜치에서 바로 작업하지 않는다.
2. 한 슬라이스는 한 화면의 한 문제만 푼다.
3. 코드 변경이 있는 슬라이스마다 `npm run typecheck`를 돌린다.
4. `DataStatusCard`는 지원 UI로 내리고, 화면의 주인공은 각 화면의 핵심 블록이 맡는다.
5. `Home`은 행동, `Feed`는 흐름, `Portfolio`는 분석과 루틴이라는 역할을 끝까지 지킨다.

## 권장 작업 순서

### Phase 0. 작업 준비

#### Slice 0-1. 구현 브랜치 생성

- 목표: 리뷰 가능한 작업 브랜치를 먼저 만든다.
- 권장 브랜치: `godten/uiux-screen-slices`
- 산출물: 브랜치 생성 후 작업 시작

#### Slice 0-2. 기준선 정리

- 목표: 구현 전 현재 화면의 구조와 문제를 빠르게 비교할 수 있게 한다.
- 대상:
  - `src/screens/HomeScreen.tsx`
  - `src/screens/FeedScreen.tsx`
  - `src/screens/PortfolioScreen.tsx`
  - `src/components/ui.tsx`
  - `src/components/DataStatusCard.tsx`
- 완료 기준:
  - 각 화면의 첫 스크린풀에서 무엇이 먼저 보이는지 짧게 메모
  - 각 화면의 주 CTA가 무엇인지 메모

## Phase 1. 공통 위계 먼저 정리

### Slice 1-1. 지원 UI 톤 낮추기

- 목표: 로딩/오류 UI가 상단 본문을 끊지 않게 한다.
- 대상 파일:
  - `src/components/DataStatusCard.tsx`
  - `src/screens/HomeScreen.tsx`
  - `src/screens/PortfolioScreen.tsx`
- 작업:
  - page-level 상태 카드 사용 위치를 줄인다.
  - section-level inline 상태 패턴을 우선 적용한다.
- 완료 기준:
  - `Home`, `Portfolio` 첫 스크린풀에 상태 카드가 주인공처럼 보이지 않는다.
  - 일반 로딩/오류는 블록 내부에서 읽힌다.
- 검증:
  - `npm run typecheck`

### Slice 1-2. 카드 등급 나누기

- 목표: 세 화면이 같은 카드 스택처럼 보이지 않게 공통 위계를 만든다.
- 대상 파일:
  - `src/components/ui.tsx`
  - `src/theme/tokens.ts`
- 작업:
  - `SurfaceCard` 톤 체계를 `hero`, `content`, `utility` 성격으로 더 분리한다.
  - 섹션 제목, 보조 설명, 액션 링크의 시각적 강약을 조정한다.
- 완료 기준:
  - hero 블록과 utility 블록이 같은 무게로 보이지 않는다.
  - 카드만 봐도 어떤 블록이 메인인지 구분된다.
- 검증:
  - `npm run typecheck`

### Slice 1-3. 공통 간격과 첫 스크린풀 규칙 정리

- 목표: 상단 제목 아래 첫 블록이 각 화면의 역할을 바로 말하게 만든다.
- 대상 파일:
  - `src/components/ui.tsx`
  - 필요 시 각 화면 파일
- 작업:
  - 페이지 헤더와 첫 카드 간격 재조정
  - 모바일에서 첫 블록 우선순위가 바로 읽히도록 spacing 보정
- 완료 기준:
  - `Home`, `Feed`, `Portfolio` 모두 첫 블록이 화면 역할을 설명한다.
- 검증:
  - `npm run typecheck`

## Phase 2. Home를 대시보드로 압축

### Slice 2-1. Hero 요약 경량화

- 목표: `Home`이 `Portfolio Lite`처럼 보이는 문제를 줄인다.
- 대상 파일:
  - `src/screens/HomeScreen.tsx`
- 작업:
  - 히어로에서 자산 분석 밀도를 줄인다.
  - 핵심 숫자는 `총 평가금액`, `오늘 등락`, 한 줄 상태 정도로 축소한다.
  - `보유 종목`, `총 수익률`은 보조 레벨로 내린다.
- 완료 기준:
  - 히어로를 보고 "오늘 상태"가 먼저 읽힌다.
  - 포트폴리오 분석 화면의 역할을 침범하지 않는다.
- 검증:
  - `npm run typecheck`

### Slice 2-2. 오늘 할 일 블록 강화

- 목표: `Home`의 첫 행동을 더 선명하게 만든다.
- 대상 파일:
  - `src/screens/HomeScreen.tsx`
- 작업:
  - `resolveTodayAction` 문구와 우선순위를 다듬는다.
  - 한 개의 주 행동이 먼저 보이도록 버튼 위계를 조정한다.
- 완료 기준:
  - 사용자가 앱을 열고 1초 안에 오늘의 다음 행동을 이해할 수 있다.
- 검증:
  - `npm run typecheck`

### Slice 2-3. Quick Actions 정리

- 목표: 조회/관리성 유틸만 남기고 중복 CTA를 더 줄인다.
- 대상 파일:
  - `src/screens/HomeScreen.tsx`
- 작업:
  - 빠른 실행의 항목 수와 순서를 재검토한다.
  - 다른 화면이나 하단 `+` 탭과 겹치는 행동을 제거한다.
- 완료 기준:
  - `Home`의 CTA가 "오늘 할 일"과 경쟁하지 않는다.
- 검증:
  - `npm run typecheck`

### Slice 2-4. Portfolio Preview 축소

- 목표: 미리보기는 미리보기답게 만들고, 분석은 `Portfolio`로 보낸다.
- 대상 파일:
  - `src/screens/HomeScreen.tsx`
  - 필요 시 `src/components/portfolio-visuals.tsx`
- 작업:
  - 상위 종목 나열 밀도를 줄인다.
  - "핵심 1개 인사이트 + 전체 보기" 구조로 단순화한다.
- 완료 기준:
  - `Home`에서 포트폴리오 블록이 무겁지 않다.
- 검증:
  - `npm run typecheck`

### Slice 2-5. Friend Activity Preview를 사회적 신호 중심으로 변경

- 목표: 단순 거래 2건이 아니라 "왜 봐야 하는지"를 보여준다.
- 대상 파일:
  - `src/screens/HomeScreen.tsx`
- 작업:
  - 최신 거래 나열보다 반응/집중/팔로우 관계가 보이는 요약으로 교체한다.
- 완료 기준:
  - 친구 활동 미리보기만 봐도 소셜 투자 앱이라는 정체성이 살아난다.
- 검증:
  - `npm run typecheck`

## Phase 3. Feed를 스크롤 제품으로 전환

### Slice 3-1. 상단 컨트롤 리듬 정리

- 목표: 검색/필터 뒤에 타임라인이 바로 시작되게 만든다.
- 대상 파일:
  - `src/screens/FeedScreen.tsx`
- 작업:
  - 상단 summary와 reset UI를 가볍게 정리한다.
  - 모바일 첫 스크린풀에서 첫 거래 카드가 더 빨리 보이게 한다.
- 완료 기준:
  - 검색/필터 후 첫 거래 카드가 즉시 시작된다.
- 검증:
  - `npm run typecheck`

### Slice 3-2. Highlight Card 축소

- 목표: 하이라이트는 첫인상만 만들고, 타임라인을 가리지 않게 한다.
- 대상 파일:
  - `src/screens/FeedScreen.tsx`
- 작업:
  - 모바일에서 하이라이트 카드 높이를 줄이거나 위치를 조정한다.
  - 본문보다 눈에 띄지 않게 강도를 낮춘다.
- 완료 기준:
  - 하이라이트가 있어도 피드의 주인공은 타임라인이다.
- 검증:
  - `npm run typecheck`

### Slice 3-3. 거래 카드 높이 압축

- 목표: 카드 한 장당 읽는 시간을 줄인다.
- 대상 파일:
  - `src/screens/FeedScreen.tsx`
  - 필요 시 `src/components/ui.tsx`
- 작업:
  - 핵심 수치를 3개에서 2개로 줄이는 안 검토
  - 코멘트 블록과 반응 블록 높이 축소
  - 작성자, 거래 타입, 종목, 핵심 수치, 코멘트/반응의 4단 구조 고정
- 완료 기준:
  - 390px 전후 모바일 폭에서 한 화면에 1.5개 이상 카드가 보인다.
- 검증:
  - `npm run typecheck`

### Slice 3-4. 사람 요약 / 반응 요약 배치 정리

- 목표: 보조 정보가 본문을 막지 않게 한다.
- 대상 파일:
  - `src/screens/FeedScreen.tsx`
- 작업:
  - `눈여겨볼 사람`, `반응이 모이는 흐름` 카드를 desktop side rail 중심으로 이동
  - 모바일에서는 필요 시 제거 또는 축약
- 완료 기준:
  - 모바일에서 피드가 설명 카드 모음처럼 보이지 않는다.
- 검증:
  - `npm run typecheck`

### Slice 3-5. Feed 빈 상태 개선

- 목표: 빈 피드에서도 행동 이유가 선명하게 보이게 한다.
- 대상 파일:
  - `src/screens/FeedScreen.tsx`
- 작업:
  - "사람 찾기"와 "내 프로필 보기"의 역할을 더 분명히 구분
  - 팔로우 이유가 드러나는 카피 보강
- 완료 기준:
  - 빈 상태에서 첫 네트워크 행동으로 자연스럽게 이어진다.
- 검증:
  - `npm run typecheck`

## Phase 4. Portfolio를 운영체제답게 강화

### Slice 4-1. 첫 스크린풀 재배치

- 목표: `자산 구성`과 `성과 핵심 수치`가 초반에 함께 읽히게 한다.
- 대상 파일:
  - `src/screens/PortfolioScreen.tsx`
- 작업:
  - 모바일에서 allocation과 performance의 상대적 순서와 높이를 다듬는다.
  - 위쪽 정보 밀도를 더 전략적으로 배치한다.
- 완료 기준:
  - 첫 1.25스크린 안에 자산 구성과 성과 핵심이 들어온다.
- 검증:
  - `npm run typecheck`

### Slice 4-2. 루틴 영역을 Heatmap 중심으로 강화

- 목표: 장기투자 습관화라는 제품 약속을 화면 중심 언어로 만든다.
- 대상 파일:
  - `src/screens/PortfolioScreen.tsx`
  - `src/components/Heatmap.tsx`
  - 필요 시 `src/components/ui.tsx`
- 작업:
  - 주간 막대 차트보다 강한 루틴 시각화를 앞세운다.
  - streak, 목표 달성률, 다음 루틴을 Heatmap과 함께 읽히게 한다.
- 완료 기준:
  - 루틴 블록만 봐도 "계속 하고 있다"는 감각이 생긴다.
- 검증:
  - `npm run typecheck`

### Slice 4-3. Holdings List 정보 구조 고정

- 목표: 종목 리스트를 더 빠르게 비교하게 만든다.
- 대상 파일:
  - `src/screens/PortfolioScreen.tsx`
- 작업:
  - 종목명, 비중, 평가금액, 손익, 평균단가의 정렬과 시선 흐름 재조정
  - 긴 종목명과 긴 숫자에서도 깨지지 않게 보정
- 완료 기준:
  - 리스트 한 행을 2초 안에 스캔할 수 있다.
- 검증:
  - `npm run typecheck`

### Slice 4-4. 관리 작업 유틸화

- 목표: 분석 화면의 본문과 관리 영역을 확실히 분리한다.
- 대상 파일:
  - `src/screens/PortfolioScreen.tsx`
- 작업:
  - `관리 작업` 카드를 더 약한 유틸 패턴으로 변경
  - 분석 카드와 경쟁하지 않게 톤을 낮춤
- 완료 기준:
  - 관리 작업이 본문보다 뒤로 물러난다.
- 검증:
  - `npm run typecheck`

### Slice 4-5. 빈 상태 개선

- 목표: 첫 종목이 없을 때도 이 화면의 미래 가치를 설명한다.
- 대상 파일:
  - `src/screens/PortfolioScreen.tsx`
- 작업:
  - 빈 상태 카피와 보조 행동 정리
  - `+` 탭과 `KIS 연결`의 역할 분담을 명확히 함
- 완료 기준:
  - 빈 상태에서 왜 이 화면이 중요한지 이해된다.
- 검증:
  - `npm run typecheck`

## Phase 5. 마감 QA

### Slice 5-1. 모바일 폭 QA

- 목표: 작은 화면에서 우선순위가 무너지지 않게 한다.
- 체크 폭:
  - iPhone SE급 폭
  - 390px 전후 폭
  - 412px 이상 폭
- 확인 항목:
  - 첫 스크린풀 정보 우선순위
  - 긴 종목명 줄바꿈
  - 긴 금액 문자열
  - 버튼 중복

### Slice 5-2. 상태 케이스 QA

- 목표: 로딩/에러/빈 상태가 화면 성격을 해치지 않게 한다.
- 확인 항목:
  - `Home` 데이터 일부 실패
  - `Feed` 필터 결과 없음
  - `Portfolio` 보유 종목 없음

### Slice 5-3. 최종 정리

- 목표: 리뷰와 머지에 적합한 상태로 마감한다.
- 작업:
  - 변경 파일 요약
  - 화면별 달라진 핵심 한 줄 정리
  - 다음 추천 슬라이스 제안

## 권장 커밋 단위

1. `refactor: 상태 UI를 보조 레이어로 정리`
2. `feat: 홈 대시보드 히어로와 오늘 할 일 재구성`
3. `feat: 홈 미리보기 블록 밀도 축소`
4. `feat: 피드 상단 흐름과 거래 카드 압축`
5. `feat: 피드 보조 요약 카드 배치 정리`
6. `feat: 포트폴리오 루틴 영역 강화`
7. `refactor: 포트폴리오 관리 작업 유틸화`
8. `test: UI 타입체크 및 반응형 마감 보정`

## 시작 추천

가장 먼저 할 일은 `Phase 1 -> Slice 1-1`과 `Phase 2 -> Slice 2-1`이다.

이 두 개를 먼저 하면 `Home`의 첫인상이 바뀌고, 이후 `Feed`와 `Portfolio`에서 무엇을 줄이고 무엇을 키워야 할지가 훨씬 선명해진다.
