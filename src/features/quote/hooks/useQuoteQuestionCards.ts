import { useQuery } from '@tanstack/react-query';
import { GetQuoteQuestionCardsResult } from '../model/quoteQuestionCard.types';
import { getQuoteQuestionCards } from '../services/quoteQuestionCardService';

type Params = {
  quoteId: number | null;
  enabled?: boolean;
};

export function useQuoteQuestionCards({ quoteId, enabled = true }: Params) {
  return useQuery<GetQuoteQuestionCardsResult, Error>({
    queryKey: ['quote', 'ai', 'questions', quoteId],
    queryFn: () => getQuoteQuestionCards(quoteId as number),
    enabled: enabled && quoteId !== null,
    refetchInterval: (query) => (query.state.data?.status === 'GENERATING' ? 2000 : false),
  });
}
