import { postJson } from '../../../shared/api/httpClient';
import {
  toFirstBookSaveResult,
  toNicknameSaveResult,
  toSaveFirstBookRequestDto,
  toSaveNicknameRequestDto,
} from '../model/onboarding.mapper';
import { SaveFirstBookResponseDto, SaveNicknameResponseDto } from '../model/onboarding.dto';
import { FirstBookSaveResult, SaveFirstBookInput, NicknameSaveResult, SaveNicknameInput } from '../model/onboarding.types';

export async function saveNickname(input: SaveNicknameInput): Promise<NicknameSaveResult> {
  const dto = toSaveNicknameRequestDto(input);
  const response = await postJson<SaveNicknameResponseDto>('/api/v1/onboarding/nickname', {
    body: dto,
    auth: true,
  });

  return toNicknameSaveResult(response);
}

export async function saveFirstBook(input: SaveFirstBookInput): Promise<FirstBookSaveResult> {
  const dto = toSaveFirstBookRequestDto(input);
  const response = await postJson<SaveFirstBookResponseDto>('/api/v1/onboarding/first-book', {
    body: dto,
    auth: true,
  });

  return toFirstBookSaveResult(response);
}
