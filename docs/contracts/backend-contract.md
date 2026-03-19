# Backend Contract Snapshot

`folo-backend`를 확인해 현재 프론트에서 직접 연결한 엔드포인트와 DTO 기준을 정리한 문서다.

## Connected Endpoints

- `POST /auth/signup`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `POST /auth/email/verify`
- `POST /auth/email/confirm`
- `GET /feed`
- `GET /portfolio`
- `GET /trades/{tradeId}`
- `GET /trades/{tradeId}/comments`
- `GET /users/me`
- `GET /users/{userId}`
- `GET /users/search`
- `PATCH /users/me`
- `PATCH /users/me/kis-key`
- `GET /notifications`
- `PATCH /notifications/read`
- `PATCH /notifications/{notificationId}/read`
- `GET /reminders`
- `PATCH /reminders/{reminderId}`
- `DELETE /reminders/{reminderId}`
- `POST /trades`
- `POST /follows/{userId}`
- `DELETE /follows/{userId}`
- `GET /follows/followers`
- `GET /follows/followings`
- `GET /stocks/search`
- `GET /stocks/{ticker}/price`
- `GET /trades/me`
- `POST /portfolio/sync`

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

- 2026-03-19 기준 로컬 백엔드에서 `signup -> email confirm -> login -> refresh -> users/me -> portfolio -> reminders` 흐름을 실제로 검증했다.
- 로그인 `500` 이슈는 `AuthService.login()`이 read-only 트랜잭션에서 refresh token을 저장하던 문제였고, 현재 레포에서는 수정됐다.
- 프론트는 더 이상 샘플 fallback 데이터를 사용하지 않는다. 인증이 필요한 화면은 로그인 세션이 없으면 접근 전에 차단된다.
- 백엔드 워킹트리에서 `docs/openapi.json`은 현재 직접 접근할 수 없어서, DTO 필드는 컴파일된 클래스와 기존 응답 문서를 기준으로 수동 반영했다.

## Not Yet Wired

- `DELETE /auth/withdraw`
- `PATCH /notifications/settings`
- `PATCH /trades/{tradeId}`
- `DELETE /trades/{tradeId}`
- `POST /portfolio/import/csv`
- `POST /portfolio/import/confirm`
- `POST /portfolio/import/ocr`
- `POST /trades/{tradeId}/reactions`
- `DELETE /trades/{tradeId}/reactions`
- `GET /feed/{userId}`
- `GET /portfolio/{userId}`
- `DELETE /trades/{tradeId}/comments/{commentId}`
