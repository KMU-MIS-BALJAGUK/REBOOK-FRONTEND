export type CommunityMyBookItemDto = {
  bookId: number;
  title: string;
  author: string;
  coverImageUrl: string;
  readerCount: number;
  recentPostCount: number;
  recentPostPeriodDays: number;
  savedQuotePreview: string | null;
  savedQuoteCount: number;
};

export type CommunityMyBooksResponseDto = {
  totalCount: number;
  items: CommunityMyBookItemDto[];
  pageInfo: {
    nextCursor: string | null;
    hasNext: boolean;
    size: number;
  };
};

export type CommunityPopularBookItemDto = {
  bookId: number;
  title: string;
  author: string;
  coverImageUrl: string;
  readerCount: number;
  recentPostCount: number;
  recentPostPeriodDays: number;
};

export type CommunityPopularBooksResponseDto = {
  items: CommunityPopularBookItemDto[];
  pageInfo: {
    nextCursor: string | null;
    hasNext: boolean;
    size: number;
  };
};

export type CommunityBookDetailResponseDto = {
  bookId: number;
  title: string;
  author: string;
  coverImageUrl: string;
  readerCount: number;
};

export type CommunityBookTopQuoteItemDto = {
  rank: number;
  quoteId: number;
  quoteText: string;
  savedCount: number;
};

export type CommunityBookTopQuotesResponseDto = {
  bookId: number;
  period: 'ALL' | 'WEEK' | 'MONTH';
  items: CommunityBookTopQuoteItemDto[];
  pageInfo: {
    nextCursor: string | null;
    hasNext: boolean;
    size: number;
  };
};
