import { getJson, postJson } from '../../../shared/api/httpClient';
import {
  toCompleteOnboardingRequestDto,
  toCompleteOnboardingResult,
  toAiStyles,
  toSaveAiStyleRequestDto,
  toSaveAiStyleResult,
  toFirstBookSaveResult,
  toNicknameSaveResult,
  toSaveFirstBookRequestDto,
  toSaveNicknameRequestDto,
} from '../model/onboarding.mapper';
import {
  CompleteOnboardingResponseDto,
  GetAiStylesResponseDto,
  SaveAiStyleResponseDto,
  SaveFirstBookResponseDto,
  SaveNicknameResponseDto,
} from '../model/onboarding.dto';
import {
  AiStyle,
  CompleteOnboardingInput,
  CompleteOnboardingResult,
  FirstBookSaveResult,
  SaveAiStyleInput,
  SaveAiStyleResult,
  SaveFirstBookInput,
  NicknameSaveResult,
  SaveNicknameInput,
} from '../model/onboarding.types';

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

export async function getAiStyles(): Promise<AiStyle[]> {
  const response = await getJson<GetAiStylesResponseDto>('/api/v1/onboarding/ai-styles', {
    auth: true,
  });

  return toAiStyles(response);
}

export async function saveAiStyle(input: SaveAiStyleInput): Promise<SaveAiStyleResult> {
  const dto = toSaveAiStyleRequestDto(input);
  const response = await postJson<SaveAiStyleResponseDto>('/api/v1/onboarding/ai-style', {
    body: dto,
    auth: true,
  });

  return toSaveAiStyleResult(response);
}

export async function completeOnboarding(input: CompleteOnboardingInput): Promise<CompleteOnboardingResult> {
  const dto = toCompleteOnboardingRequestDto(input);
  const response = await postJson<CompleteOnboardingResponseDto>('/api/v1/onboarding/complete', {
    body: dto,
    auth: true,
  });

  return toCompleteOnboardingResult(response);
}
