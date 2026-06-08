import {
  GenerateCommunityAiTopicsResponseDto,
  GetCommunityAiTopicsResponseDto,
} from './communityAiTopic.dto';
import {
  CommunityAiTopicSet,
  CommunityAiTopicsFetchStatus,
  GenerateCommunityAiTopicsResult,
} from './communityAiTopic.types';

export function toGenerateCommunityAiTopicsResult(
  dto: GenerateCommunityAiTopicsResponseDto,
): GenerateCommunityAiTopicsResult {
  return {
    bookId: dto.bookId,
    status: dto.status,
    topicCount: dto.topicCount,
    generatedAt: dto.generatedAt,
  };
}

const VALID_FETCH_STATUSES: ReadonlyArray<CommunityAiTopicsFetchStatus> = [
  'NOT_GENERATED',
  'GENERATING',
  'READY',
  'FAILED',
  'UNKNOWN',
];

function toCommunityAiTopicsFetchStatus(value: string): CommunityAiTopicsFetchStatus {
  if (VALID_FETCH_STATUSES.includes(value as CommunityAiTopicsFetchStatus)) {
    return value as CommunityAiTopicsFetchStatus;
  }

  return 'UNKNOWN';
}

export function toCommunityAiTopicSet(dto: GetCommunityAiTopicsResponseDto): CommunityAiTopicSet {
  return {
    bookId: dto.bookId,
    status: dto.status === 'READY' ? (dto.topics.length > 0 ? 'success' : 'empty') : dto.status === 'GENERATING' ? 'loading' : 'idle',
    fetchStatus: toCommunityAiTopicsFetchStatus(dto.status),
    headline: null,
    featuredQuote: dto.featuredQuote,
    topics: dto.topics
      .map((topic) => ({
        id: String(topic.topicId),
        topicId: topic.topicId,
        title: topic.title,
        description: topic.summary,
        displayOrder: topic.displayOrder,
      }))
      .sort((a, b) => a.displayOrder - b.displayOrder),
    generatedAt: dto.generatedAt ?? null,
    lastRunStatus: dto.lastRunStatus ?? null,
    topicCount: dto.topics.length,
  };
}
