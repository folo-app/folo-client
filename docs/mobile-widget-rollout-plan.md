# Folo Mobile Widget Rollout Plan

이 문서는 Folo 앱에 홈 화면 위젯을 추가하기 위한 `구현 기준 문서`다.
목표는 추후 다른 AI나 작업자가 이 문서만 읽고도 현재 저장소 상황, 기술 결정,
구현 순서, 검증 범위를 바로 이해하고 작업을 이어갈 수 있게 만드는 것이다.

## 1. 목표

- 최종 목표는 `App Store`와 `Google Play`에 배포 가능한 `프로덕션 품질`의 홈 화면 위젯 지원이다.
- 1차 위젯은 사용자가 참고로 전달한 시안과 유사한 `Growth Streak` 위젯으로 구현한다.
- 지원 범위:
  - iOS 홈 화면 위젯
  - Android 홈 화면 위젯
  - Small, Medium 사이즈 우선 지원
- 앱 본체는 계속 `Expo + React Native` 기반으로 유지한다.

## 2. 이 프로젝트에서 확정한 기술 결정

이 문서 이후 구현 작업에서는 아래 결정을 다시 뒤집지 않는다.

### 2.1 유지할 것

- 앱 본체는 `Expo` 생태계를 유지한다.
- 빌드/배포는 `EAS Build` 기준으로 정리한다.
- JS/TS 비즈니스 로직은 가능한 한 앱 레이어에서 유지한다.

### 2.2 도입할 것

- `Expo Go` 중심 개발에서 벗어나 `development build` 기반으로 전환한다.
- `expo prebuild`를 통해 `ios/`, `android/` 네이티브 프로젝트를 생성한다.
- 위젯 UI는 플랫폼별 네이티브 코드로 구현한다.
  - iOS: `WidgetKit + SwiftUI`
  - Android: `App Widget + Jetpack Glance`

### 2.3 이번 1차 구현에서 하지 않을 것

- 위젯을 일반 `React Native View`로 구현하려고 시도하지 않는다.
- `expo-widgets`를 프로덕션 핵심 경로로 채택하지 않는다.
  - 이유: 현재 공식 문서 기준 `alpha`이며 iOS 전용이다.
  - iOS 전용 실험에는 사용할 수 있지만, 이번 크로스플랫폼 롤아웃의 기본 해법은 아니다.
- 위젯이 네트워크 API를 직접 호출하게 만들지 않는다.
- 위젯이 `AsyncStorage`나 RN 메모리 상태를 직접 읽는 구조로 가지 않는다.
- 1차 출시 범위에 `Live Activity`, `Lock Screen Widget`, `interactive widget button`을 넣지 않는다.

## 3. 현재 저장소 기준 현황

### 3.1 앱 구조

- 현재 프로젝트는 `Expo managed` 상태다.
- 현재 루트에는 `ios/`, `android/`, `eas.json`이 없다.
- 현재 설정 파일은 `app.json` 단일 파일이다.
- 현재 앱 스킴은 `folo`다.

### 3.2 현재 코드에서 참고할 파일

- 앱 네비게이션 진입점: `src/navigation/AppNavigator.tsx`
- 인증/세션 저장: `src/auth/AuthProvider.tsx`
- API 설정: `src/api/config.ts`
- API 서비스: `src/api/services.ts`
- Heatmap 시각화 참고: `src/components/Heatmap.tsx`
- 현재 포트폴리오의 루틴/스트릭 참고 로직: `src/screens/PortfolioScreen.tsx`

### 3.3 현재 구조에서 바로 위젯 구현이 안 되는 이유

- 세션은 `AsyncStorage`에 저장되고, API 액세스 토큰은 앱 JS 메모리에서 관리된다.
- 위젯은 RN JS 런타임 안에서 렌더링되지 않는다.
- Android 위젯은 앱과 다른 프로세스에서 동작할 수 있다.
- 따라서 위젯은 앱 상태를 직접 재사용하지 않고, 앱이 만들어 둔 `위젯 전용 snapshot`만 읽어야 한다.

