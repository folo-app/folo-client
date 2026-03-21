# folo-client Research Report

## 범위와 전제

- 분석 대상은 현재 워크스페이스의 `folo-client` 레포다.
- 시점 기준 브랜치 상태는 `main`이며 최근 주요 커밋은 초기 포트폴리오 설정,
  CSV/OCR 가져오기, 프로필 이미지 업로드, 포트폴리오 종목 선택 UX,
  Expo AsyncStorage 호환성 수정까지 반영돼 있다.
- 이 레포는 Expo 기반 모바일 클라이언트이고, 데이터 소스는 별도
  `folo-backend`다.
- 현재 앱은 더 이상 프론트 내부 mock 데이터를 사용하지 않으며,
  인증 이후 주요 화면은 실제 백엔드 응답을 전제로 렌더링한다.

## 한 줄 요약

이 레포는 `AuthProvider + api/services + useLoadable hooks + screen-local state`
조합으로 움직이는 Expo 앱이다. 전역 상태 라이브러리는 없고,
인증 세션만 컨텍스트에 둔 뒤 각 화면이 API를 직접 호출하거나
공통 hook으로 데이터를 읽는다. 제품 흐름상 가장 중요한 설계는
`로그인 -> 이메일 인증 -> 포트폴리오 보유 여부 확인 -> 초기 포트폴리오 설정 -> 메인 탭`
순서이며, CSV/OCR와 KIS 연결은 보조 경로다.

## 최상위 폴더 구조

### 실행과 설정

- `App.tsx`
  - 앱 루트다.
  - `AuthProvider`로 전체 앱을 감싸고 `AppNavigator`를 렌더한다.
  - `StatusBar`는 `dark` 스타일 고정이다.
- `index.ts`
  - Expo 루트 컴포넌트 등록만 담당한다.
- `app.json`
  - 앱 이름, slug, scheme, portrait 고정, light mode 고정,
    new architecture 활성화, web output single 설정이 들어 있다.
- `package.json`
  - Expo SDK 55 계열 기반.
  - 핵심 런타임 의존성은 `expo`, `react-native`, `@react-navigation/*`,
    `@react-native-async-storage/async-storage`,
    `expo-document-picker`, `expo-image-picker`다.
  - 스크립트는 `start`, `android`, `ios`, `web`, `typecheck`만 있다.
- `tsconfig.json`
  - `expo/tsconfig.base`를 상속하고 `strict: true`만 켠 최소 설정이다.

### 문서

- `README.md`
  - 실행 방법, API 환경 변수, 폴더 개요를 짧게 설명한다.
- `docs/frontend-blueprint.md`
  - 이 앱의 화면 철학과 주요 UX 방향을 설명한다.
  - 특히 초기 유저는 메인 진입 전에 포트폴리오를 직접 추가해야 한다는
    제품 방향이 여기에 반영돼 있다.
- `docs/contracts/backend-contract.md`
  - 프론트가 실제로 연결한 백엔드 엔드포인트와 아직 미연동인 엔드포인트를
    정리한 스냅샷이다.

### 소스

- `src/api`
  - 환경 변수, API client, 계약 타입, 서비스 함수가 모여 있다.
- `src/auth`
  - 세션 복원, 토큰 저장, 로그인/회원가입/이메일 인증 흐름을 관리한다.
- `src/navigation`
  - React Navigation의 Stack/Bottom Tabs와 route param 타입 정의를 가진다.
- `src/components`
  - 공통 레이아웃, 버튼, 인증 전용 폼, 아바타, 종목 badge 같은 UI 조각들.
- `src/hooks`
  - 공통 데이터 로딩 hook. 사실상 간단한 fetch-state abstraction이다.
- `src/screens`
  - 제품 대부분의 비즈니스 로직이 들어 있는 화면 레이어다.
- `src/lib`
  - 포맷 함수들.
- `src/theme`
  - 디자인 토큰.
- `src/types`
  - 탭 키 같은 단순 타입.
- `src/data`
  - 현재 비어 있다.

### 생성물과 로컬 상태

- `dist`
  - web export 결과물.
- `.expo`
  - Expo 로컬 메타데이터.
- `node_modules`
  - 의존성.

## 실행 구조

### 앱 부팅

