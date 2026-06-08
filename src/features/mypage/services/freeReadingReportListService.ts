import { getJson } from '../../../shared/api/httpClient';
import { GetFreeReadingReportListResponseDto } from '../model/freeReadingReportList.dto';
import { toFreeReadingReportListResult } from '../model/freeReadingReportList.mapper';
import { FreeReadingReportListResult } from '../model/freeReadingReportList.types';

export async function getFreeReadingReports(): Promise<FreeReadingReportListResult> {
  const response = await getJson<GetFreeReadingReportListResponseDto>('/api/v1/me/reports', {
    auth: true,
  });

  return toFreeReadingReportListResult(response);
}