## 4. 제품 범위

### 4.1 1차 출시 대상 위젯

`Growth Streak Widget`

- Small widget
  - 최근 활동 히트맵
  - 현재 월 라벨
  - 짧은 보조 문구
- Medium widget
  - 최근 활동 히트맵
  - 현재 streak
  - longest streak
  - 상태 pill

### 4.2 1차 제품 의미 정의

이번 1차에서는 `Growth Streak`를 아래처럼 정의한다.

- `activity day`: 해당 날짜에 사용자 본인의 거래 기록이 1건 이상 존재하는 날
- `current streak`: 오늘을 기준으로 거슬러 올라가며 연속된 `activity day` 개수
- `longest streak`: 최근 365일 기준 가장 긴 연속 `activity day` 개수
- `heatmap`: 최근 35일의 거래 활동 강도

### 4.3 활동 강도 규칙

히트맵 각 셀의 `level`은 아래처럼 계산한다.

- `0`: 거래 없음
- `1`: 1건
- `2`: 2건
- `3`: 3건
- `4`: 4건 이상

이 규칙은 현재 데이터만으로 구현 가능하며, 이후 백엔드가 더 정교한 습관/루틴 완료
모델을 제공하더라도 snapshot 빌더만 교체하면 된다.

### 4.4 상태 pill 규칙

Medium widget 우측 상단 pill은 아래 규칙을 사용한다.

- `ACTIVE`: 최근 7일 내 activity day가 1일 이상 있음
- `IDLE`: 최근 7일 내 activity day가 없음
- `SETUP`: 최근 35일 기록이 전혀 없음

## 5. 디자인 원칙

- Folo의 기존 톤을 유지한다.
  - 밝은 바탕
  - 숫자 중심
  - 금융 앱다운 가독성
  - 작은 화면에서 우선 읽히는 계층
- 카드보다 더 단순한 위젯 전용 정보 구조를 사용한다.
- 정보는 `한눈에 읽히는 숫자 + 작은 패턴`에 집중한다.
- 위젯은 스크롤을 전제로 설계하지 않는다.
- 시안의 초록 계열 방향은 유지하되, Folo 전체 앱 톤과 크게 충돌하지 않게 정리한다.

### 5.1 권장 색 방향

- background: `#FFFFFF`
- text strong: `#0F172A`
- text muted: `#6B7280`
- green scale:
  - `#ECFDF3`
  - `#BBF7D0`
  - `#86EFAC`
  - `#22C55E`
  - `#166534`
- border/empty cell: `#E5E7EB`

### 5.2 Small 위젯 카피

- title: `Growth Streak`
- month label: 현재 월 영문 약어 또는 전체 월명
- footer copy:
  - `Keep growing`
  - 또는 상태 기반 문구

### 5.3 Medium 위젯 카피

- title: `Growth Streak`
- current metric label: `CURRENT STREAK`
- longest metric label: `LONGEST STREAK`
- pill: `ACTIVE`, `IDLE`, `SETUP`

## 6. 아키텍처 원칙

### 6.1 핵심 원칙

위젯은 `표시 전용 렌더러`다.

- 데이터 수집: 앱 JS/TS 레이어
- 데이터 정제/집계: 앱 JS/TS 레이어
- snapshot 저장: 플랫폼 공유 저장소
- 실제 화면 렌더링: 플랫폼 위젯 레이어

즉, Swift/Kotlin 쪽에 비즈니스 계산을 중복 구현하지 않는다.

### 6.2 권장 데이터 흐름

1. 앱이 로그인/부트스트랩/포그라운드 전환/핵심 데이터 변경 시 위젯 소스 데이터를 fetch 한다.
2. JS/TS에서 `GrowthWidgetSnapshot`을 계산한다.
3. 네이티브 브리지를 통해 snapshot JSON을 공유 저장소에 저장한다.
4. 저장 직후 플랫폼별 위젯 reload를 요청한다.
5. 위젯은 저장된 최신 snapshot만 읽어서 렌더링한다.

