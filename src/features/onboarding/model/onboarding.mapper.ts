import {
  CompleteOnboardingRequestDto,
  OnboardingBookSearchResponseDto,
  CompleteOnboardingResponseDto,
  GetAiStylesResponseDto,
  SaveAiStyleRequestDto,
  SaveAiStyleResponseDto,
  SaveFirstBookRequestDto,
  SaveFirstBookResponseDto,
  SaveNicknameRequestDto,
  SaveNicknameResponseDto,
} from './onboarding.dto';
import {
  AiStyle,
  CompleteOnboardingInput,
  CompleteOnboardingResult,
  OnboardingBookSearchResult,
  FirstBookSaveResult,
  SaveAiStyleInput,
  SaveAiStyleResult,
  SaveFirstBookInput,
  NicknameSaveResult,
  SaveNicknameInput,
} from './onboarding.types';

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

export function toAiStyles(dto: GetAiStylesResponseDto): AiStyle[] {
  return dto.styles.map((style) => ({
    styleCode: style.styleCode,
    styleName: style.styleName,
  }));
}

export function toSaveAiStyleRequestDto(input: SaveAiStyleInput): SaveAiStyleRequestDto {
  return {
    styleCode: input.styleCode,
  };
}

export function toSaveAiStyleResult(dto: SaveAiStyleResponseDto): SaveAiStyleResult {
  return {
    styleCode: dto.styleCode,
    styleName: dto.styleName,
    onboardingStatus: {
      completed: dto.onboardingStatus.completed,
      nextStep: dto.onboardingStatus.nextStep,
      completedSteps: dto.onboardingStatus.completedSteps,
    },
  };
}

export function toCompleteOnboardingRequestDto(input: CompleteOnboardingInput): CompleteOnboardingRequestDto {
  return {
    completed: input.completed,
  };
}

export function toCompleteOnboardingResult(dto: CompleteOnboardingResponseDto): CompleteOnboardingResult {
  return {
    userId: dto.userId,
    onboardingCompleted: dto.onboardingCompleted,
    redirectTo: dto.redirectTo,
    profile: {
      nickname: dto.profile.nickname,
      aiStyle: dto.profile.aiStyle,
      hasFirstBook: dto.profile.hasFirstBook,
    },
    onboardingStatus: {
      completed: dto.onboardingStatus.completed,
      nextStep: dto.onboardingStatus.nextStep,
      completedSteps: dto.onboardingStatus.completedSteps,
    },
  };
}

export function toOnboardingBookSearchResult(dto: OnboardingBookSearchResponseDto): OnboardingBookSearchResult {
  return {
    query: dto.query,
    books: dto.books.map((book) => ({
      bookId: book.bookId,
      title: book.title,
      author: book.author,
      coverImageUrl: book.coverImageUrl,
      publisher: book.publisher,
      publishedAt: book.publishedAt,
      sourceType: book.sourceType,
    })),
  };
}
