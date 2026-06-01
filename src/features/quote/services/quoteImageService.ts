import { postJson } from '../../../shared/api/httpClient';
import { toCreatePresignedUrlRequestDto, toPresignedUrlResult } from '../model/quoteImage.mapper';
import { CreatePresignedUrlResponseDto } from '../model/quoteImage.dto';
import { PresignedUrlInput, PresignedUrlResult } from '../model/quoteImage.types';

export async function createQuoteImagePresignedUrl(input: PresignedUrlInput): Promise<PresignedUrlResult> {
  const dto = toCreatePresignedUrlRequestDto(input);
  const response = await postJson<CreatePresignedUrlResponseDto>('/api/v1/quotes/images/presigned-url', {
    auth: true,
    body: dto,
  });

  return toPresignedUrlResult(response);
}
