import { useQuery } from '@tanstack/react-query';
import { searchQuoteBooks } from '../services/quoteBookSearchService';
import { QuoteBookSearchResult } from '../model/quoteBookSearch.types';

export function useQuoteBookSearch(query: string, enabled: boolean) {
  return useQuery<QuoteBookSearchResult, Error>({
    queryKey: ['quote', 'books', 'search', query],
    queryFn: () => searchQuoteBooks(query),
    enabled,
  });
}
