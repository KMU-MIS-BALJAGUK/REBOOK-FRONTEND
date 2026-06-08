export type GenerateQuoteQuestionCardsResponseDto = {
  quoteId: number;
  status: string;
  questionCount: number;
  generatedAt: string;
};

export type QuoteQuestionCardItemDto = {
  cardId: number;
  type: string;
  label: string;
  question: string;
  why: string;
  displayOrder: number;
};

export type GetQuoteQuestionCardsResponseDto = {
  quoteId: number;
  status: string;
  insightSummary: string | null;
  readingLenses: string[];
  questions: QuoteQuestionCardItemDto[];
  generatedAt?: string;
  lastRunStatus?: string;
};
