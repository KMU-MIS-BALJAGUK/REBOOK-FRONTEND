export type HomeCardView = 'list' | 'grid';

export type HomeCardSort = 'LATEST' | 'MOST_REACTED';
export type HomeCardCategory = 'ALL' | 'BOOK' | 'QUOTE' | 'MEMO';
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
  category?: HomeCardCategory;
  emojiType?: HomeCardEmojiType;
  folderId?: number;
};

export type EmojiCount = {
  emojiType: string;
  count: number;
};

export type ReactionSummary = {
  totalCount: number;
  myReaction: string | null;
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
