import { getJson, postJson } from '../../../shared/api/httpClient';
import { toGenerateQuoteQuestionCardsResult, toGetQuoteQuestionCardsResult } from '../model/quoteQuestionCard.mapper';
import {
  GenerateQuoteQuestionCardsResponseDto,
  GetQuoteQuestionCardsResponseDto,
} from '../model/quoteQuestionCard.dto';
import {
  GenerateQuoteQuestionCardsInput,
  GenerateQuoteQuestionCardsResult,
  GetQuoteQuestionCardsResult,
} from '../model/quoteQuestionCard.types';

export async function generateQuoteQuestionCards(
  input: GenerateQuoteQuestionCardsInput,
): Promise<GenerateQuoteQuestionCardsResult> {
  const response = await postJson<GenerateQuoteQuestionCardsResponseDto>(
    `/api/v1/quotes/${input.quoteId}/ai/questions/generate`,
    {
      auth: true,
      body: {},
    },
  );

  return toGenerateQuoteQuestionCardsResult(response);
}

export async function getQuoteQuestionCards(quoteId: number): Promise<GetQuoteQuestionCardsResult> {
  const response = await getJson<GetQuoteQuestionCardsResponseDto>(`/api/v1/quotes/${quoteId}/ai/questions`, {
    auth: true,
  });

  return toGetQuoteQuestionCardsResult(response);
}
