import { useMutation } from '@tanstack/react-query';
import { completeOnboarding } from '../services/onboardingService';
import { CompleteOnboardingInput, CompleteOnboardingResult } from '../model/onboarding.types';

export function useCompleteOnboarding() {
  return useMutation<CompleteOnboardingResult, Error, CompleteOnboardingInput>({
    mutationFn: (input) => completeOnboarding(input),
  });
}
