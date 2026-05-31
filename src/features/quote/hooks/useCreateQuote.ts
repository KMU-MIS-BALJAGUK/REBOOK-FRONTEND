import { useMutation } from '@tanstack/react-query';
import { CreateQuoteInput, CreateQuoteResult } from '../model/quoteCreate.types';
import { createQuote } from '../services/quoteCreateService';

export function useCreateQuote() {
  return useMutation<CreateQuoteResult, Error, CreateQuoteInput>({
    mutationFn: (input) => createQuote(input),
  });
}
