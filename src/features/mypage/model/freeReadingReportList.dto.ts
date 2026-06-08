export type FreeReadingReportListItemDto = {
  reportId: number;
  status: string;
  reportPeriod: string;
  generatedAt: string | null;
  lastRunStatus?: string | null;
};

export type GetFreeReadingReportListResponseDto = {
  items: FreeReadingReportListItemDto[];
};
