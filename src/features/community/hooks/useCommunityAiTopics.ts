import { useQuery } from '@tanstack/react-query';
import { CommunityAiTopicSet } from '../model/communityAiTopic.types';
import { getCommunityAiTopics } from '../services/communityAiTopicService';

type Params = {
  bookId: number | null;
  enabled?: boolean;
};

export function useCommunityAiTopics({ bookId, enabled = true }: Params) {
  return useQuery<CommunityAiTopicSet, Error>({
    queryKey: ['community', 'books', 'ai-topics', bookId],
    queryFn: () => getCommunityAiTopics(bookId as number),
    enabled: enabled && bookId !== null,
    refetchInterval: (query) => (query.state.data?.fetchStatus === 'GENERATING' ? 2000 : false),
  });
}
