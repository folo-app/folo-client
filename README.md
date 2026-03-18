# folo-client

Expo 기반의 Folo 프론트엔드 작업 틀입니다. 첨부된 기획서의 핵심 IA와 디자인 방향을 기준으로 홈, 피드, 거래 추가, 포트폴리오, 프로필 구조를 먼저 구현했습니다.

## Run

```bash
npm install
npm run web
```

모바일 프리뷰가 필요하면 `npm run ios` 또는 `npm run android`를 사용할 수 있습니다.

## API

- 기본 API URL: `EXPO_PUBLIC_FOLO_API_URL`
- 기본값: `http://localhost:8080/api`
- 인증 토큰: `EXPO_PUBLIC_FOLO_ACCESS_TOKEN`

예시:

```bash
EXPO_PUBLIC_FOLO_API_URL=http://localhost:8080/api \
EXPO_PUBLIC_FOLO_ACCESS_TOKEN=your_jwt_token \
npm run web
```

백엔드가 꺼져 있거나 토큰이 없으면 화면은 자동으로 샘플 데이터 fallback으로 동작합니다.

## Structure

- `App.tsx`: 앱 진입점
- `src/navigation`: React Navigation 기반 `Root Stack + Bottom Tabs`
- `src/api`: 백엔드 계약 타입, API 클라이언트, fallback 데이터
- `src/screens`: 탭 화면과 상세 화면
- `src/components`: 공통 UI 컴포넌트
- `src/data/mock.ts`: 백엔드 비연동 영역용 정적 설계 데이터
- `docs/frontend-blueprint.md`: 화면 설계 기준 정리
- `docs/contracts/backend-contract.md`: 연결한 백엔드 계약 요약
