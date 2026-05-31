import { useMutation } from '@tanstack/react-query';
import { saveNickname } from '../services/onboardingService';
import { NicknameSaveResult } from '../model/onboarding.types';

export function useSaveNickname() {
  return useMutation<NicknameSaveResult, Error, { nickname: string }>({
    mutationFn: ({ nickname }) => saveNickname({ nickname }),
  });
}
