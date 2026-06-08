import { useQuery } from '@tanstack/react-query';
import { GetDeepReadingMessagesResult } from '../model/deepReadingChat.types';
import { getDeepReadingMessages } from '../services/deepReadingChatService';

type Params = {
  chatId: number | null;
  enabled?: boolean;
};

export function useDeepReadingMessages({ chatId, enabled = true }: Params) {
  return useQuery<GetDeepReadingMessagesResult, Error>({
    queryKey: ['ai-chat', 'messages', chatId],
    queryFn: () => getDeepReadingMessages(chatId as number),
    enabled: enabled && chatId !== null,
  });
}
