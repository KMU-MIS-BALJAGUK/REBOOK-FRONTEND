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

export type CreateCommunityDiscussionInput = {
  category: CommunityDiscussionCategory;
  title: string;
  content: string;
};

export type CreateCommunityDiscussionResult = CommunityBookDiscussionItem;

export type CommunityDiscussionDetailResult = {
  discussionId: number;
  bookId: number;
  bookTitle: string;
  bookAuthor: string;
  bookCoverImageUrl: string;
  category: CommunityDiscussionCategory;
  categoryLabel: string;
  title: string;
  content: string;
  likeCount: number;
  commentCount: number;
  myLike: boolean;
  writer: {
    userId: number;
    nickname: string;
  };
  createdAt: string;
  updatedAt: string;
};

export type ToggleDiscussionLikeResult = {
  discussionId: number;
  myLike: boolean;
  likeCount: number;
};

export type CommunityDiscussionCommentsQuery = {
  cursor?: string;
  size?: number;
  sort?: 'LATEST';
};

export type CommunityDiscussionCommentItem = {
  commentId: number;
  discussionId: number;
  content: string;
  writer: {
    userId: number;
    nickname: string;
  };
  likeCount: number;
  myLike: boolean;
  createdAt: string;
};

export type CommunityDiscussionCommentsResult = {
  discussionId: number;
  items: CommunityDiscussionCommentItem[];
  pageInfo: {
    nextCursor: string | null;
    hasNext: boolean;
    size: number;
  };
};

export type CreateDiscussionCommentInput = {
  content: string;
};

export type CreateDiscussionCommentResult = CommunityDiscussionCommentItem;

export type CommunityBookPollsSort = 'LATEST';

export type CommunityBookPollsQuery = {
  cursor?: string;
  size?: number;
  sort?: CommunityBookPollsSort;
  onlyActive?: boolean;
};

export type CommunityBookPollOption = {
  optionId: number;
  label: string;
  voteCount: number;
  percentage: number;
};

export type CommunityBookPollItem = {
  pollId: number;
  bookId: number;
  question: string;
  optionA: CommunityBookPollOption;
  optionB: CommunityBookPollOption;
  totalVoteCount: number;
  myVoteOptionId: number | null;
  isVoted: boolean;
  createdAt: string;
};

export type CommunityBookPollsResult = {
  bookId: number;
  items: CommunityBookPollItem[];
  pageInfo: {
    nextCursor: string | null;
    hasNext: boolean;
    size: number;
  };
};

export type CreateCommunityBookPollInput = {
  question: string;
  optionA: string;
  optionB: string;
};

export type CreateCommunityBookPollResult = CommunityBookPollItem;

export type CommunityBookSearchSort = 'RELEVANCE';

export type CommunitySearchBooksQuery = {
  q: string;
  cursor?: string;
  size?: number;
  sort?: CommunityBookSearchSort;
};

export type CommunitySearchBookItem = {
  bookId: number;
  title: string;
  author: string;
  coverImageUrl: string;
  readerCount: number;
  quoteCount: number;
};

export type CommunitySearchBooksResult = {
  keyword: string;
  items: CommunitySearchBookItem[];
  pageInfo: {
    nextCursor: string | null;
    hasNext: boolean;
    size: number;
  };
};
