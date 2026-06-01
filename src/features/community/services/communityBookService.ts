import { getJson } from '../../../shared/api/httpClient';
import {
  CommunityBookDetailResponseDto,
  CommunityMyBooksResponseDto,
  CommunityPopularBooksResponseDto,
} from '../model/communityBook.dto';
import {
  buildCommunityMyBooksQueryString,
  buildCommunityPopularBooksQueryString,
  toCommunityBookDetailResult,
  toCommunityMyBooksResult,
  toCommunityPopularBooksResult,
} from '../model/communityBook.mapper';
import {
  CommunityBookDetailResult,
  CommunityMyBooksQuery,
  CommunityMyBooksResult,
  CommunityPopularBooksQuery,
  CommunityPopularBooksResult,
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
