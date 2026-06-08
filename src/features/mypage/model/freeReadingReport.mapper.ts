import {
  FreeReadingReportResultJsonDto,
  GenerateFreeReadingReportResponseDto,
  GetFreeReadingReportResponseDto,
} from './freeReadingReport.dto';
import {
  FreeReadingReportFetchStatus,
  FreeReadingReportResult,
  GenerateFreeReadingReportResult,
} from './freeReadingReport.types';

export function toGenerateFreeReadingReportResult(
  dto: GenerateFreeReadingReportResponseDto,
): GenerateFreeReadingReportResult {
  return {
    reportId: dto.reportId,
    status: dto.status,
  };
}

const VALID_REPORT_STATUSES: ReadonlyArray<FreeReadingReportFetchStatus> = [
  'NOT_GENERATED',
  'GENERATING',
  'READY',
  'FAILED',
  'UNKNOWN',
];

function toFreeReadingReportFetchStatus(value: string): FreeReadingReportFetchStatus {
  if (VALID_REPORT_STATUSES.includes(value as FreeReadingReportFetchStatus)) {
    return value as FreeReadingReportFetchStatus;
  }

  return 'UNKNOWN';
}

function buildSections(resultJson: FreeReadingReportResultJsonDto | null): FreeReadingReportResult['sections'] {
  if (!resultJson) {
    return [];
  }

  const highlightSections = (resultJson.highlights ?? []).map((item, index) => ({
    id: `highlight-${index}`,
    title: item.title ?? `하이라이트 ${index + 1}`,
    body: item.content ?? '',
  }));

  const insightSections = (resultJson.insights ?? []).map((item, index) => ({
    id: `insight-${index}`,
    title: item.title ?? `인사이트 ${index + 1}`,
    body: item.content ?? '',
  }));

  return [...highlightSections, ...insightSections];
}

export function toFreeReadingReportResult(dto: GetFreeReadingReportResponseDto): FreeReadingReportResult {
  const reportTitle = dto.resultJson?.report_title ?? dto.resultJson?.title ?? '이번 달 독서 리포트';
  const reportSubtitle = dto.resultJson?.report_subtitle ?? '';
  const openingMessage = dto.resultJson?.opening_message ?? '';
  const readingPatternSummary = dto.resultJson?.reading_pattern_summary
    ? {
        title: dto.resultJson.reading_pattern_summary.title ?? '독서 패턴',
        body: dto.resultJson.reading_pattern_summary.body ?? '',
      }
    : null;
  const topThemes = (dto.resultJson?.top_themes ?? []).map((item) => ({
    theme: item.theme ?? '주제',
    description: item.description ?? '',
    relatedQuotes: item.related_quotes ?? [],
  }));
  const emotionProfile = dto.resultJson?.emotion_profile
    ? {
        title: dto.resultJson.emotion_profile.title ?? '정서의 흐름',
        mainEmotions: dto.resultJson.emotion_profile.main_emotions ?? [],
        body: dto.resultJson.emotion_profile.body ?? '',
      }
    : null;
  const representativeQuotes = (dto.resultJson?.representative_quotes ?? []).map((item) => ({
    bookTitle: item.book_title ?? '책 제목',
    quote: item.quote ?? '',
    reason: item.reason ?? '',
  }));
  const personalInsights = (dto.resultJson?.personal_insights ?? []).map((item) => ({
    title: item.title ?? '인사이트',
    body: item.body ?? '',
  }));
  const reflectionQuestions = dto.resultJson?.reflection_questions ?? [];
  const shareCard = dto.resultJson?.share_card
    ? {
        headline: dto.resultJson.share_card.headline ?? '',
        subtext: dto.resultJson.share_card.subtext ?? '',
      }
    : null;
  const closingMessage = dto.resultJson?.closing_message ?? '';

  return {
    reportId: String(dto.reportId),
    status: dto.status,
    reportPeriod: dto.reportPeriod,
    fetchStatus: toFreeReadingReportFetchStatus(dto.status),
    generatedAt: dto.generatedAt ?? '-',
    lastRunStatus: dto.lastRunStatus ?? null,
    headline: reportTitle,
    subheadline: reportSubtitle,
    openingMessage,
    readingPatternSummary,
    topThemes,
    emotionProfile,
    representativeQuotes,
    personalInsights,
    reflectionQuestions,
    shareCard,
    closingMessage,
    summary: dto.resultJson ? `${dto.reportPeriod} 기준 독서 리포트가 준비됐어요.` : '',
    sections: buildSections(dto.resultJson),
  };
}
