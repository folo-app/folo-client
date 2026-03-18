# Backend Contract Snapshot

`folo-backend`를 확인해 현재 프론트에서 직접 연결한 엔드포인트와 DTO 기준을 정리한 문서다.

## Connected Endpoints

- `GET /feed`
- `GET /portfolio`
- `GET /trades/{tradeId}`
- `GET /trades/{tradeId}/comments`
- `GET /users/me`
- `PATCH /users/me`
- `GET /notifications`
- `GET /reminders`
- `POST /trades`
- `GET /stocks/search`
- `GET /stocks/{ticker}/price`

## Envelope Rule

모든 성공 응답은 아래 형태를 전제로 처리한다.

```json
{
  "success": true,
  "data": {},
  "message": "요청이 성공했습니다.",
  "timestamp": "2026-03-18T13:25:08Z"
}
```

실패 응답은 `error.code`, `error.message`를 포함한다고 가정한다.

## Notes

- 현재 로컬에서 `http://localhost:8080/api` 서버는 떠 있지 않아 프론트는 자동으로 샘플 데이터 fallback을 사용한다.
- 인증이 필요한 엔드포인트가 대부분이므로 `EXPO_PUBLIC_FOLO_ACCESS_TOKEN`이 없으면 요청 전에 fallback으로 전환된다.
- 백엔드 워킹트리에서 `docs/openapi.json`은 현재 직접 접근할 수 없어서, DTO 필드는 컴파일된 클래스와 기존 응답 문서를 기준으로 수동 반영했다.
