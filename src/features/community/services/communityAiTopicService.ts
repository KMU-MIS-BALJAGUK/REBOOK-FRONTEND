import { getJson, postJson } from '../../../shared/api/httpClient';
import {
  GenerateCommunityAiTopicsResponseDto,
  GetCommunityAiTopicsResponseDto,
} from '../model/communityAiTopic.dto';
import { toCommunityAiTopicSet, toGenerateCommunityAiTopicsResult } from '../model/communityAiTopic.mapper';
import {
  CommunityAiTopicSet,
  GenerateCommunityAiTopicsInput,
  GenerateCommunityAiTopicsResult,
} from '../model/communityAiTopic.types';

export async function generateCommunityAiTopics(
  input: GenerateCommunityAiTopicsInput,
): Promise<GenerateCommunityAiTopicsResult> {
  const response = await postJson<GenerateCommunityAiTopicsResponseDto>(
    `/api/v1/community/books/${input.bookId}/ai/topics/generate`,
    {
      auth: true,
      body: {},
    },
  );

  return toGenerateCommunityAiTopicsResult(response);
}

export async function getCommunityAiTopics(bookId: number): Promise<CommunityAiTopicSet> {
  const response = await getJson<GetCommunityAiTopicsResponseDto>(`/api/v1/community/books/${bookId}/ai/topics`, {
    auth: true,
  });

  return toCommunityAiTopicSet(response);
}
