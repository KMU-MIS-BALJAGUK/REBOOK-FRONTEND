import { useMutation } from '@tanstack/react-query';
import { createQuoteImageOcr } from '../services/quoteOcrService';
import { QuoteOcrInput, QuoteOcrResult } from '../model/quoteOcr.types';

export function useQuoteImageOcr() {
  return useMutation<QuoteOcrResult, Error, QuoteOcrInput>({
    mutationFn: (input) => createQuoteImageOcr(input),
  });
}
