import { useQuery } from '@tanstack/react-query';
import { getHomeCardDetail } from '../services/homeService';
import { HomeCardDetailResult } from '../model/home.types';

export function useHomeCardDetail(cardId: number | null) {
  return useQuery<HomeCardDetailResult, Error>({
    queryKey: ['home', 'card-detail', cardId],
    queryFn: () => getHomeCardDetail(cardId as number),
    enabled: typeof cardId === 'number',
  });
}
