import { postJson } from '../../../shared/api/httpClient';
import { toNicknameSaveResult, toSaveNicknameRequestDto } from '../model/onboarding.mapper';
import { SaveNicknameResponseDto } from '../model/onboarding.dto';
import { NicknameSaveResult, SaveNicknameInput } from '../model/onboarding.types';

export async function saveNickname(input: SaveNicknameInput): Promise<NicknameSaveResult> {
  const dto = toSaveNicknameRequestDto(input);
  const response = await postJson<SaveNicknameResponseDto>('/api/v1/onboarding/nickname', {
    body: dto,
    auth: true,
  });

  return toNicknameSaveResult(response);
}
