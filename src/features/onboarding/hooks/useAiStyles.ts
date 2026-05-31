import { useQuery } from '@tanstack/react-query';
import { getAiStyles } from '../services/onboardingService';
import { AiStyle } from '../model/onboarding.types';

export function useAiStyles(enabled: boolean) {
  return useQuery<AiStyle[], Error>({
    queryKey: ['onboarding', 'ai-styles'],
    queryFn: getAiStyles,
    enabled,
  });
}
