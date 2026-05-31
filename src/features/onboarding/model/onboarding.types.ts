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
