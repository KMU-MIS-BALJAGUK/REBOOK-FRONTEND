export type FreeReadingReportStatus = 'idle' | 'loading' | 'error' | 'success';

export type GenerateFreeReadingReportResult = {
  reportId: number;
  status: string;
};

export type FreeReadingReportFetchStatus =
  | 'NOT_GENERATED'
  | 'GENERATING'
  | 'READY'
  | 'FAILED'
  | 'UNKNOWN';

export type FreeReadingReportSection = {
  id: string;
  title: string;
  body: string;
};

export type FreeReadingReportResult = {
  reportId: string;
  status: string;
  reportPeriod: string;
  fetchStatus?: FreeReadingReportFetchStatus;
  generatedAt: string;
  lastRunStatus?: string | null;
  headline: string;
  summary: string;
  sections: FreeReadingReportSection[];
};
