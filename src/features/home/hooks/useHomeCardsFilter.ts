import { useQuery } from '@tanstack/react-query';
import { getHomeCardsByFilter } from '../services/homeService';
import {
  HomeCardCategory,
  HomeCardEmojiType,
  HomeCardsFilterQuery,
  HomeCardsResult,
} from '../model/home.types';

type UseHomeCardsFilterParams = {
  view: 'list' | 'grid';
  category?: HomeCardCategory;
  emojiType?: HomeCardEmojiType;
  folderId?: number;
  sort?: 'LATEST' | 'MOST_REACTED';
  size?: number;
  cursor?: string;
};

export function useHomeCardsFilter(params: UseHomeCardsFilterParams, enabled: boolean) {
  return useQuery<HomeCardsResult, Error>({
    queryKey: ['home', 'cards', 'filter', params],
    queryFn: () => getHomeCardsByFilter(params as HomeCardsFilterQuery),
    enabled,
  });
}
