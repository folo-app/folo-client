import { foloApiConfig } from './config';
import type { ApiResponse } from './contracts';

export class ApiClientError extends Error {
  code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.name = 'ApiClientError';
    this.code = code;
  }
}

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: BodyInit | object | null;
  requiresAuth?: boolean;
  allowEmptyData?: boolean;
};

function isBodyInitLike(value: RequestOptions['body']): value is BodyInit {
  if (
    value === null ||
    value === undefined ||
    typeof value === 'string' ||
    (typeof FormData !== 'undefined' && value instanceof FormData) ||
    (typeof URLSearchParams !== 'undefined' && value instanceof URLSearchParams)
  ) {
    return true;
  }

  if (typeof Blob !== 'undefined' && value instanceof Blob) {
    return true;
  }

  if (value instanceof ArrayBuffer || ArrayBuffer.isView(value)) {
    return true;
  }

  return false;
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { requiresAuth = true, allowEmptyData = false, headers, body, ...rest } = options;
  const finalHeaders = new Headers(headers);

  if (body && !isBodyInitLike(body) && !finalHeaders.has('Content-Type')) {
    finalHeaders.set('Content-Type', 'application/json');
  }

  if (requiresAuth) {
    if (!foloApiConfig.accessToken) {
      throw new ApiClientError(
        '로그인이 필요합니다.',
        'MISSING_ACCESS_TOKEN',
      );
    }
    finalHeaders.set('Authorization', `Bearer ${foloApiConfig.accessToken}`);
  }

  const response = await fetch(`${foloApiConfig.baseUrl}${path}`, {
    ...rest,
    headers: finalHeaders,
    body:
      body === undefined || body === null
        ? undefined
        : isBodyInitLike(body)
          ? body
          : JSON.stringify(body),
  });

  let payload: ApiResponse<T> | null = null;

  try {
    payload = (await response.json()) as ApiResponse<T>;
  } catch {
    throw new ApiClientError('백엔드 응답을 해석하지 못했습니다.', 'INVALID_JSON');
  }

  if (!response.ok || !payload.success || (payload.data === null && !allowEmptyData)) {
    throw new ApiClientError(
      payload.error?.message ?? payload.message ?? '요청이 실패했습니다.',
      payload.error?.code,
    );
  }

  return (payload.data ?? undefined) as T;
}
