import { useQuery } from '@tanstack/react-query';
import { getReactionEmojis } from '../services/homeService';
import { ReactionEmojiOption } from '../model/home.types';

export function useReactionEmojis(enabled: boolean) {
  return useQuery<ReactionEmojiOption[], Error>({
    queryKey: ['home', 'reaction-emojis'],
    queryFn: getReactionEmojis,
    enabled,
  });
}