### 6.3 저장소 원칙

- iOS: `App Group container`
- Android: `SharedPreferences` 또는 앱 전용 파일 저장소

공유 데이터는 JSON 직렬화 형식으로 유지한다.

## 7. Snapshot 계약

아래 타입을 앱과 위젯 간의 고정 계약으로 사용한다.

```ts
export type GrowthWidgetSnapshot = {
  schemaVersion: 1;
  generatedAt: string;
  deepLinkUrl: string;
  title: string;
  monthLabel: string;
  status: 'ACTIVE' | 'IDLE' | 'SETUP';
  currentStreak: number;
  longestStreak: number;
  footerCopy: string;
  cells: GrowthWidgetCell[];
};

export type GrowthWidgetCell = {
  date: string;
  level: 0 | 1 | 2 | 3 | 4;
  isToday: boolean;
};
```

### 7.1 snapshot 규칙

- `schemaVersion`은 breaking change가 생길 때만 올린다.
- `generatedAt`은 ISO string UTC 기준으로 저장한다.
- `deepLinkUrl`은 위젯 탭 시 앱이 열릴 URL이다.
- `cells`는 항상 `35개` 고정 길이로 유지한다.
- 가장 오래된 셀이 앞, 가장 최근 날짜가 뒤에 오도록 저장한다.

### 7.2 placeholder snapshot

로그인 전이거나 데이터가 없을 때도 위젯이 깨지면 안 된다.

- 로그인 안 됨: `SETUP`
- 거래 기록 없음: `SETUP`
- snapshot 읽기 실패: 위젯 내부 기본 placeholder 사용

## 8. 딥링크 규칙

현재 앱 스킴은 이미 `folo`이므로 이를 그대로 사용한다.

### 8.1 1차 딥링크 URL

- Small: `folo://widget/growth-streak`
- Medium: `folo://widget/growth-streak`

### 8.2 앱 라우팅 규칙

1차 구현에서는 복잡한 분기 없이 위젯 탭 시 `Portfolio` 탭으로 이동한다.

- 목표 라우트: `MainTabs > Portfolio`
- 선택적으로 query param `source=widget-growth`를 붙일 수 있다.

### 8.3 금지

- 위젯별로 서로 다른 임시 URL 규칙을 만들지 않는다.
- 특정 OS에서만 다른 스킴 경로를 쓰지 않는다.

## 9. 구현 전략: 단계별 작업 순서

아래 순서는 실제 구현 순서다. 순서를 바꾸지 않는다.

### Phase 0. 기초 전환

목표: 위젯 개발이 가능한 빌드 체계로 전환

#### 작업

1. `app.json`을 `app.config.ts`로 옮긴다.
2. `ios.bundleIdentifier`, `android.package`를 명시한다.
3. `expo-dev-client`를 추가한다.
4. `eas.json`을 추가한다.
5. `development`, `preview`, `production` 빌드 프로필을 정의한다.
6. `npx expo prebuild`로 `ios/`, `android/`를 생성한다.
7. 생성된 네이티브 프로젝트를 커밋 대상으로 포함한다.

#### 중요한 결정

이번 위젯 작업에서는 `ios/`, `android/`를 저장소에 유지한다.

이유:

- iOS widget extension
- Android widget receiver / provider metadata
- Swift / Kotlin 위젯 코드

이 세 가지는 장기 유지보수 대상이다. 이를 1차부터 모두 config plugin으로 우회하면
구현 난이도와 디버깅 비용이 불필요하게 커진다.

즉, 이번 프로젝트는 `Expo ecosystem 유지 + native directories 직접 관리` 방식으로 간다.

#### 산출물

- `app.config.ts`
- `eas.json`
- `ios/`
- `android/`

#### 검증

- `npm run typecheck`
- `npx expo run:ios`
- `npx expo run:android`
- dev build가 실행되고 로그인까지 가능해야 한다.

### Phase 1. 위젯 도메인 로직 추가

목표: 네이티브 렌더링과 분리된 위젯 데이터 계층 구축

#### 추가할 디렉터리

