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
