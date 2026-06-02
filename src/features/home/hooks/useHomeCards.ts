import { useQuery } from '@tanstack/react-query';
import { getHomeCards } from '../services/homeService';
import { HomeCardsResult, HomeCardSort, HomeCardView } from '../model/home.types';

type UseHomeCardsParams = {
  view: HomeCardView;
  sort?: HomeCardSort;
  size?: number;
  cursor?: string;
  enabled?: boolean;
};

export function useHomeCards(params: UseHomeCardsParams) {
  const { enabled = true, ...queryParams } = params;

  return useQuery<HomeCardsResult, Error>({
    queryKey: ['home', 'cards', queryParams],
    queryFn: () => getHomeCards(queryParams),
    enabled,
  });
}
