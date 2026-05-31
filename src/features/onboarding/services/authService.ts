import { postJson } from '../../../shared/api/httpClient';
import { getSession, registerRefreshHandler } from '../../../shared/auth/authSession';
import {
  toAppleLoginRequestDto,
  toAuthSession,
  toAuthSessionFromRefresh,
  toRefreshTokenRequestDto,
} from '../model/auth.mapper';
import { AppleLoginResponseDto, RefreshTokenResponseDto } from '../model/auth.dto';
import { AppleLoginInput, AuthSession } from '../model/auth.types';

export async function appleLogin(input: AppleLoginInput): Promise<AuthSession> {
  const dto = toAppleLoginRequestDto(input);
  const response = await postJson<AppleLoginResponseDto>('/api/v1/auth/apple/login', {
    body: dto,
  });

  return toAuthSession(response);
}

export async function refreshAccessToken(deviceId?: string): Promise<AuthSession> {
  const session = getSession();
  if (!session?.refreshToken) {
    throw new Error('리프레시 토큰이 없어 재로그인이 필요해요.');
  }

  const dto = toRefreshTokenRequestDto({
    refreshToken: session.refreshToken,
    deviceId,
  });

  const response = await postJson<RefreshTokenResponseDto>('/api/v1/auth/refresh', {
    body: dto,
  });

  return toAuthSessionFromRefresh(response);
}

registerRefreshHandler(() => refreshAccessToken());
