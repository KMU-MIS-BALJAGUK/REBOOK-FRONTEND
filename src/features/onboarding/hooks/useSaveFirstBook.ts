import { useMutation } from '@tanstack/react-query';
import { saveFirstBook } from '../services/onboardingService';
import { FirstBookSaveResult, SaveFirstBookInput } from '../model/onboarding.types';

export function useSaveFirstBook() {
  return useMutation<FirstBookSaveResult, Error, SaveFirstBookInput>({
    mutationFn: (input) => saveFirstBook(input),
  });
}
