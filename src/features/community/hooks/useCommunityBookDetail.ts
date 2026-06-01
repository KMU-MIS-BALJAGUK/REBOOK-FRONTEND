import { useQuery } from '@tanstack/react-query';
import { CommunityBookDetailResult } from '../model/communityBook.types';
import { getCommunityBookDetail } from '../services/communityBookService';

export function useCommunityBookDetail(bookId: number | null) {
  return useQuery<CommunityBookDetailResult, Error>({
    queryKey: ['community', 'books', 'detail', bookId],
    queryFn: () => {
      if (bookId === null) {
        throw new Error('bookId is required');
      }
      return getCommunityBookDetail(bookId);
    },
    enabled: typeof bookId === 'number',
  });
}
