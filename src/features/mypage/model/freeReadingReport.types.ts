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

export type FreeReadingReportTheme = {
  theme: string;
  description: string;
  relatedQuotes: string[];
};

export type FreeReadingReportQuote = {
  bookTitle: string;
  quote: string;
  reason: string;
};

export type FreeReadingReportInsight = {
  title: string;
  body: string;
};

export type FreeReadingReportCard = {
  headline: string;
  subtext: string;
};

export type FreeReadingReportResult = {
  reportId: string;
  status: string;
  reportPeriod: string;
  fetchStatus?: FreeReadingReportFetchStatus;
  generatedAt: string;
  lastRunStatus?: string | null;
  headline: string;
  subheadline: string;
  openingMessage: string;
  readingPatternSummary: {
    title: string;
    body: string;
  } | null;
  topThemes: FreeReadingReportTheme[];
  emotionProfile: {
    title: string;
    mainEmotions: string[];
    body: string;
  } | null;
  representativeQuotes: FreeReadingReportQuote[];
  personalInsights: FreeReadingReportInsight[];
  reflectionQuestions: string[];
  shareCard: FreeReadingReportCard | null;
  closingMessage: string;
  summary: string;
  sections: FreeReadingReportSection[];
};
