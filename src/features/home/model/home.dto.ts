export type HomeCardListViewDto = 'list' | 'grid';

export type HomeCardSortDto = 'LATEST' | 'MOST_REACTED';

export type EmojiCountDto = {
  emojiType: string;
  count: number;
};

export type ReactionSummaryDto = {
  totalCount: number;
  myReaction: string | null;
  counts: EmojiCountDto[];
};

export type HomeCardItemDto = {
  cardId: number;
  bookId: number;
  bookTitle: string;
  author: string;
  coverImageUrl: string;
  pageNumber: number;
  quoteText: string;
  memoPreview: string | null;
  reactionSummary: ReactionSummaryDto;
  createdAt: string;
};

export type HomeCardsPageInfoDto = {
  nextCursor: string | null;
  hasNext: boolean;
  size: number;
};

export type HomeCardsResponseDto = {
  view: HomeCardListViewDto;
  items: HomeCardItemDto[];
  pageInfo: HomeCardsPageInfoDto;
};
