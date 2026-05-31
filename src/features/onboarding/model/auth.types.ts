export type AppleLoginInput = {
  identityToken: string;
  authorizationCode: string;
  email?: string;
  name?: string;
  deviceId?: string;
};

export type AuthSession = {
  userId: number;
  accessToken: string;
  accessTokenExpiresInSeconds: number;
  refreshToken: string;
  refreshTokenExpiresInSeconds: number;
  firstLogin: boolean;
};
