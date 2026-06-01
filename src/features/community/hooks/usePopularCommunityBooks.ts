import { useQuery } from '@tanstack/react-query';
import { CommunityPopularBooksQuery, CommunityPopularBooksResult } from '../model/communityBook.types';
import { getPopularCommunityBooks } from '../services/communityBookService';

export function usePopularCommunityBooks(params: CommunityPopularBooksQuery) {
  return useQuery<CommunityPopularBooksResult, Error>({
    queryKey: ['community', 'books', 'popular', params],
    queryFn: () => getPopularCommunityBooks(params),
  });
}
