export type QuoteBookSearchItemDto = {
  bookId: number;
  title: string;
  author: string;
  coverImageUrl: string;
  publisher: string;
  publishedAt: string;
  sourceType: string;
};

export type QuoteBookSearchResponseDto = {
  query: string;
  books: QuoteBookSearchItemDto[];
};
