import { File, UploadType } from 'expo-file-system';
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
  const file = new File(input.fileUri);
  const response = await file.upload(input.uploadUrl, {
    httpMethod: (input.method || 'PUT') as 'POST' | 'PUT' | 'PATCH',
    uploadType: UploadType.BINARY_CONTENT,
    headers: {
      ...input.headers,
      'Content-Type': input.mimeType,
    },
    mimeType: input.mimeType,
  });

  if (response.status < 200 || response.status >= 300) {
    throw new QuoteImageUploadError(`이미지 업로드에 실패했어요. (${response.status})`);
  }
}
