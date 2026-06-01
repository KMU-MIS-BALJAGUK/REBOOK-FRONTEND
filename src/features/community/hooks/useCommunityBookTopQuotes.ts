import { useQuery } from '@tanstack/react-query';
import { CommunityBookTopQuotesQuery, CommunityBookTopQuotesResult } from '../model/communityBook.types';
import { getCommunityBookTopQuotes } from '../services/communityBookService';

export function useCommunityBookTopQuotes(bookId: number | null, params: CommunityBookTopQuotesQuery) {
  return useQuery<CommunityBookTopQuotesResult, Error>({
    queryKey: ['community', 'books', 'top-quotes', bookId, params],
    queryFn: () => {
      if (bookId === null) {
        throw new Error('bookId is required');
      }
      return getCommunityBookTopQuotes(bookId, params);
    },
    enabled: typeof bookId === 'number',
  });
}
