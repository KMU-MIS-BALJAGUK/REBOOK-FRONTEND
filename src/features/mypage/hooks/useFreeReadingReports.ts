import { useQuery } from '@tanstack/react-query';
import { FreeReadingReportListResult } from '../model/freeReadingReportList.types';
import { getFreeReadingReports } from '../services/freeReadingReportListService';

type Params = {
  enabled?: boolean;
};

export function useFreeReadingReports({ enabled = true }: Params = {}) {
  return useQuery<FreeReadingReportListResult, Error>({
    queryKey: ['mypage', 'free-reports'],
    queryFn: getFreeReadingReports,
    enabled,
  });
}
