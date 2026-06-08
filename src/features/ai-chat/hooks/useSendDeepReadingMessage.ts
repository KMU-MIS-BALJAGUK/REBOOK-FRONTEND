import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sendDeepReadingMessage } from '../services/deepReadingChatService';
import {
  SendDeepReadingMessageInput,
  SendDeepReadingMessageResult,
} from '../model/deepReadingChat.types';

export function useSendDeepReadingMessage() {
  const queryClient = useQueryClient();

  return useMutation<SendDeepReadingMessageResult, Error, SendDeepReadingMessageInput>({
    mutationFn: (input) => sendDeepReadingMessage(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['ai', 'chats'] });
    },
  });
}
