import { useMutation } from '@tanstack/react-query';
import { reactToCard } from '../services/homeService';
import { ReactToCardInput, ReactToCardResult } from '../model/home.types';

export function useCardReaction() {
  return useMutation<ReactToCardResult, Error, ReactToCardInput>({
    mutationFn: (input) => reactToCard(input),
  });
}
