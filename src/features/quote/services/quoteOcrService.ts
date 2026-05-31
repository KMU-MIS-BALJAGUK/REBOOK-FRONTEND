import { postJson } from '../../../shared/api/httpClient';
import { toCreateQuoteOcrRequestDto, toQuoteOcrResult } from '../model/quoteOcr.mapper';
import { CreateQuoteOcrResponseDto } from '../model/quoteOcr.dto';
import { QuoteOcrInput, QuoteOcrResult } from '../model/quoteOcr.types';

export async function createQuoteImageOcr(input: QuoteOcrInput): Promise<QuoteOcrResult> {
  const dto = toCreateQuoteOcrRequestDto(input);
  const response = await postJson<CreateQuoteOcrResponseDto>('/api/v1/quotes/images/ocr', {
    auth: true,
    body: dto,
  });

  return toQuoteOcrResult(response);
}
