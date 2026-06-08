import { useQuery } from '@tanstack/react-query';
import { getDeepReadingChats } from '../services/deepReadingChatService';
import { DeepReadingChatListItem } from '../model/deepReadingChat.types';

export function useDeepReadingChats(enabled = true) {
  return useQuery<DeepReadingChatListItem[], Error>({
    queryKey: ['ai', 'chats'],
    queryFn: getDeepReadingChats,
    enabled,
  });
}
