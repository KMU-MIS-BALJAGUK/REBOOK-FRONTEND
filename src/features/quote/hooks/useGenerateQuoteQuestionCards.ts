import { useMutation } from '@tanstack/react-query';
import { generateQuoteQuestionCards } from '../services/quoteQuestionCardService';
import { GenerateQuoteQuestionCardsInput, GenerateQuoteQuestionCardsResult } from '../model/quoteQuestionCard.types';

export function useGenerateQuoteQuestionCards() {
  return useMutation<GenerateQuoteQuestionCardsResult, Error, GenerateQuoteQuestionCardsInput>({
    mutationFn: (input) => generateQuoteQuestionCards(input),
  });
}
