import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateCommunityDiscussionInput, CreateCommunityDiscussionResult } from '../model/communityBook.types';
import { createBookDiscussion } from '../services/communityBookService';

export function useCreateBookDiscussion(bookId: number | null) {
  const queryClient = useQueryClient();

  return useMutation<CreateCommunityDiscussionResult, Error, CreateCommunityDiscussionInput>({
    mutationFn: (input) => {
      if (bookId === null) {
        throw new Error('bookId is required');
      }
      return createBookDiscussion(bookId, input);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['community', 'books', 'discussions', bookId] }),
        queryClient.invalidateQueries({ queryKey: ['mypage', 'insights'] }),
      ]);
    },
  });
}
