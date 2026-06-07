import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateQuoteInput, CreateQuoteResult } from '../model/quoteCreate.types';
import { createQuote } from '../services/quoteCreateService';

export function useCreateQuote() {
  const queryClient = useQueryClient();

  return useMutation<CreateQuoteResult, Error, CreateQuoteInput>({
    mutationFn: (input) => createQuote(input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['home', 'cards'] }),
        queryClient.invalidateQueries({ queryKey: ['home', 'card-detail'] }),
        queryClient.invalidateQueries({ queryKey: ['home', 'folders'] }),
        queryClient.invalidateQueries({ queryKey: ['quote', 'folders'] }),
        queryClient.invalidateQueries({ queryKey: ['mypage', 'insights'] }),
      ]);
    },
  });
}