1. `index.ts`가 `App`을 Expo 루트로 등록한다.
2. `App.tsx`가 `AuthProvider`와 `AppNavigator`를 렌더한다.
3. `AuthProvider`가 저장된 세션을 읽고 refresh 시도를 한다.
4. 부팅 상태 동안 `AppNavigator`는 `SplashScreen`을 보여준다.
5. 인증 상태가 확정되면:
   - `authenticated`: `PortfolioSetupGate`부터 시작
   - `signed_out`: `Login`부터 시작

### 세션 관리

- 세션은 `AsyncStorage`에 `@folo/auth-session` 키로 저장된다.
- 저장 구조는 `AuthResponse` 전체다.
- 저장 시 `setFoloAccessToken`을 호출해 메모리 전역 access token을 갱신한다.
- 앱 재시작 시 저장된 `refreshToken`으로 `/auth/refresh`를 시도한다.
- refresh가 만료/무효이면 저장소를 지우고 signed_out으로 전환한다.
- refresh 실패가 네트워크 등 다른 이유면 저장 세션을 그대로 유지하려고 한다.
  즉 완전한 strict logout보다는 "가능하면 복구" 성향이다.

### AsyncStorage fallback

- `AuthProvider`는 `AsyncStorage` native module이 없는 경우를 대비해
  in-memory `Map` fallback을 둔다.
- 이 로직은 Expo Go / web / 시뮬레이터 호환성 문제를 회피하기 위한 장치다.
- 따라서 저장소 사용 불가 환경에서도 앱이 즉시 크래시하지 않는다.
- 단, in-memory fallback은 앱 프로세스가 내려가면 세션이 유지되지 않는다.

## 상태관리 모델

이 레포는 상태관리 레이어가 매우 얇다.

- 전역 상태:
  - `AuthProvider`만 보유
  - `status`, `session`, `pendingVerification`
- API 인증 상태:
  - `src/api/config.ts`의 module-level token 변수
- 화면 데이터:
  - 대부분 `useLoadable` 기반 hook으로 읽음
- 쓰기 액션:
  - 화면 컴포넌트에서 `foloApi.*`를 직접 호출
  - 성공 시 `refresh()`로 재조회하거나 화면 이동

이 구조의 장점:

- 레이어가 단순하고 파일 수가 작다.
- 화면 책임이 명확하다.
- Redux, Zustand, React Query 없이도 흐름 추적이 쉽다.

이 구조의 단점:

- 캐시 공유가 거의 없다.
- 동일 데이터가 여러 화면에서 중복 요청될 수 있다.
- optimistic update, pagination, mutation invalidation 체계가 없다.
- write action이 screen-local state에 흩어져 있다.

## API 레이어 분석

### `src/api/config.ts`

- `EXPO_PUBLIC_FOLO_API_URL` 기본값은 `http://localhost:8080/api`
- `EXPO_PUBLIC_FOLO_ACCESS_TOKEN`이 있으면 초기 access token으로 쓸 수 있다.
- access token은 module scope 변수로 저장된다.

### `src/api/client.ts`

- `apiRequest<T>()`가 유일한 low-level fetch wrapper다.
- 특징:
  - JSON body는 자동 stringify
  - `FormData`, `Blob`, `ArrayBuffer` 등은 그대로 보냄
  - `requiresAuth` 기본값 `true`
  - `allowEmptyData`가 false면 `data === null`도 실패로 처리
- 네트워크 오류 시 에러 메시지에
  "백엔드 실행 상태와 CORS 설정을 확인"하라는 문구를 넣는다.
- 응답은 반드시 `{ success, data, message, error, timestamp }` envelope를 기대한다.

### `src/api/contracts.ts`

- 백엔드 DTO 타입 정의 모음이다.
- 실제 앱에서 사용하는 도메인은 다음과 같이 나뉜다.
  - 인증: `SignupRequest`, `AuthResponse`, `ConfirmEmailRequest`
  - 피드: `FeedTradeItem`, `FeedResponse`
  - 포트폴리오: `PortfolioHoldingItem`, `PortfolioResponse`
  - 거래: `TradeDetailResponse`, `TradeListResponse`, `CreateTradeRequest`
  - 댓글: `CommentListResponse`, `CreateCommentRequest`
  - 프로필/유저: `MyProfileResponse`, `PublicProfileResponse`, `UserSearchResponse`
  - 팔로우: `FollowActionResponse`, `FollowListResponse`
  - 알림/리마인더
  - 주식 검색/발견/현재가
  - 포트폴리오 import CSV/OCR
  - KIS connection 상태
  - 프로필 이미지 업로드

