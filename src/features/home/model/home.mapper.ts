import { HomeCardsResponseDto, HomeCardsSearchResponseDto } from './home.dto';
import { HomeCardsResult } from './home.types';

export function toHomeCardsResult(dto: HomeCardsResponseDto): HomeCardsResult {
  return {
    view: dto.view,
    items: dto.items.map((item) => ({
      cardId: item.cardId,
      bookId: item.bookId,
      bookTitle: item.bookTitle,
      author: item.author,
      coverImageUrl: item.coverImageUrl,
      pageNumber: item.pageNumber,
      quoteText: item.quoteText,
      memoPreview: item.memoPreview,
      reactionSummary: {
        totalCount: item.reactionSummary.totalCount,
        myReaction: item.reactionSummary.myReaction,
        counts: item.reactionSummary.counts.map((count) => ({
          emojiType: count.emojiType,
          count: count.count,
        })),
      },
      createdAt: item.createdAt,
    })),
    pageInfo: {
      nextCursor: dto.pageInfo.nextCursor,
      hasNext: dto.pageInfo.hasNext,
      size: dto.pageInfo.size,
    },
  };
}

export function toHomeCardsSearchResult(dto: HomeCardsSearchResponseDto): HomeCardsResult {
  return toHomeCardsResult({
    view: dto.view,
    items: dto.items,
    pageInfo: dto.pageInfo,
  });
}
