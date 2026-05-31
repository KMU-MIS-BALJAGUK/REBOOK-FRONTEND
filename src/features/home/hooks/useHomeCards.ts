import { useQuery } from '@tanstack/react-query';
import { getHomeCards } from '../services/homeService';
import { HomeCardsResult, HomeCardSort, HomeCardView } from '../model/home.types';

type UseHomeCardsParams = {
  view: HomeCardView;
  sort?: HomeCardSort;
  size?: number;
  cursor?: string;
};

export function useHomeCards(params: UseHomeCardsParams) {
  return useQuery<HomeCardsResult, Error>({
    queryKey: ['home', 'cards', params],
    queryFn: () => getHomeCards(params),
  });
}
