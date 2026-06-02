export type LogoutRequestDto = {
  refreshToken: string;
};

export type LogoutResponseDto = Record<string, never> | null | undefined;
