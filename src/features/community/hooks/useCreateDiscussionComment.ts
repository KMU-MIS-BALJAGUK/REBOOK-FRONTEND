import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createDiscussionComment } from '../services/communityBookService';
import { CreateDiscussionCommentInput, CreateDiscussionCommentResult } from '../model/communityBook.types';

export function useCreateDiscussionComment(discussionId: number | null) {
  const queryClient = useQueryClient();

  return useMutation<CreateDiscussionCommentResult, Error, CreateDiscussionCommentInput>({
    mutationFn: (input) => {
      if (discussionId === null) {
        throw new Error('discussionId is required');
      }
      return createDiscussionComment(discussionId, input);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['community', 'discussions', 'comments', discussionId] });
      await queryClient.invalidateQueries({ queryKey: ['community', 'discussions', 'detail', discussionId] });
      await queryClient.invalidateQueries({ queryKey: ['community', 'books', 'discussions'] });
    },
  });
}
