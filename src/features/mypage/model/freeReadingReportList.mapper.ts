import { GetFreeReadingReportListResponseDto } from './freeReadingReportList.dto';
import { FreeReadingReportListResult } from './freeReadingReportList.types';

export function toFreeReadingReportListResult(dto: GetFreeReadingReportListResponseDto): FreeReadingReportListResult {
  return {
    items: dto.items.map((item) => ({
      reportId: item.reportId,
      status: item.status,
      reportPeriod: item.reportPeriod,
      generatedAt: item.generatedAt ?? null,
      lastRunStatus: item.lastRunStatus ?? null,
    })),
  };
}
