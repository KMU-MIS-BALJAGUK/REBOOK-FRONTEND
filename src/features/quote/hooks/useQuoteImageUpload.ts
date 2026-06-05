import { useMutation } from '@tanstack/react-query';
import { uploadQuoteImage } from '../services/quoteImageUploadService';
import { QuoteImageUploadInput } from '../model/quoteImageUpload.types';

export function useQuoteImageUpload() {
  return useMutation<void, Error, QuoteImageUploadInput>({
    mutationFn: (input) => uploadQuoteImage(input),
  });
}
