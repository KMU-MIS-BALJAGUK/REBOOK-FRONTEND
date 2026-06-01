import {
  CommunityBookDiscussionsResponseDto,
  CreateCommunityDiscussionRequestDto,
  CreateCommunityDiscussionResponseDto,
  CommunityBookTopQuotesResponseDto,
  CommunityBookDetailResponseDto,
  CommunityMyBooksResponseDto,
  CommunityPopularBooksResponseDto,
} from './communityBook.dto';
import {
  CommunityBookDiscussionsQuery,
  CommunityBookDiscussionsResult,
  CreateCommunityDiscussionInput,
  CreateCommunityDiscussionResult,
  CommunityBookTopQuotesQuery,
  CommunityBookTopQuotesResult,
  CommunityBookDetailResult,
  CommunityMyBooksQuery,
  CommunityMyBooksResult,
  CommunityPopularBooksQuery,
  CommunityPopularBooksResult,
} from './communityBook.types';

export function buildCommunityMyBooksQueryString(params: CommunityMyBooksQuery): string {
  const query = new URLSearchParams();
  if (params.cursor) query.set('cursor', params.cursor);
  if (typeof params.size === 'number') query.set('size', String(params.size));
  if (params.q) query.set('q', params.q);
  return query.toString();
}

export function toCommunityMyBooksResult(dto: CommunityMyBooksResponseDto): CommunityMyBooksResult {
  return {
    totalCount: dto.totalCount,
    items: dto.items.map((item) => ({
      bookId: item.bookId,
      title: item.title,
      author: item.author,
      coverImageUrl: item.coverImageUrl,
      readerCount: item.readerCount,
      recentPostCount: item.recentPostCount,
      recentPostPeriodDays: item.recentPostPeriodDays,
      savedQuotePreview: item.savedQuotePreview,
      savedQuoteCount: item.savedQuoteCount,
    })),
    pageInfo: {
      nextCursor: dto.pageInfo.nextCursor,
      hasNext: dto.pageInfo.hasNext,
      size: dto.pageInfo.size,
    },
  };
}

export function buildCommunityPopularBooksQueryString(params: CommunityPopularBooksQuery): string {
  const query = new URLSearchParams();
  if (params.cursor) query.set('cursor', params.cursor);
  if (typeof params.size === 'number') query.set('size', String(params.size));
  if (params.period) query.set('period', params.period);
  if (params.sort) query.set('sort', params.sort);
  return query.toString();
}

export function toCommunityPopularBooksResult(dto: CommunityPopularBooksResponseDto): CommunityPopularBooksResult {
  return {
    items: dto.items.map((item) => ({
      bookId: item.bookId,
      title: item.title,
      author: item.author,
      coverImageUrl: item.coverImageUrl,
      readerCount: item.readerCount,
      recentPostCount: item.recentPostCount,
      recentPostPeriodDays: item.recentPostPeriodDays,
    })),
    pageInfo: {
      nextCursor: dto.pageInfo.nextCursor,
      hasNext: dto.pageInfo.hasNext,
      size: dto.pageInfo.size,
    },
  };
}

export function toCommunityBookDetailResult(dto: CommunityBookDetailResponseDto): CommunityBookDetailResult {
  return {
    bookId: dto.bookId,
    title: dto.title,
    author: dto.author,
    coverImageUrl: dto.coverImageUrl,
    readerCount: dto.readerCount,
  };
}

export function buildCommunityBookTopQuotesQueryString(params: CommunityBookTopQuotesQuery): string {
  const query = new URLSearchParams();
  if (params.cursor) query.set('cursor', params.cursor);
  if (typeof params.size === 'number') query.set('size', String(params.size));
  if (params.period) query.set('period', params.period);
  if (params.sort) query.set('sort', params.sort);
  return query.toString();
}

export function toCommunityBookTopQuotesResult(dto: CommunityBookTopQuotesResponseDto): CommunityBookTopQuotesResult {
  return {
    bookId: dto.bookId,
    period: dto.period,
    items: dto.items.map((item) => ({
      rank: item.rank,
      quoteId: item.quoteId,
      quoteText: item.quoteText,
      savedCount: item.savedCount,
    })),
    pageInfo: {
      nextCursor: dto.pageInfo.nextCursor,
      hasNext: dto.pageInfo.hasNext,
      size: dto.pageInfo.size,
    },
  };
}

export function buildCommunityBookDiscussionsQueryString(params: CommunityBookDiscussionsQuery): string {
  const query = new URLSearchParams();
  if (params.category) query.set('category', params.category);
  if (params.sort) query.set('sort', params.sort);
  if (params.cursor) query.set('cursor', params.cursor);
  if (typeof params.size === 'number') query.set('size', String(params.size));
  return query.toString();
}

export function toCommunityBookDiscussionsResult(dto: CommunityBookDiscussionsResponseDto): CommunityBookDiscussionsResult {
  return {
    bookId: dto.bookId,
    selectedCategory: dto.selectedCategory,
    sort: dto.sort,
    items: dto.items.map((item) => ({
      discussionId: item.discussionId,
      bookId: item.bookId,
      category: item.category,
      categoryLabel: item.categoryLabel,
      title: item.title,
      preview: item.preview,
      likeCount: item.likeCount,
      commentCount: item.commentCount,
      myLike: item.myLike,
      createdAt: item.createdAt,
    })),
    pageInfo: {
      nextCursor: dto.pageInfo.nextCursor,
      hasNext: dto.pageInfo.hasNext,
      size: dto.pageInfo.size,
    },
  };
}

export function toCreateCommunityDiscussionRequestDto(
  input: CreateCommunityDiscussionInput,
): CreateCommunityDiscussionRequestDto {
  return {
    category: input.category,
    title: input.title.trim(),
    content: input.content.trim(),
  };
}

export function toCreateCommunityDiscussionResult(
  dto: CreateCommunityDiscussionResponseDto,
): CreateCommunityDiscussionResult {
  return {
    discussionId: dto.discussionId,
    bookId: dto.bookId,
    category: dto.category,
    categoryLabel: dto.categoryLabel,
    title: dto.title,
    preview: dto.preview,
    likeCount: dto.likeCount,
    commentCount: dto.commentCount,
    myLike: dto.myLike,
    createdAt: dto.createdAt,
  };
}
