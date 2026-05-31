import { postJson } from '../../../shared/api/httpClient';
import { CreateQuoteResponseDto } from '../model/quoteCreate.dto';
import { toCreateQuoteRequestDto, toCreateQuoteResult } from '../model/quoteCreate.mapper';
import { CreateQuoteInput, CreateQuoteResult } from '../model/quoteCreate.types';

export async function createQuote(input: CreateQuoteInput): Promise<CreateQuoteResult> {
  const dto = toCreateQuoteRequestDto(input);
  const response = await postJson<CreateQuoteResponseDto>('/api/v1/quotes', {
    auth: true,
    body: dto,
  });

  return toCreateQuoteResult(response);
}
