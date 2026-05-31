import {
  SaveFirstBookRequestDto,
  SaveFirstBookResponseDto,
  SaveNicknameRequestDto,
  SaveNicknameResponseDto,
} from './onboarding.dto';
import { FirstBookSaveResult, SaveFirstBookInput, NicknameSaveResult, SaveNicknameInput } from './onboarding.types';

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

export function toSaveFirstBookRequestDto(input: SaveFirstBookInput): SaveFirstBookRequestDto {
  if (input.selectionType === 'SKIP') {
    return {
      selectionType: 'SKIP',
    };
  }

  return {
    selectionType: input.selectionType,
    book: input.book,
  };
}

export function toFirstBookSaveResult(dto: SaveFirstBookResponseDto): FirstBookSaveResult {
  return {
    bookId: dto.bookId,
    selectionType: dto.selectionType,
    book: dto.book,
    readingStatus: dto.readingStatus,
    onboardingStatus: {
      completed: dto.onboardingStatus.completed,
      nextStep: dto.onboardingStatus.nextStep,
      completedSteps: dto.onboardingStatus.completedSteps,
    },
  };
}
