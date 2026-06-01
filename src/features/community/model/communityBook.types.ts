export type CommunityMyBooksQuery = {
  cursor?: string;
  size?: number;
  q?: string;
};

export type CommunityMyBookItem = {
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

export type CommunityMyBooksResult = {
  totalCount: number;
  items: CommunityMyBookItem[];
  pageInfo: {
    nextCursor: string | null;
    hasNext: boolean;
    size: number;
  };
};

export type CommunityPopularPeriod = 'WEEK' | 'MONTH' | 'ALL';
export type CommunityPopularSort = 'HOT' | 'READER_COUNT' | 'POST_COUNT';

export type CommunityPopularBooksQuery = {
  cursor?: string;
  size?: number;
  period?: CommunityPopularPeriod;
  sort?: CommunityPopularSort;
};

export type CommunityPopularBookItem = {
  bookId: number;
  title: string;
  author: string;
  coverImageUrl: string;
  readerCount: number;
  recentPostCount: number;
  recentPostPeriodDays: number;
};

export type CommunityPopularBooksResult = {
  items: CommunityPopularBookItem[];
  pageInfo: {
    nextCursor: string | null;
    hasNext: boolean;
    size: number;
  };
};

export type CommunityBookDetailResult = {
  bookId: number;
  title: string;
  author: string;
  coverImageUrl: string;
  readerCount: number;
};
