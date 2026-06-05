import { QuoteImageUploadInput } from '../model/quoteImageUpload.types';

class QuoteImageUploadError extends Error {
  userMessage: string;

  constructor(message: string) {
    super(message);
    this.name = 'QuoteImageUploadError';
    this.userMessage = message;
  }
}

export async function uploadQuoteImage(input: QuoteImageUploadInput): Promise<void> {
  const response = await fetch(input.uploadUrl, {
    method: input.method || 'PUT',
    headers: input.headers,
    body: input.blob,
  });

  if (!response.ok) {
    throw new QuoteImageUploadError(`이미지 업로드에 실패했어요. (${response.status})`);
  }
}
