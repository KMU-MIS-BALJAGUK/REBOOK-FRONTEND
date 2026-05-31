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
  return requestJson<TResponse>('POST', path, options, false);
}

export async function getJson<TResponse>(path: string, options: RequestOptions = {}): Promise<TResponse> {
  return requestJson<TResponse>('GET', path, options, false);
}

async function requestJson<TResponse>(
  method: 'GET' | 'POST',
  path: string,
  options: RequestOptions,
  hasRetriedAfterRefresh: boolean,
): Promise<TResponse> {
  const accessToken = options.auth ? getAccessToken() : null;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      ...DEFAULT_HEADERS,
      ...(options.auth && accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...options.headers,
    },
    body: method === 'POST' && options.body ? JSON.stringify(options.body) : undefined,
  });

  let json: Partial<Envelope<TResponse>> | undefined;
  try {
    json = (await response.json()) as Envelope<TResponse>;
  } catch {
    json = undefined;
  }
  const isAuthError = response.status === 401 || json?.code === 401;

  if (options.auth && isAuthError && !hasRetriedAfterRefresh) {
    try {
      await refreshSessionSingleFlight();
      return requestJson<TResponse>(method, path, options, true);
    } catch (refreshError) {
      await clearSession();
      throw refreshError;
    }
  }

  if (!response.ok || (typeof json?.code === 'number' && json.code >= 400)) {
    throw new ApiError({
      message: json?.msg || `요청을 처리하지 못했어요. (${response.status})`,
      status: response.status,
      code: json?.code,
      debugMessage: `${method} ${path} failed with HTTP ${response.status}${json?.code ? ` / code ${json.code}` : ''}`,
    });
  }

  if (typeof json?.data === 'undefined') {
    throw new ApiError({
      message: '응답 데이터 형식이 올바르지 않아요.',
      status: response.status,
      code: json?.code,
      debugMessage: `${method} ${path} returned no parsable data`,
    });
  }

  return json.data;
}
