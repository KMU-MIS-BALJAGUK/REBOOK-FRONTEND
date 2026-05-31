import { SaveNicknameRequestDto, SaveNicknameResponseDto } from './onboarding.dto';
import { NicknameSaveResult, SaveNicknameInput } from './onboarding.types';

export function toSaveNicknameRequestDto(input: SaveNicknameInput): SaveNicknameRequestDto {
  return {
    nickname: input.nickname,
  };
}

export function toNicknameSaveResult(dto: SaveNicknameResponseDto): NicknameSaveResult {
  return {
    nickname: dto.nickname,
    onboardingStatus: {
      completed: dto.onboardingStatus.completed,
      nextStep: dto.onboardingStatus.nextStep,
      completedSteps: dto.onboardingStatus.completedSteps,
    },
  };
}
