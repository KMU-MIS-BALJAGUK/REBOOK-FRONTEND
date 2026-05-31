import {
  AppleLoginRequestDto,
  AppleLoginResponseDto,
  RefreshTokenRequestDto,
  RefreshTokenResponseDto,
} from './auth.dto';
import { AppleLoginInput, AuthSession } from './auth.types';

export function toAppleLoginRequestDto(input: AppleLoginInput): AppleLoginRequestDto {
  return {
    identityToken: input.identityToken,
    authorizationCode: input.authorizationCode,
    email: input.email,
    name: input.name,
    deviceId: input.deviceId,
  };
}

export function toAuthSession(dto: AppleLoginResponseDto): AuthSession {
  return {
    userId: dto.userId,
    accessToken: dto.accessToken,
    accessTokenExpiresInSeconds: dto.accessTokenExpiresInSeconds,
    refreshToken: dto.refreshToken,
    refreshTokenExpiresInSeconds: dto.refreshTokenExpiresInSeconds,
    firstLogin: dto.firstLogin,
  };
}

export function toRefreshTokenRequestDto(input: { refreshToken: string; deviceId?: string }): RefreshTokenRequestDto {
  return {
    refreshToken: input.refreshToken,
    deviceId: input.deviceId,
  };
}

export function toAuthSessionFromRefresh(dto: RefreshTokenResponseDto): AuthSession {
  return {
    userId: dto.userId,
    accessToken: dto.accessToken,
    accessTokenExpiresInSeconds: dto.accessTokenExpiresInSeconds,
    refreshToken: dto.refreshToken,
    refreshTokenExpiresInSeconds: dto.refreshTokenExpiresInSeconds,
    firstLogin: dto.firstLogin,
  };
}
