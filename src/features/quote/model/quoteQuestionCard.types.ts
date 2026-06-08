export type QuoteQuestionCardStatus = 'idle' | 'loading' | 'error' | 'empty' | 'success';

export type GenerateQuoteQuestionCardsInput = {
  quoteId: number;
};

export type GenerateQuoteQuestionCardsResult = {
  quoteId: number;
  status: string;
  questionCount: number;
  generatedAt: string;
};

export type QuoteQuestionsStatus =
  | 'NOT_GENERATED'
  | 'GENERATING'
  | 'READY'
  | 'FAILED'
  | 'UNKNOWN';

export type GetQuoteQuestionCardsResult = {
  quoteId: number;
  status: QuoteQuestionsStatus;
  insightSummary: string | null;
  readingLenses: string[];
  questions: QuoteQuestionCardItem[];
  generatedAt: string | null;
  lastRunStatus: string | null;
};

export type QuoteQuestionCardItem = {
  id: string;
  cardId: number;
  type: string;
  question: string;
  intentLabel: string;
  guide: string;
  displayOrder: number;
};

export type QuoteQuestionCardQuoteSummary = {
  quoteId: number;
  bookTitle: string;
  author: string;
  pageNumber: number;
  quoteText: string;
};
