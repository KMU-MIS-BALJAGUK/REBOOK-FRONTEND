export type SaveNicknameRequestDto = {
  nickname: string;
};

export type OnboardingStatusDto = {
  completed: boolean;
  nextStep: string;
  completedSteps: string[];
};

export type SaveNicknameResponseDto = {
  nickname: string;
  onboardingStatus: OnboardingStatusDto;
};

export type FirstBookSelectionTypeDto = 'CURRENT_BOOK' | 'FINISHED_BOOK' | 'SKIP';

export type FirstBookDto = {
  title: string;
  author: string;
};

export type SaveFirstBookRequestDto = {
  selectionType: FirstBookSelectionTypeDto;
  book?: FirstBookDto;
};

export type SaveFirstBookResponseDto = {
  bookId?: number;
  selectionType: FirstBookSelectionTypeDto;
  book: FirstBookDto | null;
  readingStatus?: string;
  onboardingStatus: OnboardingStatusDto;
};

export type AiStyleItemDto = {
  styleCode: string;
  styleName: string;
};

export type GetAiStylesResponseDto = {
  styles: AiStyleItemDto[];
};
