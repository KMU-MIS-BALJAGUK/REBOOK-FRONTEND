import { useMutation, useQueryClient } from '@tanstack/react-query';
import { voteCommunityBookPoll } from '../services/communityBookService';
import { VoteCommunityBookPollInput, VoteCommunityBookPollResult } from '../model/communityBook.types';

export function useVoteCommunityBookPoll(bookId: number | null) {
  const queryClient = useQueryClient();

  return useMutation<VoteCommunityBookPollResult, Error, VoteCommunityBookPollInput>({
    mutationFn: (input) => {
      if (bookId === null) {
        throw new Error('bookId is required');
      }
      return voteCommunityBookPoll(bookId, input);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['community', 'books', 'polls', bookId] });
    },
  });
}
