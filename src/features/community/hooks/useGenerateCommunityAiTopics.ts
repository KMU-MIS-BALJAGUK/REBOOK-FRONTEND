import { useMutation } from '@tanstack/react-query';
import { generateCommunityAiTopics } from '../services/communityAiTopicService';
import {
  GenerateCommunityAiTopicsInput,
  GenerateCommunityAiTopicsResult,
} from '../model/communityAiTopic.types';

export function useGenerateCommunityAiTopics() {
  return useMutation<GenerateCommunityAiTopicsResult, Error, GenerateCommunityAiTopicsInput>({
    mutationFn: (input) => generateCommunityAiTopics(input),
  });
}
