import { useQuery } from '@tanstack/react-query';
import { CommunityDiscussionDetailResult } from '../model/communityBook.types';
import { getDiscussionDetail } from '../services/communityBookService';

export function useDiscussionDetail(discussionId: number | null) {
  return useQuery<CommunityDiscussionDetailResult, Error>({
    queryKey: ['community', 'discussions', 'detail', discussionId],
    queryFn: () => {
      if (discussionId === null) {
        throw new Error('discussionId is required');
      }
      return getDiscussionDetail(discussionId);
    },
    enabled: typeof discussionId === 'number',
  });
}
