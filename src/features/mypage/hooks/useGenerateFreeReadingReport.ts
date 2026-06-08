import { useMutation } from '@tanstack/react-query';
import { GenerateFreeReadingReportResult } from '../model/freeReadingReport.types';
import { generateFreeReadingReport } from '../services/freeReadingReportService';

export function useGenerateFreeReadingReport() {
  return useMutation<GenerateFreeReadingReportResult, Error>({
    mutationFn: () => generateFreeReadingReport(),
  });
}
