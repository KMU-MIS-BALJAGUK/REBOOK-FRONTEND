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
  return {
    reportId: String(dto.reportId),
    status: dto.status,
    reportPeriod: dto.reportPeriod,
    fetchStatus: toFreeReadingReportFetchStatus(dto.status),
    generatedAt: dto.generatedAt ?? '-',
    lastRunStatus: dto.lastRunStatus ?? null,
    headline: dto.resultJson?.title ?? '이번 달 독서 리포트',
    summary: dto.resultJson ? `${dto.reportPeriod} 기준 무료 독서 리포트가 준비됐어요.` : '',
    sections: buildSections(dto.resultJson),
  };
}
