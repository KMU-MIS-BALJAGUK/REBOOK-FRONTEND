export type GenerateCommunityAiTopicsResponseDto = {
  bookId: number;
  status: string;
  topicCount: number;
  generatedAt: string;
};

export type CommunityAiTopicItemDto = {
  topicId: number;
  title: string;
  summary: string;
  displayOrder: number;
};

export type GetCommunityAiTopicsResponseDto = {
  bookId: number;
  status: string;
  featuredQuote: {
    quoteId: number;
    quoteText: string;
  } | null;
  topics: CommunityAiTopicItemDto[];
  generatedAt?: string;
  lastRunStatus?: string;
};
