import { useQuery } from '@tanstack/react-query';
import { CommunityBookPollsQuery, CommunityBookPollsResult } from '../model/communityBook.types';
import { getCommunityBookPolls } from '../services/communityBookService';

export function useCommunityBookPolls(bookId: number | null, params: CommunityBookPollsQuery) {
  return useQuery<CommunityBookPollsResult, Error>({
    queryKey: ['community', 'books', 'polls', bookId, params],
    queryFn: () => {
      if (bookId === null) {
        throw new Error('bookId is required');
      }
      return getCommunityBookPolls(bookId, params);
    },
    enabled: typeof bookId === 'number',
  });
}
