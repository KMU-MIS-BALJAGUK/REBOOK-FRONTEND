import { postJson } from '../../../shared/api/httpClient';
import { toLogoutRequestDto, toLogoutResult } from '../model/logout.mapper';
import { LogoutResponseDto } from '../model/logout.dto';
import { LogoutInput, LogoutResult } from '../model/logout.types';

export async function logout(input: LogoutInput): Promise<LogoutResult> {
  const dto = toLogoutRequestDto(input);
  const response = await postJson<LogoutResponseDto>('/api/v1/auth/logout', {
    auth: true,
    body: dto,
    allowEmptyData: true,
  });

  return toLogoutResult(response);
}
