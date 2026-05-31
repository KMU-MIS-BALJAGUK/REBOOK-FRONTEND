import { useQuery } from '@tanstack/react-query';
import { getHomeCardsByFilter } from '../services/homeService';
import { HomeCardsFilterQuery, HomeCardsResult } from '../model/home.types';

export function useHomeCardsFilter(params: HomeCardsFilterQuery, enabled: boolean) {
  return useQuery<HomeCardsResult, Error>({
    queryKey: ['home', 'cards', 'filter', params],
    queryFn: () => getHomeCardsByFilter(params),
    enabled,
  });
}