### `src/api/services.ts`

- 화면이 직접 사용하는 domain-level API 함수 모음이다.
- URL 쿼리 조합 helper `withQuery`가 있다.
- multipart 업로드용 `buildUploadFormData`가 있다.
- 현재 연결된 큰 축:
  - 인증
  - 피드
  - 포트폴리오/동기화/import
  - 거래/댓글
  - 프로필/유저/팔로우
  - 알림/리마인더
  - 주식 검색/시세/발견
  - KIS 연결 시작/상태
  - 프로필 이미지 업로드

### API 레이어 특징

- 프론트에 openapi 코드 생성 파이프라인은 없다.
- `openapi-typescript`가 devDependency로 있지만 현재 생성물은 보이지 않는다.
- 계약 타입은 수동 유지 상태다.

## 공통 데이터 hook 분석

### `src/hooks/useFoloData.ts`

- `useLoadable(loader, initialData, deps)` 하나로 거의 모든 읽기 hook을 만든다.
- 각 hook은 아래 패턴을 따른다.
  - 초깃값 준비
  - `loading/error/data/refresh` 반환
- 주의할 점:
  - React Query 같은 dedupe/caching은 없다.
  - deps가 바뀔 때마다 즉시 재호출한다.
  - 에러가 나면 데이터를 `initialData`로 되돌린다.

### 제공 hook

- `useFeedData`
- `usePortfolioData`
- `useTradeDetailData`
- `useTradeCommentsData`
- `useMyProfileData`
- `useNotificationsData`
- `useRemindersData`
- `useMyTradesData`
- `useStockSearchData`
- `useStockDiscoverData`
- `useStockPriceData`

### 설계 의미

- 앱의 read side는 이 hook 파일에 사실상 집중돼 있다.
- 반면 write side는 화면마다 분산돼 있다.

## 인증 레이어 분석

### `src/auth/AuthProvider.tsx`

책임:

- 세션 저장/복원
- refresh
- 로그인
- 회원가입
- 이메일 인증 완료
- 인증코드 재발송
- 로그아웃

핵심 동작:

- `signIn`
  - `/auth/login`
  - `EMAIL_NOT_VERIFIED`면 예외를 삼키고
    `verification_required`를 반환
- `signUp`
  - `/auth/signup`
  - 바로 로그인하지 않고 `pendingVerification`만 세팅
- `confirmEmail`
  - `/auth/email/confirm`
  - 성공 즉시 세션 저장 후 `authenticated`
- `signOut`
  - refresh token이 있으면 `/auth/logout`
  - 실패 여부와 관계없이 로컬 세션 제거

이 구조 때문에 인증 화면은 비교적 단순하다.
실제 상태 전이는 대부분 AuthProvider 안에서 일어난다.

## 네비게이션 구조

### `src/navigation/types.ts`

- `RootStackParamList`
  - 인증 화면
  - 포트폴리오 setup 관련 화면
  - 메인 탭
  - 거래/보유/알림/리마인더/프로필 편집/사람 찾기/KIS/import
- `MainTabParamList`
  - Home / Feed / AddTrade / Portfolio / Profile
- `PortfolioSetupSelection`
  - 초기 포트폴리오 생성에서 화면 간 전달용 DTO

### `src/navigation/AppNavigator.tsx`

- `SafeAreaProvider`를 최상단에 둔다.
- `NavigationContainer`는 authenticated/signed_out 상태가 정해진 뒤에만 렌더된다.
- `booting` 상태에서는 `SplashScreen`만 별도 렌더.
- 인증 완료 후 스택 순서:
  - `PortfolioSetupGate`
  - `PortfolioSetup`
  - `PortfolioSetupReview`
  - `MainTabs`
  - 기타 상세 화면
- 탭 바는 React Navigation 기본 탭 바가 아니라
  `BottomNav` 커스텀 컴포넌트로 렌더한다.

### 중요한 설계 포인트

- authenticated여도 바로 `MainTabs`에 들어가지 않는다.
- 무조건 `PortfolioSetupGate`를 한 번 거쳐
  비어 있는 신규 유저를 setup 화면으로 보낸다.

## 디자인 시스템 분석

### `src/theme/tokens.ts`

