export type AuthSession = {
  userId: number;
  accessToken: string;
  accessTokenExpiresInSeconds: number;
  refreshToken: string;
  refreshTokenExpiresInSeconds: number;
  firstLogin: boolean;
};