```text
src/features/widgets/
  types.ts
  buildGrowthWidgetSnapshot.ts
  fetchGrowthWidgetSourceData.ts
  syncGrowthWidgetSnapshot.ts
  widgetDeepLinks.ts
  index.ts
```

#### 작업

1. `GrowthWidgetSnapshot` 타입 정의
2. 최근 35일 heatmap 계산 함수 구현
3. 최근 365일 `longest streak` 계산 함수 구현
4. 최근 7일 activity 기반 `status` 계산 함수 구현
5. 위젯 딥링크 생성 함수 구현
6. `getMyTrades`를 페이지네이션으로 반복 호출해 필요한 범위까지 데이터 수집
7. snapshot 생성 유닛 테스트 작성

#### 소스 데이터 규칙

- streak 계산은 최근 365일 거래 기록이 필요하다.
- 35일 heatmap만 보고 longest streak를 계산하면 안 된다.
- `getMyTrades()`는 기본 size가 20이므로 충분하지 않을 수 있다.
- 반드시 `hasNext`를 확인하며 반복 fetch 해야 한다.
- cutoff 이전 데이터만 확보되면 fetch를 중단할 수 있다.

#### 산출물

- JS/TS 기준 완전한 snapshot 생성기
- 테스트 가능한 순수 함수 계층

#### 검증

- `npm run typecheck`
- snapshot builder 단위 테스트 통과
- 아래 케이스를 모두 통과
  - 기록 없음
  - 오늘만 기록 있음
  - 연속 3일 기록
  - 중간에 빈 날짜 포함
  - 365일 내 최장 streak 계산

### Phase 2. 앱-위젯 공유 저장 브리지

목표: 앱이 만든 snapshot을 네이티브 위젯이 읽을 수 있게 연결

#### 추가할 앱 레이어 파일

```text
src/features/widgets/native/
  WidgetSnapshotBridge.ts
```

#### 작업

1. iOS용 native bridge 작성
   - snapshot JSON 저장
   - Widget reload 요청
2. Android용 native bridge 작성
   - snapshot JSON 저장
   - AppWidget update 요청
3. JS에서 브리지를 호출하는 래퍼 함수 작성

#### 브리지 인터페이스 예시

```ts
export type WidgetSnapshotBridge = {
  saveGrowthSnapshot(snapshot: GrowthWidgetSnapshot): Promise<void>;
  clearGrowthSnapshot(): Promise<void>;
};
```

#### 검증

- 로그인 상태에서 snapshot 저장 성공
- 로그아웃 시 snapshot 삭제 성공
- 저장 후 위젯 reload 호출 성공

### Phase 3. 동기화 트리거 연결

목표: 위젯이 stale 상태로 오래 남지 않게 앱 이벤트와 연결

#### 반드시 연결할 트리거

1. 앱 부트스트랩 완료 후
2. 로그인 성공 후
3. 로그아웃 후
4. 앱이 foreground로 돌아온 후
5. 거래 생성/수정/삭제 성공 후
6. 포트폴리오 동기화 성공 후
7. 리마인더 생성/수정/삭제 성공 후

#### 연결 위치 원칙

- mutation 성공 콜백에서 직접 계산 로직을 중복 작성하지 않는다.
- `syncGrowthWidgetSnapshot()` 같은 단일 엔트리 함수를 호출한다.
- 같은 snapshot 생성 절차를 여러 화면에 복붙하지 않는다.

#### 우선 연결 대상 파일

- `src/auth/AuthProvider.tsx`
- 거래 생성/수정/삭제 화면들
- `src/screens/KisConnectScreen.tsx`
- 리마인더 관련 화면들

#### 검증

- 로그인 직후 위젯 데이터 생성
- 거래 추가 후 위젯 수치 갱신
- 로그아웃 후 위젯 placeholder 복귀

### Phase 4. 앱 딥링크 정식 지원

목표: 위젯 탭 시 의도한 화면으로 안정적으로 진입

#### 작업

