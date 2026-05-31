export class ApiError extends Error {
  status: number;
  code?: number;
  debugMessage?: string;

  constructor(params: { message: string; status: number; code?: number; debugMessage?: string }) {
    super(params.message);
    this.name = 'ApiError';
    this.status = params.status;
    this.code = params.code;
    this.debugMessage = params.debugMessage;
  }
}

export function toUserMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  return '요청 처리 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.';
}
