export type CommunityMyBooksQuery = {
  cursor?: string;
  size?: number;
  q?: string;
};

export type CommunityMyBookItem = {
  bookId: number;
  title: string;
  author: string;
  coverImageUrl: string;
  readerCount: number;
  recentPostCount: number;
  recentPostPeriodDays: number;
  savedQuotePreview: string | null;
  savedQuoteCount: number;
};

export type CommunityMyBooksResult = {
  totalCount: number;
  items: CommunityMyBookItem[];
  pageInfo: {
    nextCursor: string | null;
    hasNext: boolean;
    size: number;
  };
};
