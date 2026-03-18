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
};

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { requiresAuth = true, headers, body, ...rest } = options;
  const finalHeaders = new Headers(headers);

  if (body && !finalHeaders.has('Content-Type')) {
    finalHeaders.set('Content-Type', 'application/json');
  }

  if (requiresAuth) {
    if (!foloApiConfig.accessToken) {
      throw new ApiClientError(
        'EXPO_PUBLIC_FOLO_ACCESS_TOKEN이 없어 샘플 데이터로 대체합니다.',
        'MISSING_ACCESS_TOKEN',
      );
    }
    finalHeaders.set('Authorization', `Bearer ${foloApiConfig.accessToken}`);
  }

  const response = await fetch(`${foloApiConfig.baseUrl}${path}`, {
    ...rest,
    headers: finalHeaders,
    body:
      typeof body === 'string' || body === undefined
        ? body
        : JSON.stringify(body),
  });

  let payload: ApiResponse<T> | null = null;

  try {
    payload = (await response.json()) as ApiResponse<T>;
  } catch {
    throw new ApiClientError('백엔드 응답을 해석하지 못했습니다.', 'INVALID_JSON');
  }

  if (!response.ok || !payload.success || payload.data === null) {
    throw new ApiClientError(
      payload.error?.message ?? payload.message ?? '요청이 실패했습니다.',
      payload.error?.code,
    );
  }

  return payload.data;
}
