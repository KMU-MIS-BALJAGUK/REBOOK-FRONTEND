import { useQuery } from '@tanstack/react-query';
import { searchOnboardingBooks } from '../services/onboardingService';
import { OnboardingBookSearchResult } from '../model/onboarding.types';

export function useSearchOnboardingBooks(query: string, enabled: boolean) {
  return useQuery<OnboardingBookSearchResult, Error>({
    queryKey: ['onboarding', 'books', 'search', query],
    queryFn: () => searchOnboardingBooks(query),
    enabled,
  });
}
