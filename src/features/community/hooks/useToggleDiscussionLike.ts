import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toggleDiscussionLike } from '../services/communityBookService';
import { ToggleDiscussionLikeResult } from '../model/communityBook.types';

export function useToggleDiscussionLike() {
  const queryClient = useQueryClient();

  return useMutation<ToggleDiscussionLikeResult, Error, number>({
    mutationFn: (discussionId) => toggleDiscussionLike(discussionId),
    onSuccess: async (_, discussionId) => {
      await queryClient.invalidateQueries({ queryKey: ['community', 'discussions', 'detail', discussionId] });
      await queryClient.invalidateQueries({ queryKey: ['community', 'books', 'discussions'] });
    },
  });
}
