import { API_BASE_URL, DEFAULT_HEADERS } from '../constants/api';
import { ApiError } from '../utils/apiError';

type RequestOptions = {
  body?: unknown;
  headers?: Record<string, string>;
};

type Envelope<T> = {
  code: number;
  msg: string;
  data: T;
};

export async function postJson<TResponse>(path: string, options: RequestOptions = {}): Promise<TResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      ...DEFAULT_HEADERS,
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const json = (await response.json()) as Envelope<TResponse>;

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
