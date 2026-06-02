export type HomeCardView = 'list' | 'grid';

export type HomeCardSort = 'LATEST' | 'MOST_REACTED';
export type HomeCardCategory = 'BOOK' | 'QUOTE' | 'MEMO';
export type HomeCardsFilterCategory = 'ALL' | 'BOOK' | 'QUOTE' | 'MEMO';
export type HomeCardEmojiType = 'HEART' | 'SMILE' | 'FIRE' | 'CLAP' | 'THINKING';

export type HomeCardsQuery = {
  view: HomeCardView;
  cursor?: string;
  size?: number;
  sort?: HomeCardSort;
};

export type HomeCardsSearchQuery = HomeCardsQuery & {
  q: string;
};

export type HomeCardsFilterQuery = HomeCardsQuery & {
  category?: HomeCardsFilterCategory;
  contentCategory?: HomeCardCategory;
  emojiType?: HomeCardEmojiType;
  folderId?: number;
};

export type EmojiCount = {
  emojiType: HomeCardEmojiType;
  count: number;
};

export type ReactionSummary = {
  totalCount: number;
  myReaction: HomeCardEmojiType | null;
  counts: EmojiCount[];
};

export type HomeCardItem = {
  cardId: number;
  bookId: number;
  bookTitle: string;
  author: string;
  coverImageUrl: string;
  pageNumber: number;
  quoteText: string;
  memoPreview: string | null;
  reactionSummary: ReactionSummary;
  createdAt: string;
};

export type HomeCardsPageInfo = {
  nextCursor: string | null;
  hasNext: boolean;
  size: number;
};

export type HomeCardsResult = {
  view: HomeCardView;
  items: HomeCardItem[];
  pageInfo: HomeCardsPageInfo;
};

export type HomeCardDetailResult = {
  cardId: number;
  bookId: number;
  bookTitle: string;
  author: string;
  coverImageUrl: string;
  pageNumber: number;
  quoteText: string;
  memo: string | null;
  folder: {
    folderId: number;
    folderName: string;
  } | null;
  reactionSummary: ReactionSummary;
  createdAt: string;
  updatedAt: string;
};

export type ReactionEmojiOption = {
  emojiType: HomeCardEmojiType;
  label: string;
  sortOrder: number;
};

export type ReactToCardInput = {
  cardId: number;
  emojiType: HomeCardEmojiType;
};

export type ReactToCardResult = {
  cardId: number;
  myReaction: HomeCardEmojiType | null;
  reactionSummary: ReactionSummary;
};
