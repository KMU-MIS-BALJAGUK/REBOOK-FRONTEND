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

export type CommunityBookTopQuotesPeriod = 'ALL' | 'WEEK' | 'MONTH';
export type CommunityBookTopQuotesSort = 'SAVED_DESC';

export type CommunityBookTopQuotesQuery = {
  cursor?: string;
  size?: number;
  period?: CommunityBookTopQuotesPeriod;
  sort?: CommunityBookTopQuotesSort;
};

export type CommunityBookTopQuoteItem = {
  rank: number;
  quoteId: number;
  quoteText: string;
  savedCount: number;
};

export type CommunityBookTopQuotesResult = {
  bookId: number;
  period: CommunityBookTopQuotesPeriod;
  items: CommunityBookTopQuoteItem[];
  pageInfo: {
    nextCursor: string | null;
    hasNext: boolean;
    size: number;
  };
};

export type CommunityDiscussionCategory = 'QUESTION' | 'INTERPRETATION' | 'IMPRESSION';
export type CommunityDiscussionSort = 'LATEST' | 'HOT';

export type CommunityBookDiscussionsQuery = {
  category?: CommunityDiscussionCategory;
  sort?: CommunityDiscussionSort;
  cursor?: string;
  size?: number;
};

export type CommunityBookDiscussionItem = {
  discussionId: number;
  bookId: number;
  category: CommunityDiscussionCategory;
  categoryLabel: string;
  title: string;
  preview: string;
  likeCount: number;
  commentCount: number;
  myLike: boolean;
  createdAt: string;
};

export type CommunityBookDiscussionsResult = {
  bookId: number;
  selectedCategory: CommunityDiscussionCategory | null;
  sort: CommunityDiscussionSort;
  items: CommunityBookDiscussionItem[];
  pageInfo: {
    nextCursor: string | null;
    hasNext: boolean;
    size: number;
  };
};
