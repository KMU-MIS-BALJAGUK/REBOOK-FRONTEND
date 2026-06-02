import { QuoteBookSearchResponseDto } from './quoteBookSearch.dto';
import { QuoteBookSearchResult } from './quoteBookSearch.types';

export function toQuoteBookSearchResult(dto: QuoteBookSearchResponseDto): QuoteBookSearchResult {
  return {
    query: dto.query,
    books: dto.books.map((book) => ({
      bookId: book.bookId,
      title: book.title,
      author: book.author,
      coverImageUrl: book.coverImageUrl,
      publisher: book.publisher,
      publishedAt: book.publishedAt,
      sourceType: book.sourceType,
    })),
  };
}