- 색상은 밝은 금융 앱 톤.
- 핵심 색은 `brand blue`, `navy`, `teal`.
- canvas와 surface를 분리하고, line/shadow도 토큰화했다.
- 웹 폰트는 `"Avenir Next", "IBM Plex Sans KR"` fallback 조합.
- iOS는 `SF Pro Display/Text`.
- Android는 시스템 sans 계열.

### `src/components/ui.tsx`

핵심 공통 컴포넌트:

- `Page`
  - 스크롤 컨테이너 + 상단 eyebrow/title/subtitle + 배경 glow
- `SurfaceCard`
  - 카드 wrapper
  - tone: `default`, `hero`, `muted`
- `PrimaryButton`
  - primary/secondary variant
- `Chip`
  - 필터, 상태, 작은 액션
- `MetricBadge`
  - 숫자 요약
- `SectionHeading`
  - 섹션 제목과 설명

이 컴포넌트들이 거의 모든 화면 레이아웃을 통일한다.

### `src/components/auth-ui.tsx`

- 인증 화면 전용 레이아웃 계층
- `AuthScreenLayout`
  - 브랜드 hero + form card + footer
- `AuthField`
  - 기본 input wrapper
- `AuthNotice`
  - 경고/안내 박스
- `AuthTextLink`
  - 인증 화면용 텍스트 링크

### `src/components/Avatar.tsx`

- 이미지가 있으면 렌더하고 없으면 이니셜 fallback.
- 이니셜은 한글/영문/숫자만 남기고 최대 2자 사용.

### `src/components/ProfileImageField.tsx`

- `expo-image-picker` 기반 갤러리 선택 UI.
- 선택 후 즉시 `/uploads/profile-image` 업로드를 호출.
- 업로드 성공 시 서버 URL을 부모 state로 올린다.
- 회원가입과 프로필 편집이 이 컴포넌트를 재사용한다.

### `src/components/StockIdentityBadge.tsx`

- 종목 로고 혹은 placeholder badge 렌더링 담당.
- 로고 URL이 있으면 이미지를 로드.
- 실패 시:
  - `market + ticker + name` 기반 deterministic palette 선택
  - 이니셜과 `KR`/`US` pill 표시
- 국내 로고가 불완전한 현 상황을 감안한 의도적 fallback 역할을 한다.

### `src/components/BottomNav.tsx`

- 5탭 커스텀 하단 네비게이션.
- `add` 탭은 floating FAB처럼 강조.
- 실제 라우팅은 상위 `AppNavigator`에서 매핑.

### `src/components/DataStatusCard.tsx`

- 로딩 또는 에러가 있을 때만 보인다.
- 화면이 통합적으로 "백엔드 데이터를 불러오는 중"임을 알려주는 경량 컴포넌트.

### `src/components/Heatmap.tsx`

- 잔디형 activity grid 컴포넌트.
- 현재 레포 내 주요 화면에서 직접 사용되지는 않는다.
- 향후 포트폴리오 streak/활동 시각화용 준비 컴포넌트로 보인다.

## 화면별 상세 분석

### 1. Splash

- 파일: `src/screens/SplashScreen.tsx`
- 역할:
  - 세션 복원 대기 화면
  - 부트 단계 시각화
- 특징:
  - 실제 상태를 세밀히 읽진 않고 정적 step 문구만 보여준다.

### 2. Login

- 파일: `src/screens/LoginScreen.tsx`
- 역할:
  - 로그인
  - 미인증 계정이면 이메일 인증 화면으로 전환
- 특징:
  - `pendingVerification?.email`을 초기값으로 사용
  - "로그인 중 EMAIL_NOT_VERIFIED" 흐름을 자연스럽게 흡수

### 3. Signup

- 파일: `src/screens/SignupScreen.tsx`
- 역할:
  - 회원가입
  - 프로필 이미지 선택 포함
- 특징:
  - `profileImage`는 URL 직접입력이 아니라 업로드 결과 URL
  - 성공 후 곧바로 `EmailVerification`으로 이동

### 4. EmailVerification

- 파일: `src/screens/EmailVerificationScreen.tsx`
- 역할:
  - 인증 코드 입력
  - 코드 재발송
- 특징:
  - 성공 시 즉시 세션 발급
  - 이메일이 없을 경우 진행 차단

### 5. PortfolioSetupGate

- 파일: `src/screens/PortfolioSetupGateScreen.tsx`
- 역할:
  - 신규 유저인지 판별
