import { useMutation, useQueryClient } from '@tanstack/react-query';
import { closeDeepReadingChat } from '../services/deepReadingChatService';
import { CloseDeepReadingChatResult } from '../model/deepReadingChat.types';

export function useCloseDeepReadingChat() {
  const queryClient = useQueryClient();

  return useMutation<CloseDeepReadingChatResult, Error, number>({
    mutationFn: (chatId) => closeDeepReadingChat(chatId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['ai', 'chats'] });
    },
  });
}
