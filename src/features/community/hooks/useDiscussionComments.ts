import { useQuery } from '@tanstack/react-query';
import { CommunityDiscussionCommentsQuery, CommunityDiscussionCommentsResult } from '../model/communityBook.types';
import { getDiscussionComments } from '../services/communityBookService';

export function useDiscussionComments(discussionId: number | null, params: CommunityDiscussionCommentsQuery) {
  return useQuery<CommunityDiscussionCommentsResult, Error>({
    queryKey: ['community', 'discussions', 'comments', discussionId, params],
    queryFn: () => {
      if (discussionId === null) {
        throw new Error('discussionId is required');
      }
      return getDiscussionComments(discussionId, params);
    },
    enabled: typeof discussionId === 'number',
  });
}
