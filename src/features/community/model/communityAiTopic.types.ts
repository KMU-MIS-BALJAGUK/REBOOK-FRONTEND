export type CommunityAiTopicStatus = 'idle' | 'loading' | 'error' | 'empty' | 'success';

export type GenerateCommunityAiTopicsInput = {
  bookId: number;
};

export type GenerateCommunityAiTopicsResult = {
  bookId: number;
  status: string;
  topicCount: number;
  generatedAt: string;
};

export type CommunityAiTopicsFetchStatus =
  | 'NOT_GENERATED'
  | 'GENERATING'
  | 'READY'
  | 'FAILED'
  | 'UNKNOWN';

export type CommunityAiTopicItem = {
  id: string;
  title: string;
  topicId: number;
  description: string;
  displayOrder: number;
};

export type CommunityAiTopicSet = {
  bookId: number;
  status: CommunityAiTopicStatus;
  fetchStatus?: CommunityAiTopicsFetchStatus;
  headline: string | null;
  featuredQuote: {
    quoteId: number;
    quoteText: string;
  } | null;
  topics: CommunityAiTopicItem[];
  generatedAt: string | null;
  lastRunStatus?: string | null;
  topicCount?: number;
};
