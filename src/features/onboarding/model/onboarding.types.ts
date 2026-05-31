export type SaveNicknameInput = {
  nickname: string;
};

export type OnboardingStatus = {
  completed: boolean;
  nextStep: string;
  completedSteps: string[];
};

export type NicknameSaveResult = {
  nickname: string;
  onboardingStatus: OnboardingStatus;
};

export type FirstBookSelectionType = 'CURRENT_BOOK' | 'FINISHED_BOOK' | 'SKIP';

export type SaveFirstBookInput = {
  selectionType: FirstBookSelectionType;
  book?: {
    title: string;
    author: string;
  };
};

export type FirstBookSaveResult = {
  bookId?: number;
  selectionType: FirstBookSelectionType;
  book: {
    title: string;
    author: string;
  } | null;
  readingStatus?: string;
  onboardingStatus: OnboardingStatus;
};
