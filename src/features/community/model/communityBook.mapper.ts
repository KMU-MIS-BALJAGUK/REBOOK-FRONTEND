import { CommunityMyBooksResponseDto } from './communityBook.dto';
import { CommunityMyBooksQuery, CommunityMyBooksResult } from './communityBook.types';

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