- 판별 로직:
  - `getPortfolio()`
  - `getMyTrades({ page: 0, size: 1 })`
  - 둘 다 비어 있으면 `PortfolioSetup`
  - 아니면 `MainTabs/Home`
- 특징:
  - 인증 직후 앱 진입 가드 역할

### 6. PortfolioSetup

- 파일: `src/screens/PortfolioSetupScreen.tsx`
- 역할:
  - 초기 포트폴리오 종목 선택
- 핵심 UX:
  - 검색창
  - 시장 필터 `ALL/KRX/US`
  - 검색 전에는 `/stocks/discover`
  - 검색 후에는 `/stocks/search`
  - 다중 선택 후 리뷰 화면으로 이동
- 부가 옵션:
  - 하단에 작은 글씨로 CSV/OCR/KIS 연결 배치
- 특징:
  - 로고는 `StockIdentityBadge`
  - 검색어 2자 이상부터 실제 API 호출
  - 추천 종목 자체도 백엔드 discover 결과 사용

### 7. PortfolioSetupReview

- 파일: `src/screens/PortfolioSetupReviewScreen.tsx`
- 역할:
  - 선택한 종목별 수량/평균 매수가 입력
  - 저장 시 각 종목을 `BUY`, `PRIVATE` 거래 1건으로 생성
- 특징:
  - 초기 포트폴리오를 "거래 생성"으로 모델링한다.
  - 성공 시 `MainTabs/Portfolio`로 reset.
- 의미:
  - 별도 `create holding` API 없이 거래 기반 포트폴리오를 만든다.

### 8. ImportOnboarding

- 파일: `src/screens/ImportOnboardingScreen.tsx`
- 역할:
  - CSV import preview/confirm
  - OCR import preview/confirm
- 특징:
  - 메인 경로가 아니라 보조 경로임을 명확히 안내
  - CSV는 복수 preview 선택 저장
  - OCR은 단건 parsed 결과 저장
- 의존:
  - `expo-document-picker`
  - `expo-image-picker`

### 9. KisConnect

- 파일: `src/screens/KisConnectScreen.tsx`
- 역할:
  - KIS OAuth 준비 상태와 skeleton start 응답 확인
- 특징:
  - 직접 API key 입력 UX는 이미 제거됨
  - 상태는 `/integrations/kis/connect/status`
  - start는 `/integrations/kis/connect/start`
  - 현재는 연결 준비 화면 성격이 강함

### 10. Home

- 파일: `src/screens/HomeScreen.tsx`
- 역할:
  - 포트폴리오, 리마인더, 내 거래, 친구 피드를 종합한 대시보드
- 데이터:
  - `usePortfolioData`
  - `useFeedData`
  - `useRemindersData`
  - `useMyTradesData`
- 특징:
  - 여러 hook 에러/로딩을 합쳐 한 장의 상태 카드로 보여준다.
  - "직접 추가"와 "CSV/OCR" CTA를 첫 홈에도 둔다.

### 11. Feed

- 파일: `src/screens/FeedScreen.tsx`
- 역할:
  - 친구 거래 타임라인
- 특징:
  - 거래 카드 클릭 시 `TradeDetail`
  - 리액션은 읽기 전용으로만 보이고 write는 아직 없음
  - 사람 찾기 진입 버튼 포함

### 12. AddTrade

- 파일: `src/screens/AddTradeScreen.tsx`
- 역할:
  - 개별 거래 생성
- 데이터:
  - 검색: `useStockSearchData`
  - 가격: `useStockPriceData`
- 특징:
  - 이 화면은 초기 onboarding보다 "사후 보정/추가 기록" 성격으로 안내됨
  - 종목 선택 후 가격/수량/코멘트/공개범위 입력
  - 성공 시 `TradeDetail`로 이동

### 13. Portfolio

- 파일: `src/screens/PortfolioScreen.tsx`
- 역할:
  - 포트폴리오 집계, 자산 배분, 보유 종목 목록
- 특징:
  - holding detail API가 없어서 aggregate portfolio projection에 의존
  - 비어 있으면 setup 진입 CTA를 강하게 노출

### 14. Profile

- 파일: `src/screens/ProfileScreen.tsx`
- 역할:
  - 내 프로필, 공개 범위, 리마인더, 알림, 최근 거래