1. `NavigationContainer`에 linking 설정 추가
2. `folo://widget/growth-streak` 처리
3. 해당 URL을 `MainTabs > Portfolio`로 매핑
4. 필요 시 `source=widget-growth` query param 처리

#### 검증

- 앱 종료 상태에서 위젯 탭
- 앱 백그라운드 상태에서 위젯 탭
- 이미 Portfolio 탭에 있을 때 위젯 탭

모든 경우 정상적으로 Portfolio 화면으로 진입해야 한다.

### Phase 5. iOS 위젯 구현

목표: iOS 홈 화면 Small/Medium 위젯 출시 가능 상태 확보

#### 추가할 네이티브 자산 예시

```text
ios/FoloGrowthWidgetExtension/
  FoloGrowthWidgetBundle.swift
  FoloGrowthWidget.swift
  GrowthWidgetEntry.swift
  GrowthWidgetSnapshotStore.swift
  GrowthWidgetViews/
    GrowthWidgetSmallView.swift
    GrowthWidgetMediumView.swift
```

실제 경로/타깃명은 prebuild 결과에 맞춰 조정하되, 역할은 위와 같이 분리한다.

#### 작업

1. widget extension target 추가
2. App Group capability 연결
3. snapshot 읽기 스토어 구현
4. placeholder / empty / active 상태 구현
5. Small 레이아웃 구현
6. Medium 레이아웃 구현
7. 위젯 탭 URL 연결
8. 시스템 폰트/spacing 최적화

#### iOS 구현 원칙

- SwiftUI view 안에서 비즈니스 계산을 하지 않는다.
- 이미 계산된 snapshot을 그대로 그린다.
- snapshot 누락 시 기본 placeholder를 안전하게 표시한다.
- 레이아웃은 고정적이고 안정적으로 유지한다.

#### 검증

- iOS simulator / device에서 위젯 추가 가능
- Small, Medium 모두 레이아웃 깨짐 없음
- snapshot 저장 후 UI가 갱신됨
- 위젯 탭 시 앱 열림

### Phase 6. Android 위젯 구현

목표: Android 홈 화면 Small/Medium 위젯 출시 가능 상태 확보

#### 추가할 네이티브 자산 예시

```text
android/app/src/main/java/.../widget/
  GrowthWidget.kt
  GrowthWidgetReceiver.kt
  GrowthWidgetStateRepository.kt

android/app/src/main/res/xml/
  growth_widget_info.xml

android/app/src/main/res/drawable/
  widget_background.xml
```

#### 작업

1. `GlanceAppWidget` 구현
2. receiver/provider 등록
3. 공유 snapshot 저장소 읽기 구현
4. Small 레이아웃 구현
5. Medium 레이아웃 구현
6. tap action deep link 연결
7. 위젯 갱신 요청 연동

#### Android 구현 원칙

- 위젯 상태는 메모리 의존 없이 snapshot 저장소에서 복원 가능해야 한다.
- 앱 프로세스가 죽어도 위젯 placeholder가 아닌 마지막 정상 snapshot을 보여줄 수 있어야 한다.
- Android 12 이상과 그 이하에서 레이아웃 차이를 최소화한다.

#### 검증

- 홈 화면에 위젯 추가 가능
- 앱 종료 후에도 최근 snapshot 유지
- 거래 추가 후 widget refresh 반영
- 탭 시 앱 deep link 정상 동작

### Phase 7. QA 및 스토어 배포 준비

목표: 실제 스토어 제출 가능한 품질 확보

#### 테스트 매트릭스

- iOS
  - simulator
  - 실제 기기
  - TestFlight
- Android
  - emulator
  - 실제 기기
  - Internal testing track

#### 반드시 확인할 항목

- 로그인 상태 / 로그아웃 상태
- 데이터 없음 / 데이터 있음
- 연속 streak 0 / 1 / 다일
- widget reload latency
- OS 재부팅 후 위젯 상태
- 앱 삭제 후 재설치 시 placeholder 상태
- 다국어 확장 가능성

#### 스토어 관점 체크

