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
  try {
    const response = await postJson<AppleLoginResponseDto>('/api/v1/auth/apple/login', {
      body: dto,
    });

    return toAuthSession(response);
  } catch (error) {
    const normalized =
      typeof error === 'object' && error !== null
        ? {
            name: 'name' in error ? error.name : undefined,
            message: 'message' in error ? error.message : undefined,
            status: 'status' in error ? error.status : undefined,
            code: 'code' in error ? error.code : undefined,
            debugMessage: 'debugMessage' in error ? error.debugMessage : undefined,
          }
        : { message: String(error) };

    console.error('[apple-login][auth-service]', {
      ...normalized,
      hasIdentityToken: Boolean(dto.identityToken),
      hasAuthorizationCode: Boolean(dto.authorizationCode),
      identityTokenLength: dto.identityToken?.length ?? 0,
      authorizationCodeLength: dto.authorizationCode?.length ?? 0,
      hasEmail: Boolean(dto.email),
      hasName: Boolean(dto.name),
    });
    throw error;
  }
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
