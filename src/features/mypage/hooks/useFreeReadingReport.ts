import { useQuery } from '@tanstack/react-query';
import { FreeReadingReportResult } from '../model/freeReadingReport.types';
import { getFreeReadingReport } from '../services/freeReadingReportService';

type Params = {
  reportId: number | null;
  enabled?: boolean;
};

export function useFreeReadingReport({ reportId, enabled = true }: Params) {
  return useQuery<FreeReadingReportResult, Error>({
    queryKey: ['mypage', 'free-report', reportId],
    queryFn: () => getFreeReadingReport(reportId as number),
    enabled: enabled && reportId !== null,
    refetchInterval: (query) => (query.state.data?.fetchStatus === 'GENERATING' ? 2000 : false),
  });
}
