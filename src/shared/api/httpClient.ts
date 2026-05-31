import { API_BASE_URL, DEFAULT_HEADERS } from '../constants/api';
import { clearSession, getAccessToken, refreshSessionSingleFlight } from '../auth/authSession';
import { ApiError } from '../utils/apiError';

type RequestOptions = {
  body?: unknown;
  headers?: Record<string, string>;
  auth?: boolean;
};

type Envelope<T> = {
  code: number;
  msg: string;
  data: T;
};

export async function postJson<TResponse>(path: string, options: RequestOptions = {}): Promise<TResponse> {
  return requestJson<TResponse>(path, options, false);
}

async function requestJson<TResponse>(
  path: string,
  options: RequestOptions,
  hasRetriedAfterRefresh: boolean,
): Promise<TResponse> {
  const accessToken = options.auth ? getAccessToken() : null;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      ...DEFAULT_HEADERS,
      ...(options.auth && accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const json = (await response.json()) as Envelope<TResponse>;
  const isAuthError = response.status === 401 || json.code === 401;

  if (options.auth && isAuthError && !hasRetriedAfterRefresh) {
    try {
      await refreshSessionSingleFlight();
      return requestJson<TResponse>(path, options, true);
    } catch (refreshError) {
      await clearSession();
      throw refreshError;
    }
  }

  if (!response.ok || json.code >= 400) {
    throw new ApiError({
      message: json.msg || '요청을 처리하지 못했어요.',
      status: response.status,
      code: json.code,
      debugMessage: `POST ${path} failed with response code ${json.code}`,
    });
  }

  return json.data;
}
