import {
  CommunityBookDiscussionsResponseDto,
  CommunityDiscussionDetailResponseDto,
  CommunityDiscussionCommentsResponseDto,
  CommunityBookPollsResponseDto,
  CreateCommunityBookPollRequestDto,
  CreateCommunityBookPollResponseDto,
  CreateDiscussionCommentRequestDto,
  CreateDiscussionCommentResponseDto,
  ToggleDiscussionLikeResponseDto,
  CreateCommunityDiscussionRequestDto,
  CreateCommunityDiscussionResponseDto,
  CommunityBookTopQuotesResponseDto,
  CommunityBookDetailResponseDto,
  CommunityMyBooksResponseDto,
  CommunityPopularBooksResponseDto,
  CommunitySearchBooksResponseDto,
} from './communityBook.dto';
import {
  CommunityBookDiscussionsQuery,
  CommunityBookDiscussionsResult,
  CreateCommunityDiscussionInput,
  CreateCommunityDiscussionResult,
  CommunityDiscussionDetailResult,
  CommunityDiscussionCommentsQuery,
  CommunityDiscussionCommentsResult,
  CommunityBookPollsQuery,
  CommunityBookPollsResult,
  CreateCommunityBookPollInput,
  CreateCommunityBookPollResult,
  CreateDiscussionCommentInput,
  CreateDiscussionCommentResult,
  ToggleDiscussionLikeResult,
  CommunityBookTopQuotesQuery,
  CommunityBookTopQuotesResult,
  CommunityBookDetailResult,
  CommunityMyBooksQuery,
  CommunityMyBooksResult,
  CommunityPopularBooksQuery,
  CommunityPopularBooksResult,
  CommunitySearchBooksQuery,
  CommunitySearchBooksResult,
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

export function toCommunityDiscussionDetailResult(
  dto: CommunityDiscussionDetailResponseDto,
): CommunityDiscussionDetailResult {
  return {
    discussionId: dto.discussionId,
    bookId: dto.bookId,
    bookTitle: dto.bookTitle,
    bookAuthor: dto.bookAuthor,
    bookCoverImageUrl: dto.bookCoverImageUrl,
    category: dto.category,
    categoryLabel: dto.categoryLabel,
    title: dto.title,
    content: dto.content,
    likeCount: dto.likeCount,
    commentCount: dto.commentCount,
    myLike: dto.myLike,
    writer: {
      userId: dto.writer.userId,
      nickname: dto.writer.nickname,
    },
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

export function toToggleDiscussionLikeResult(dto: ToggleDiscussionLikeResponseDto): ToggleDiscussionLikeResult {
  return {
    discussionId: dto.discussionId,
    myLike: dto.myLike,
    likeCount: dto.likeCount,
  };
}

export function buildCommunityDiscussionCommentsQueryString(params: CommunityDiscussionCommentsQuery): string {
  const query = new URLSearchParams();
  if (params.cursor) query.set('cursor', params.cursor);
  if (typeof params.size === 'number') query.set('size', String(params.size));
  if (params.sort) query.set('sort', params.sort);
  return query.toString();
}

export function toCommunityDiscussionCommentsResult(
  dto: CommunityDiscussionCommentsResponseDto,
): CommunityDiscussionCommentsResult {
  return {
    discussionId: dto.discussionId,
    items: dto.items.map((item) => ({
      commentId: item.commentId,
      discussionId: item.discussionId,
      content: item.content,
      writer: {
        userId: item.writer.userId,
        nickname: item.writer.nickname,
      },
      likeCount: item.likeCount,
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

export function toCreateDiscussionCommentRequestDto(
  input: CreateDiscussionCommentInput,
): CreateDiscussionCommentRequestDto {
  return {
    content: input.content.trim(),
  };
}

export function toCreateDiscussionCommentResult(
  dto: CreateDiscussionCommentResponseDto,
): CreateDiscussionCommentResult {
  return {
    commentId: dto.commentId,
    discussionId: dto.discussionId,
    content: dto.content,
    writer: {
      userId: dto.writer.userId,
      nickname: dto.writer.nickname,
    },
    likeCount: dto.likeCount,
    myLike: dto.myLike,
    createdAt: dto.createdAt,
  };
}

export function buildCommunityBookPollsQueryString(params: CommunityBookPollsQuery): string {
  const query = new URLSearchParams();
  if (params.cursor) query.set('cursor', params.cursor);
  if (typeof params.size === 'number') query.set('size', String(params.size));
  if (params.sort) query.set('sort', params.sort);
  if (typeof params.onlyActive === 'boolean') query.set('onlyActive', String(params.onlyActive));
  return query.toString();
}

export function toCommunityBookPollsResult(dto: CommunityBookPollsResponseDto): CommunityBookPollsResult {
  return {
    bookId: dto.bookId,
    items: dto.items.map((item) => ({
      pollId: item.pollId,
      bookId: item.bookId,
      question: item.question,
      optionA: {
        optionId: item.optionA.optionId,
        label: item.optionA.label,
        voteCount: item.optionA.voteCount,
        percentage: item.optionA.percentage,
      },
      optionB: {
        optionId: item.optionB.optionId,
        label: item.optionB.label,
        voteCount: item.optionB.voteCount,
        percentage: item.optionB.percentage,
      },
      totalVoteCount: item.totalVoteCount,
      myVoteOptionId: item.myVoteOptionId,
      isVoted: item.isVoted,
      createdAt: item.createdAt,
    })),
    pageInfo: {
      nextCursor: dto.pageInfo.nextCursor,
      hasNext: dto.pageInfo.hasNext,
      size: dto.pageInfo.size,
    },
  };
}

export function toCreateCommunityBookPollRequestDto(
  input: CreateCommunityBookPollInput,
): CreateCommunityBookPollRequestDto {
  return {
    question: input.question.trim(),
    optionA: input.optionA.trim(),
    optionB: input.optionB.trim(),
  };
}

export function toCreateCommunityBookPollResult(dto: CreateCommunityBookPollResponseDto): CreateCommunityBookPollResult {
  return {
    pollId: dto.pollId,
    bookId: dto.bookId,
    question: dto.question,
    optionA: {
      optionId: dto.optionA.optionId,
      label: dto.optionA.label,
      voteCount: dto.optionA.voteCount,
      percentage: dto.optionA.percentage,
    },
    optionB: {
      optionId: dto.optionB.optionId,
      label: dto.optionB.label,
      voteCount: dto.optionB.voteCount,
      percentage: dto.optionB.percentage,
    },
    totalVoteCount: dto.totalVoteCount,
    myVoteOptionId: dto.myVoteOptionId,
    isVoted: dto.isVoted,
    createdAt: dto.createdAt,
  };
}

export function buildCommunitySearchBooksQueryString(params: CommunitySearchBooksQuery): string {
  const query = new URLSearchParams();
  query.set('q', params.q);
  if (params.cursor) query.set('cursor', params.cursor);
  if (typeof params.size === 'number') query.set('size', String(params.size));
  if (params.sort) query.set('sort', params.sort);
  return query.toString();
}

export function toCommunitySearchBooksResult(dto: CommunitySearchBooksResponseDto): CommunitySearchBooksResult {
  return {
    keyword: dto.keyword,
    items: dto.items.map((item) => ({
      bookId: item.bookId,
      title: item.title,
      author: item.author,
      coverImageUrl: item.coverImageUrl,
      readerCount: item.readerCount,
      quoteCount: item.quoteCount,
    })),
    pageInfo: {
      nextCursor: dto.pageInfo.nextCursor,
      hasNext: dto.pageInfo.hasNext,
      size: dto.pageInfo.size,
    },
  };
}
