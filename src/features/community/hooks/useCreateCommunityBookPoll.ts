import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createCommunityBookPoll } from '../services/communityBookService';
import { CreateCommunityBookPollInput, CreateCommunityBookPollResult } from '../model/communityBook.types';

export function useCreateCommunityBookPoll(bookId: number | null) {
  const queryClient = useQueryClient();

  return useMutation<CreateCommunityBookPollResult, Error, CreateCommunityBookPollInput>({
    mutationFn: (input) => {
      if (bookId === null) {
        throw new Error('bookId is required');
      }
      return createCommunityBookPoll(bookId, input);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['community', 'books', 'polls', bookId] });
    },
  });
}
