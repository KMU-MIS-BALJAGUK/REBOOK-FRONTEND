export type GenerateFreeReadingReportResponseDto = {
  reportId: number;
  status: string;
};

export type FreeReadingReportResultJsonDto = {
  title?: string;
  highlights?: Array<{ title?: string; content?: string }>;
  insights?: Array<{ title?: string; content?: string }>;
  shareCard?: Record<string, unknown>;
};

export type GetFreeReadingReportResponseDto = {
  reportId: number;
  status: string;
  reportPeriod: string;
  resultJson: FreeReadingReportResultJsonDto | null;
  generatedAt?: string;
  lastRunStatus?: string;
};
