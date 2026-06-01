import { getJson, postJson } from '../../../shared/api/httpClient';
import {
  CommunityBookDiscussionsResponseDto,
  CommunityDiscussionDetailResponseDto,
  CommunityDiscussionCommentsResponseDto,
  CreateDiscussionCommentResponseDto,
  CreateDiscussionCommentRequestDto,
  ToggleDiscussionLikeResponseDto,
  CommunityBookTopQuotesResponseDto,
  CommunityBookDetailResponseDto,
  CreateCommunityDiscussionResponseDto,
  CreateCommunityDiscussionRequestDto,
  CommunityMyBooksResponseDto,
  CommunityPopularBooksResponseDto,
  CommunityBookPollsResponseDto,
} from '../model/communityBook.dto';
import {
  buildCommunityBookDiscussionsQueryString,
  toCreateCommunityDiscussionRequestDto,
  toCreateCommunityDiscussionResult,
  toCommunityDiscussionDetailResult,
  buildCommunityDiscussionCommentsQueryString,
  toCommunityDiscussionCommentsResult,
  toCreateDiscussionCommentRequestDto,
  toCreateDiscussionCommentResult,
  toToggleDiscussionLikeResult,
  toCommunityBookDiscussionsResult,
  buildCommunityBookTopQuotesQueryString,
  toCommunityBookTopQuotesResult,
  buildCommunityMyBooksQueryString,
  buildCommunityPopularBooksQueryString,
  toCommunityBookDetailResult,
  toCommunityMyBooksResult,
  toCommunityPopularBooksResult,
  buildCommunityBookPollsQueryString,
  toCommunityBookPollsResult,
} from '../model/communityBook.mapper';
import {
  CommunityBookDiscussionsQuery,
  CommunityBookDiscussionsResult,
  CreateCommunityDiscussionInput,
  CreateCommunityDiscussionResult,
  CommunityDiscussionDetailResult,
  CommunityDiscussionCommentsQuery,
  CommunityDiscussionCommentsResult,
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
  CommunityBookPollsQuery,
  CommunityBookPollsResult,
} from '../model/communityBook.types';

export async function getMyCommunityBooks(params: CommunityMyBooksQuery): Promise<CommunityMyBooksResult> {
  const query = buildCommunityMyBooksQueryString(params);
  const path = query ? `/api/v1/community/books/my?${query}` : '/api/v1/community/books/my';
  const response = await getJson<CommunityMyBooksResponseDto>(path, { auth: true });
  return toCommunityMyBooksResult(response);
}

export async function getPopularCommunityBooks(params: CommunityPopularBooksQuery): Promise<CommunityPopularBooksResult> {
  const query = buildCommunityPopularBooksQueryString(params);
  const path = query ? `/api/v1/community/books/popular?${query}` : '/api/v1/community/books/popular';
  const response = await getJson<CommunityPopularBooksResponseDto>(path, { auth: true });
  return toCommunityPopularBooksResult(response);
}

export async function getCommunityBookDetail(bookId: number): Promise<CommunityBookDetailResult> {
  const response = await getJson<CommunityBookDetailResponseDto>(`/api/v1/community/books/${bookId}`, { auth: true });
  return toCommunityBookDetailResult(response);
}

export async function getCommunityBookTopQuotes(
  bookId: number,
  params: CommunityBookTopQuotesQuery,
): Promise<CommunityBookTopQuotesResult> {
  const query = buildCommunityBookTopQuotesQueryString(params);
  const path = query
    ? `/api/v1/community/books/${bookId}/top-quotes?${query}`
    : `/api/v1/community/books/${bookId}/top-quotes`;
  const response = await getJson<CommunityBookTopQuotesResponseDto>(path, { auth: true });
  return toCommunityBookTopQuotesResult(response);
}

export async function getBookDiscussions(
  bookId: number,
  params: CommunityBookDiscussionsQuery,
): Promise<CommunityBookDiscussionsResult> {
  const query = buildCommunityBookDiscussionsQueryString(params);
  const path = query
    ? `/api/v1/community/books/${bookId}/discussions?${query}`
    : `/api/v1/community/books/${bookId}/discussions`;
  const response = await getJson<CommunityBookDiscussionsResponseDto>(path, { auth: true });
  return toCommunityBookDiscussionsResult(response);
}

export async function createBookDiscussion(
  bookId: number,
  input: CreateCommunityDiscussionInput,
): Promise<CreateCommunityDiscussionResult> {
  const dto: CreateCommunityDiscussionRequestDto = toCreateCommunityDiscussionRequestDto(input);
  const response = await postJson<CreateCommunityDiscussionResponseDto>(`/api/v1/community/books/${bookId}/discussions`, {
    auth: true,
    body: dto,
  });
  return toCreateCommunityDiscussionResult(response);
}

export async function getDiscussionDetail(discussionId: number): Promise<CommunityDiscussionDetailResult> {
  const response = await getJson<CommunityDiscussionDetailResponseDto>(
    `/api/v1/community/discussions/${discussionId}`,
    { auth: true },
  );
  return toCommunityDiscussionDetailResult(response);
}

export async function toggleDiscussionLike(discussionId: number): Promise<ToggleDiscussionLikeResult> {
  const response = await postJson<ToggleDiscussionLikeResponseDto>(
    `/api/v1/community/discussions/${discussionId}/likes`,
    { auth: true },
  );
  return toToggleDiscussionLikeResult(response);
}

export async function getDiscussionComments(
  discussionId: number,
  params: CommunityDiscussionCommentsQuery,
): Promise<CommunityDiscussionCommentsResult> {
  const query = buildCommunityDiscussionCommentsQueryString(params);
  const path = query
    ? `/api/v1/community/discussions/${discussionId}/comments?${query}`
    : `/api/v1/community/discussions/${discussionId}/comments`;
  const response = await getJson<CommunityDiscussionCommentsResponseDto>(path, { auth: true });
  return toCommunityDiscussionCommentsResult(response);
}

export async function createDiscussionComment(
  discussionId: number,
  input: CreateDiscussionCommentInput,
): Promise<CreateDiscussionCommentResult> {
  const dto: CreateDiscussionCommentRequestDto = toCreateDiscussionCommentRequestDto(input);
  const response = await postJson<CreateDiscussionCommentResponseDto>(
    `/api/v1/community/discussions/${discussionId}/comments`,
    {
      auth: true,
      body: dto,
    },
  );
  return toCreateDiscussionCommentResult(response);
}

export async function getCommunityBookPolls(
  bookId: number,
  params: CommunityBookPollsQuery,
): Promise<CommunityBookPollsResult> {
  const query = buildCommunityBookPollsQueryString(params);
  const path = query ? `/api/v1/community/books/${bookId}/polls?${query}` : `/api/v1/community/books/${bookId}/polls`;
  const response = await getJson<CommunityBookPollsResponseDto>(path, { auth: true });
  return toCommunityBookPollsResult(response);
}
