# folo-client

Expo 기반의 Folo 앱 클라이언트입니다. 인증 진입 흐름과 메인 탭, 상세 화면, 실제 백엔드 연동을 포함한 모바일 앱 구조를 구현했습니다.

## Run

```bash
npm install
npx expo start
```

실행 후 `i`, `a`, `w`로 iOS Simulator, Android Emulator, web 프리뷰를 열 수 있습니다.

## API

- 기본 API URL: `EXPO_PUBLIC_FOLO_API_URL`
- 기본값: `http://localhost:8080/api`
- 로그인 이후 access token은 앱이 `AsyncStorage`에 저장하고 자동 갱신합니다.
- 개발 중 고정 토큰으로 붙이고 싶으면 `EXPO_PUBLIC_FOLO_ACCESS_TOKEN`도 사용할 수 있습니다.

## Structure

- `App.tsx`: 앱 진입점
- `src/auth`: 세션 복원, 로그인, 회원가입, 이메일 인증 상태 관리
- `src/navigation`: React Navigation 기반 `Root Stack + Bottom Tabs`
- `src/api`: 백엔드 계약 타입, API 클라이언트
- `src/screens`: 탭 화면과 상세 화면
- `src/components`: 공통 UI 컴포넌트
- `docs/frontend-blueprint.md`: 화면 설계 기준 정리
- `docs/contracts/backend-contract.md`: 연결한 백엔드 계약 요약