- 데이터:
  - `useMyProfileData`
  - `useNotificationsData`
  - `useRemindersData`
  - `useMyTradesData`
- 특징:
  - 로그아웃이 여기서 수행된다.
  - 사람 찾기, 포트폴리오 setup, KIS 연결로 이동 가능

### 15. TradeDetail

- 파일: `src/screens/TradeDetailScreen.tsx`
- 역할:
  - 거래 상세
  - 댓글 읽기/쓰기
- 특징:
  - 댓글 생성 후 `comments.refresh()`와 `trade.refresh()`를 둘 다 호출
  - reaction은 아직 표시만 하고 생성/삭제는 미구현

### 16. HoldingDetail

- 파일: `src/screens/HoldingDetailScreen.tsx`
- 역할:
  - 보유 종목 상세
- 특징:
  - 전용 API 없이 portfolio holdings 배열에서 찾아 렌더
  - 따라서 deep link 새로고침 시 portfolio fetch에 완전히 의존

### 17. Notifications

- 파일: `src/screens/NotificationsScreen.tsx`
- 역할:
  - 알림 목록
  - 전체 읽음/개별 읽음
- 특징:
  - write action 후 `notifications.refresh()`

### 18. Reminders

- 파일: `src/screens/RemindersScreen.tsx`
- 역할:
  - 리마인더 활성/비활성 전환
  - 삭제
- 특징:
  - 수정 시 기존 amount/dayOfMonth를 그대로 보내며 `isActive`만 토글

### 19. ProfileEdit

- 파일: `src/screens/ProfileEditScreen.tsx`
- 역할:
  - 닉네임/프로필 이미지/바이오/공개 범위 수정
- 특징:
  - 저장 성공 후 `profile.refresh()`
  - 입력 state를 서버 데이터로 다시 초기화하는 `useEffect`가 있음

### 20. People

- 파일: `src/screens/PeopleScreen.tsx`
- 역할:
  - 사용자 검색
  - 팔로우/언팔로우
  - 팔로워/팔로잉 preview
- 특징:
  - `useDeferredValue`를 사용해 검색 입력 부하를 줄인다.
  - 검색어 2자 미만이면 검색 대신 follow graph preview를 보여준다.
  - 검색 결과에서 자기 자신은 제외한다.

### 21. UserProfile

- 파일: `src/screens/UserProfileScreen.tsx`
- 역할:
  - 공개 프로필 확인
  - 팔로우 토글
  - 포트폴리오 접근 가능 여부 표시
- 특징:
  - 아직 공개 포트폴리오/개인 피드는 붙지 않았고 접근 여부만 설명한다.

## 포맷팅 유틸 분석

### `src/lib/format.ts`

- 숫자, 통화, 퍼센트, 상대시간, 날짜, 레이블 변환 모음
- 규칙:
  - `KRX`는 KRW, 나머지는 USD
  - 퍼센트는 양수일 때만 `+`를 붙인다.
  - `formatWeight`는 1 이하 값을 퍼센트로 바꿀 수 있게 설계돼 있다.
  - 리액션, 가시성, 알림 타입 한글 라벨 변환 담당

## 실제 동작 흐름 요약

### 인증 흐름

1. 앱 실행
2. `AuthProvider`가 저장 세션/refresh 검사
3. 미로그인:
   - `Login`
   - 필요 시 `Signup`
   - `EmailVerification`
4. 인증 완료
5. `PortfolioSetupGate`
6. 신규 유저면 `PortfolioSetup`, 아니면 메인 탭

### 신규 유저 포트폴리오 구성

1. `PortfolioSetup`
2. 종목 선택
3. `PortfolioSetupReview`
4. 각 종목을 private buy trade로 저장
5. `Portfolio` 탭으로 이동

### 거래 추가

1. `AddTrade`
2. `/stocks/search`
3. 종목 선택 시 `/stocks/{ticker}/price`
4. `/trades`
5. `TradeDetail`

### CSV/OCR import

1. `ImportOnboarding`
2. CSV 선택 -> `/portfolio/import/csv`
3. preview 선택 -> `/portfolio/import/confirm`
4. OCR 이미지 선택 -> `/portfolio/import/ocr`
5. parsed 결과 confirm -> `/portfolio/import/confirm`

### 소셜 흐름

1. `People`
2. `/users/search`
3. `/follows/{userId}` POST/DELETE
4. `UserProfile`
5. 상대 공개 범위/접근 가능 여부 확인

