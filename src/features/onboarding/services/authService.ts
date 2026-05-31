import { postJson } from '../../../shared/api/httpClient';
import { toAppleLoginRequestDto, toAuthSession } from '../model/auth.mapper';
import { AppleLoginResponseDto } from '../model/auth.dto';
import { AppleLoginInput, AuthSession } from '../model/auth.types';

export async function appleLogin(input: AppleLoginInput): Promise<AuthSession> {
  const dto = toAppleLoginRequestDto(input);
  const response = await postJson<AppleLoginResponseDto>('/api/v1/auth/apple/login', {
    body: dto,
  });

  return toAuthSession(response);
}
