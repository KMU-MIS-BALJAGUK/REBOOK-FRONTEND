export type AppleLoginRequestDto = {
  identityToken: string;
  authorizationCode: string;
  email?: string;
  name?: string;
  deviceId?: string;
};

export type AppleLoginResponseDto = {
  userId: number;
  accessToken: string;
  accessTokenExpiresInSeconds: number;
  refreshToken: string;
  refreshTokenExpiresInSeconds: number;
  firstLogin: boolean;
};

export type RefreshTokenRequestDto = {
  refreshToken: string;
  deviceId?: string;
};

export type RefreshTokenResponseDto = {
  userId: number;
  accessToken: string;
  accessTokenExpiresInSeconds: number;
  refreshToken: string;
  refreshTokenExpiresInSeconds: number;
  firstLogin: boolean;
};
