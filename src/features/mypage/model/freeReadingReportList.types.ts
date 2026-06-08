export type FreeReadingReportListItem = {
  reportId: number;
  status: string;
  reportPeriod: string;
  generatedAt: string | null;
  lastRunStatus?: string | null;
};

export type FreeReadingReportListResult = {
  items: FreeReadingReportListItem[];
};
