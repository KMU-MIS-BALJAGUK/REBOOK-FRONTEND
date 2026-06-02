export type QuoteBookSearchItem = {
  bookId: number;
  title: string;
  author: string;
  coverImageUrl: string;
  publisher: string;
  publishedAt: string;
  sourceType: string;
};

export type QuoteBookSearchResult = {
  query: string;
  books: QuoteBookSearchItem[];
};
