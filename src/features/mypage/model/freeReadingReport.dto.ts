export type GenerateFreeReadingReportResponseDto = {
  reportId: number;
  status: string;
};

export type FreeReadingReportThemeDto = {
  theme?: string;
  description?: string;
  related_quotes?: string[];
};

export type FreeReadingReportQuoteDto = {
  book_title?: string;
  quote?: string;
  reason?: string;
};

export type FreeReadingReportInsightDto = {
  title?: string;
  body?: string;
};

export type FreeReadingReportCardDto = {
  headline?: string;
  subtext?: string;
};

export type FreeReadingReportResultJsonDto = {
  report_title?: string;
  report_subtitle?: string;
  opening_message?: string;
  reading_pattern_summary?: {
    title?: string;
    body?: string;
  };
  top_themes?: FreeReadingReportThemeDto[];
  emotion_profile?: {
    title?: string;
    main_emotions?: string[];
    body?: string;
  };
  representative_quotes?: FreeReadingReportQuoteDto[];
  personal_insights?: FreeReadingReportInsightDto[];
  reflection_questions?: string[];
  share_card?: FreeReadingReportCardDto;
  closing_message?: string;
  // legacy compatibility
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
