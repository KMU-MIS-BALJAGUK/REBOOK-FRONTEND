import {
  GenerateQuoteQuestionCardsResponseDto,
  GetQuoteQuestionCardsResponseDto,
} from './quoteQuestionCard.dto';
import {
  GenerateQuoteQuestionCardsResult,
  GetQuoteQuestionCardsResult,
  QuoteQuestionCardItem,
  QuoteQuestionsStatus,
} from './quoteQuestionCard.types';

export function toGenerateQuoteQuestionCardsResult(
  dto: GenerateQuoteQuestionCardsResponseDto,
): GenerateQuoteQuestionCardsResult {
  return {
    quoteId: dto.quoteId,
    status: dto.status,
    questionCount: dto.questionCount,
    generatedAt: dto.generatedAt,
  };
}

const VALID_QUESTION_STATUSES: ReadonlyArray<QuoteQuestionsStatus> = ['NOT_GENERATED', 'GENERATING', 'READY', 'FAILED', 'UNKNOWN'];

function toQuoteQuestionsStatus(value: string): QuoteQuestionsStatus {
  if (VALID_QUESTION_STATUSES.includes(value as QuoteQuestionsStatus)) {
    return value as QuoteQuestionsStatus;
  }

  return 'UNKNOWN';
}

function toQuoteQuestionCardItem(dto: GetQuoteQuestionCardsResponseDto['questions'][number]): QuoteQuestionCardItem {
  return {
    id: String(dto.cardId),
    cardId: dto.cardId,
    type: dto.type,
    intentLabel: dto.label,
    question: dto.question,
    guide: dto.why,
    displayOrder: dto.displayOrder,
  };
}

export function toGetQuoteQuestionCardsResult(dto: GetQuoteQuestionCardsResponseDto): GetQuoteQuestionCardsResult {
  return {
    quoteId: dto.quoteId,
    status: toQuoteQuestionsStatus(dto.status),
    insightSummary: dto.insightSummary,
    readingLenses: dto.readingLenses,
    questions: dto.questions.map(toQuoteQuestionCardItem).sort((a, b) => a.displayOrder - b.displayOrder),
    generatedAt: dto.generatedAt ?? null,
    lastRunStatus: dto.lastRunStatus ?? null,
  };
}
