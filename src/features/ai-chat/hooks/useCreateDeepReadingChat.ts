import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createDeepReadingChat } from '../services/deepReadingChatService';
import {
  CreateDeepReadingChatInput,
  CreateDeepReadingChatResult,
} from '../model/deepReadingChat.types';

export function useCreateDeepReadingChat() {
  const queryClient = useQueryClient();

  return useMutation<CreateDeepReadingChatResult, Error, CreateDeepReadingChatInput>({
    mutationFn: (input) => createDeepReadingChat(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['ai', 'chats'] });
    },
  });
}
