import { getJson } from '../../../shared/api/httpClient';
import { toQuoteBookSearchResult } from '../model/quoteBookSearch.mapper';
import { QuoteBookSearchResponseDto } from '../model/quoteBookSearch.dto';
import { QuoteBookSearchResult } from '../model/quoteBookSearch.types';

export async function searchQuoteBooks(query: string): Promise<QuoteBookSearchResult> {
  const response = await getJson<QuoteBookSearchResponseDto>(
    `/api/v1/onboarding/books/search?query=${encodeURIComponent(query)}`,
    { auth: true },
  );

  return toQuoteBookSearchResult(response);
}
