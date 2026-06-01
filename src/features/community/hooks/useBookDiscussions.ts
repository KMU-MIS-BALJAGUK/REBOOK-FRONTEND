import { useQuery } from '@tanstack/react-query';
import { CommunityBookDiscussionsQuery, CommunityBookDiscussionsResult } from '../model/communityBook.types';
import { getBookDiscussions } from '../services/communityBookService';

export function useBookDiscussions(bookId: number | null, params: CommunityBookDiscussionsQuery) {
  return useQuery<CommunityBookDiscussionsResult, Error>({
    queryKey: ['community', 'books', 'discussions', bookId, params],
    queryFn: () => {
      if (bookId === null) {
        throw new Error('bookId is required');
      }
      return getBookDiscussions(bookId, params);
    },
    enabled: typeof bookId === 'number',
  });
}
