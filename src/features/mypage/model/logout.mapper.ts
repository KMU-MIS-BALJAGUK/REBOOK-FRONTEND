import { LogoutRequestDto, LogoutResponseDto } from './logout.dto';
import { LogoutInput, LogoutResult } from './logout.types';

export function toLogoutRequestDto(input: LogoutInput): LogoutRequestDto {
  return {
    refreshToken: input.refreshToken,
  };
}

export function toLogoutResult(_dto: LogoutResponseDto): LogoutResult {
  return {
    success: true,
  };
}
