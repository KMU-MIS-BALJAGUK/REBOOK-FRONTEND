import { useQuery } from '@tanstack/react-query';
import { CommunitySearchBooksQuery, CommunitySearchBooksResult } from '../model/communityBook.types';
import { searchCommunityBooks } from '../services/communityBookService';

export function useSearchCommunityBooks(params: CommunitySearchBooksQuery, enabled: boolean) {
  return useQuery<CommunitySearchBooksResult, Error>({
    queryKey: ['community', 'books', 'search', params],
    queryFn: () => searchCommunityBooks(params),
    enabled,
  });
}
