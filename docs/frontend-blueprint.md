# Folo Frontend Blueprint

기준 문서: `앱 아이디어 및 목표 정의 v0.2`

## Product Lens

- Folo는 `Follow + Portfolio`를 결합한 투자 소셜 앱이다.
- 핵심 경험은 `기록`, `공유`, `장기투자 습관화`다.
- 메인 화면 구조는 `홈 / 피드 / 거래 추가 / 포트폴리오 / 프로필` 5탭이다.

## Visual Direction

- Toss처럼 숫자와 행동 버튼이 먼저 보이게 한다.
- Xangle처럼 정보 밀도가 높아져도 계층이 무너지지 않게 한다.
- Matrix처럼 루틴과 우선순위가 한눈에 읽히는 구조를 유지한다.
- 배경은 밝고 단정하게, 강조색은 금융 앱에 맞는 블루와 틸 중심으로 제한한다.

## Screen System

### Onboarding

- 앱 소개와 가치 제안
- 장기투자 루틴, 소셜 피드, TODO 관리 축 소개
- 메인 탭 진입 CTA

### Home

- 오늘의 투자 요약 카드
- 투자 TODO 리스트
- 최근 친구 활동 미리보기
- 초기 세팅/OCR/CSV 빠른 진입

### Feed

- 친구 거래 타임라인
- 거래 카드 중심 구조
- 리액션과 댓글 진입
- 검색/필터 진입

### Add Trade

- 종목 선택
- 매수/매도 전환
- 수량, 가격, 가격 범위
- 코멘트와 공개 범위
- 수동/OCR/CSV 초기 등록 방법

### Portfolio

- 총 평가금액, 손익, 오늘 등락
- 자산 배분
- 보유 종목 카드
- 잔디, 스트릭, 랭킹

### Profile

- 프로필과 공개 범위
- 리마인더
- 알림
- 구현 예정 화면 보드

## Component Inventory

- `Page`: 상단 타이틀과 배경 장식을 포함한 기본 화면 컨테이너
- `SurfaceCard`: 주요 정보 섹션 카드
- `PrimaryButton`: 메인/보조 버튼
- `Chip`: 필터, 공개 범위, 상태 표현
- `MetricBadge`: 핵심 수치 요약
- `BottomNav`: 5탭 하단 네비게이션
- `Heatmap`: 잔디 시각화 기본 컴포넌트

## Next Build Steps

1. 실제 네비게이션 도입 여부 결정
2. API 스키마 기준으로 mock data를 domain model로 교체
3. OCR/CSV/검색 입력 플로우 세분화
4. 포트폴리오 상세, 거래 상세, 설정 세부 화면 추가
5. 다크모드가 아니라 접근성 대비와 숫자 가독성부터 검증
