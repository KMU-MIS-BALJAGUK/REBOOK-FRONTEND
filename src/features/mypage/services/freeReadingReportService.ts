import { getJson, postJson } from '../../../shared/api/httpClient';
import {
  GenerateFreeReadingReportResponseDto,
  GetFreeReadingReportResponseDto,
} from '../model/freeReadingReport.dto';
import {
  toFreeReadingReportResult,
  toGenerateFreeReadingReportResult,
} from '../model/freeReadingReport.mapper';
import {
  FreeReadingReportResult,
  GenerateFreeReadingReportResult,
} from '../model/freeReadingReport.types';

export async function generateFreeReadingReport(): Promise<GenerateFreeReadingReportResult> {
  const response = await postJson<GenerateFreeReadingReportResponseDto>('/api/v1/me/reports', {
    auth: true,
    body: {},
  });

  return toGenerateFreeReadingReportResult(response);
}

export async function getFreeReadingReport(reportId: number): Promise<FreeReadingReportResult> {
  const response = await getJson<GetFreeReadingReportResponseDto>(`/api/v1/me/reports/${reportId}`, {
    auth: true,
  });

  return toFreeReadingReportResult(response);
}