## 폴더별 강점과 현재 한계

### 강점

- 구조가 단순해서 신규 개발자가 따라가기 쉽다.
- 인증과 초기 포트폴리오 온보딩이 제품 의도에 맞게 명확하다.
- 공통 UI 토큰이 잘 정리돼 있어 화면 일관성이 높다.
- 프로필 이미지 업로드, CSV/OCR, KIS 상태, 사용자 검색 등
  여러 흐름이 이미 실제 API에 붙어 있다.

### 한계

- 화면 로직이 두껍다.
  - 특히 `PortfolioSetupScreen`, `AddTradeScreen`, `PeopleScreen`,
    `ImportOnboardingScreen`은 컴포넌트 분리가 더 필요하다.
- 전역 캐시가 없어 중복 fetch 가능성이 크다.
- pagination은 DTO에 있으나 UI는 대부분 첫 페이지/미리보기만 사용한다.
- `HoldingDetail`처럼 projection 의존 상세 화면이 존재한다.
- KIS OAuth는 실제 연결보다 준비 상태/설계 노출 수준에 가깝다.
- `src/data`는 비어 있고, 과거 mock 레이어를 제거한 뒤 정리 잔재처럼 남아 있다.
- `Heatmap`은 아직 실제 화면 연결이 없다.
- 프로필 이미지 업로드는 `requiresAuth: false`라서 인증 없는 업로드도 가능하다.
  이것이 의도인지 보안 정책 확인이 필요하다.

## 백엔드 연동 수준 요약

현재 프론트는 다음 범위까지 실제 백엔드 계약에 붙어 있다.

- 인증
- 이메일 인증
- 내 포트폴리오
- 피드
- 내 거래 목록
- 거래 상세
- 댓글 목록/작성
- 내 프로필 수정
- 사용자 검색/공개 프로필/팔로우
- 알림 읽음 처리
- 리마인더 생성/수정/삭제
- 종목 검색/추천/현재가
- 포트폴리오 import CSV/OCR/confirm
- KIS 연결 상태 조회/start skeleton
- 프로필 이미지 업로드

아직 미연동이거나 읽기 전용에 머무는 영역:

- 거래 수정/삭제
- 거래 리액션 생성/삭제
- 댓글 삭제
- 알림 설정
- 공개 포트폴리오 상세
- 공개 개인 피드
- 계정 탈퇴
- 실제 KIS OAuth callback 이후 연결 완료 UX

## 코드 품질 관점 메모

### 좋은 점

- 파일명과 역할이 직관적이다.
- TypeScript strict 모드라 타입 안정성이 나쁘지 않다.
- 공통 포맷 함수와 UI 컴포넌트가 있어 중복을 줄였다.
- 제품 의도가 화면 copy와 구조에 잘 반영돼 있다.

### 개선 우선순위

1. `screens`에서 form/row/list 컴포넌트를 분리
2. read-side에 cache/query 계층 도입 검토
3. mutations를 service/hook 레벨로 정리
4. 공개 사용자 포트폴리오/피드와 holding detail 전용 API 연결
5. import와 portfolio setup의 validation/partial success 처리 강화
6. 테스트 추가
   - 현재 테스트 파일은 없다

## 폴더별 실제 사용도 요약

- 활발히 사용:
  - `src/api`
  - `src/auth`
  - `src/navigation`
  - `src/components`
  - `src/screens`
  - `src/hooks`
  - `src/lib`
  - `src/theme`
- 최소 사용:
  - `src/types`
- 현재 비어 있음:
  - `src/data`

## 결론

현재 `folo-client`는 "실제 앱처럼 동작하는 Expo 클라이언트의 첫 번째 완성형 골격"
에 가깝다. 인증, 초기 포트폴리오 구성, 메인 탭, 상세 화면, 파일 import,
프로필 편집, 소셜 탐색까지 한 사이클이 이어진다. 설계상 핵심은
`신규 유저를 메인보다 먼저 포트폴리오 설정으로 보내는 구조`와
`직접 추가를 메인 경로, CSV/OCR/KIS를 보조 경로로 두는 제품 방향`이다.

다음 단계에서 가장 큰 가치가 나는 작업은
`public profile/feed detail 확장`, `trade mutation 완성`,
`KIS OAuth 실연동`, `query/mutation 구조 정리`다.
