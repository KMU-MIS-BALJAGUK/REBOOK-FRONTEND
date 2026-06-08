import { useQuery } from '@tanstack/react-query';
import { GetDeepReadingChatResult } from '../model/deepReadingChat.types';
import { getDeepReadingChat } from '../services/deepReadingChatService';

type Params = {
  chatId: number | null;
  enabled?: boolean;
};

export function useDeepReadingChat({ chatId, enabled = true }: Params) {
  return useQuery<GetDeepReadingChatResult, Error>({
    queryKey: ['ai-chat', 'session', chatId],
    queryFn: () => getDeepReadingChat(chatId as number),
    enabled: enabled && chatId !== null,
  });
}
