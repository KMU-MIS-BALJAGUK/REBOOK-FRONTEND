import { getJson } from '../../../shared/api/httpClient';
import { CommunityMyBooksResponseDto } from '../model/communityBook.dto';
import { buildCommunityMyBooksQueryString, toCommunityMyBooksResult } from '../model/communityBook.mapper';
import { CommunityMyBooksQuery, CommunityMyBooksResult } from '../model/communityBook.types';

export async function getMyCommunityBooks(params: CommunityMyBooksQuery): Promise<CommunityMyBooksResult> {
  const query = buildCommunityMyBooksQueryString(params);
  const path = query ? `/api/v1/community/books/my?${query}` : '/api/v1/community/books/my';
  const response = await getJson<CommunityMyBooksResponseDto>(path, { auth: true });
  return toCommunityMyBooksResult(response);
}
