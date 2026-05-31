import {
  HomeCardDetailResponseDto,
  ReactionEmojisResponseDto,
  HomeCardsFilterResponseDto,
  HomeCardsResponseDto,
  HomeCardsSearchResponseDto,
} from './home.dto';
import { HomeCardDetailResult, HomeCardEmojiType, HomeCardsResult, ReactionEmojiOption } from './home.types';

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

export function toHomeCardsFilterResult(dto: HomeCardsFilterResponseDto): HomeCardsResult {
  return toHomeCardsResult({
    view: dto.view,
    items: dto.items,
    pageInfo: dto.pageInfo,
  });
}

export function toHomeCardDetailResult(dto: HomeCardDetailResponseDto): HomeCardDetailResult {
  return {
    cardId: dto.cardId,
    bookId: dto.bookId,
    bookTitle: dto.bookTitle,
    author: dto.author,
    coverImageUrl: dto.coverImageUrl,
    pageNumber: dto.pageNumber,
    quoteText: dto.quoteText,
    memo: dto.memo,
    folder: dto.folder
      ? {
          folderId: dto.folder.folderId,
          folderName: dto.folder.folderName,
        }
      : null,
    reactionSummary: {
      totalCount: dto.reactionSummary.totalCount,
      myReaction: dto.reactionSummary.myReaction,
      counts: dto.reactionSummary.counts.map((count) => ({
        emojiType: count.emojiType,
        count: count.count,
      })),
    },
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

export function toReactionEmojiOptions(dto: ReactionEmojisResponseDto): ReactionEmojiOption[] {
  return dto.items
    .map((item) => ({
      emojiType: item.emojiType as HomeCardEmojiType,
      label: item.label,
      sortOrder: item.sortOrder,
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}
