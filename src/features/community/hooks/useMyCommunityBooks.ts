import { useQuery } from '@tanstack/react-query';
import { CommunityMyBooksQuery, CommunityMyBooksResult } from '../model/communityBook.types';
import { getMyCommunityBooks } from '../services/communityBookService';

export function useMyCommunityBooks(params: CommunityMyBooksQuery) {
  return useQuery<CommunityMyBooksResult, Error>({
    queryKey: ['community', 'books', 'my', params],
    queryFn: () => getMyCommunityBooks(params),
  });
}
