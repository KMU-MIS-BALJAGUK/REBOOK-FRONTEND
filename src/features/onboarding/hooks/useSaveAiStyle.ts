import { useMutation } from '@tanstack/react-query';
import { saveAiStyle } from '../services/onboardingService';
import { SaveAiStyleInput, SaveAiStyleResult } from '../model/onboarding.types';

export function useSaveAiStyle() {
  return useMutation<SaveAiStyleResult, Error, SaveAiStyleInput>({
    mutationFn: (input) => saveAiStyle(input),
  });
}