- iOS extension signing 문제 없음
- App Group capability 프로비저닝 문제 없음
- Android manifest/provider 설정 문제 없음
- release build에서만 발생하는 리소스/obfuscation 이슈 없음

## 10. 권장 파일 작업 순서

실제 구현은 아래 순서대로 진행한다.

1. `app.config.ts`, `eas.json`
2. `src/features/widgets/*`
3. linking 설정
4. JS -> native bridge
5. iOS widget extension
6. Android widget
7. 동기화 트리거 보강
8. QA, polish, release

## 11. 브랜치/커밋 전략

작업은 작은 슬라이스로 나눈다.

### 권장 브랜치명

- `godten/widget-foundation`

### 권장 커밋 슬라이스

1. `chore: 위젯 개발 기반 구성`
2. `feat: growth widget snapshot 로직 추가`
3. `feat: 위젯 딥링크 및 동기화 트리거 추가`
4. `feat: ios growth widget 추가`
5. `feat: android growth widget 추가`
6. `test: 위젯 검증 및 문서 보강`

한 커밋에 foundation, iOS, Android를 모두 섞지 않는다.

## 12. 구현 시 금지사항

- 위젯 화면을 RN 쪽에서 캡처 이미지처럼 만들어 붙이지 않는다.
- Swift/Kotlin에서 API 인증 로직을 다시 만들지 않는다.
- 위젯 전용 계산 로직을 플랫폼별로 중복 구현하지 않는다.
- 화면마다 다른 방식으로 snapshot을 만들지 않는다.
- 위젯 탭 시 임시 URL 스킴을 무분별하게 추가하지 않는다.
- config plugin 복잡도를 줄이겠다고 다시 managed-only 경로로 되돌아가지 않는다.

## 13. Definition of Done

아래 조건을 모두 만족하면 1차 위젯 롤아웃 완료로 본다.

- iOS/Android 모두 홈 화면 위젯이 추가 가능하다.
- Small/Medium 모두 정상 표시된다.
- 앱이 snapshot을 생성하고 공유 저장소에 저장한다.
- 로그인/로그아웃/거래 변경 후 위젯이 기대한 범위 내에서 갱신된다.
- 위젯 탭 시 앱이 `Portfolio` 탭으로 열린다.
- dev build, preview build, production build 모두 성공한다.
- release candidate에서 눈에 띄는 레이아웃 깨짐이 없다.

## 14. 후속 확장 후보

1차 완료 후 검토 가능한 항목:

- Lock Screen widget
- Live Activity
- 포트폴리오 요약 위젯
- 배당 캘린더 위젯
- 루틴/리마인더 완료 기반 streak 모델로 교체
- backend 전용 `/widgets/growth-streak` endpoint 도입

## 15. 공식 참고 자료

- Expo development builds: https://docs.expo.dev/develop/development-builds/introduction/
- Expo prebuild / CNG: https://docs.expo.dev/workflow/prebuild/
- Expo app extensions: https://docs.expo.dev/build-reference/app-extensions/
- EAS Build: https://docs.expo.dev/build/introduction/
- Apple WidgetKit: https://developer.apple.com/documentation/widgetkit/creating-a-widget-extension/
- Android App Widgets: https://developer.android.com/develop/ui/views/appwidgets/overview
- Android Glance: https://developer.android.com/develop/ui/compose/glance/glance-app-widget

## 16. AI 작업자 메모

추후 이 문서를 보고 작업하는 AI는 아래 규칙을 따른다.

- 먼저 `Phase 0`부터 끝내고 다음 단계로 넘어간다.
- iOS/Android를 동시에 건드리기 전에 `snapshot domain`을 먼저 만든다.
- 구현 중 결정이 애매하면 `위젯은 표시 전용, 계산은 앱 레이어` 원칙을 우선한다.
- 문서에 없는 임의 구조를 새로 발명하기보다, 여기서 정한 계약과 순서를 따른다.
- 위젯 구현 중에도 앱 UI 전체를 재설계하지 않는다.
- 각 단계 후 `npm run typecheck`를 실행한다.
