import { useMutation } from '@tanstack/react-query';
import { createQuoteImagePresignedUrl } from '../services/quoteImageService';
import { PresignedUrlInput, PresignedUrlResult } from '../model/quoteImage.types';

export function useQuoteImagePresignedUrl() {
  return useMutation<PresignedUrlResult, Error, PresignedUrlInput>({
    mutationFn: (input) => createQuoteImagePresignedUrl(input),
  });
}
