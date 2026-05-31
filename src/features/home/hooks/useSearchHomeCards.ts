import { useQuery } from '@tanstack/react-query';
import { searchHomeCards } from '../services/homeService';
import { HomeCardsResult, HomeCardSort, HomeCardView } from '../model/home.types';

type UseSearchHomeCardsParams = {
  q: string;
  view: HomeCardView;
  sort?: HomeCardSort;
  size?: number;
  cursor?: string;
};

export function useSearchHomeCards(params: UseSearchHomeCardsParams, enabled: boolean) {
  return useQuery<HomeCardsResult, Error>({
    queryKey: ['home', 'cards', 'search', params],
    queryFn: () => searchHomeCards(params),
    enabled,
  });
}
