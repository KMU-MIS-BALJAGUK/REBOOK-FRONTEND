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

export type CommunityDiscussionCategoryDto = 'QUESTION' | 'INTERPRETATION' | 'IMPRESSION';
export type CommunityDiscussionSortDto = 'LATEST' | 'HOT';

export type CommunityBookDiscussionItemDto = {
  discussionId: number;
  bookId: number;
  category: CommunityDiscussionCategoryDto;
  categoryLabel: string;
  title: string;
  preview: string;
  likeCount: number;
  commentCount: number;
  myLike: boolean;
  createdAt: string;
};

export type CommunityBookDiscussionsResponseDto = {
  bookId: number;
  selectedCategory: CommunityDiscussionCategoryDto | null;
  sort: CommunityDiscussionSortDto;
  items: CommunityBookDiscussionItemDto[];
  pageInfo: {
    nextCursor: string | null;
    hasNext: boolean;
    size: number;
  };
};

export type CreateCommunityDiscussionRequestDto = {
  category: CommunityDiscussionCategoryDto;
  title: string;
  content: string;
};

export type CreateCommunityDiscussionResponseDto = CommunityBookDiscussionItemDto;

export type CommunityDiscussionDetailResponseDto = {
  discussionId: number;
  bookId: number;
  bookTitle: string;
  bookAuthor: string;
  bookCoverImageUrl: string;
  category: CommunityDiscussionCategoryDto;
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

export type ToggleDiscussionLikeResponseDto = {
  discussionId: number;
  myLike: boolean;
  likeCount: number;
};
