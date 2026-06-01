import { useQuery } from '@tanstack/react-query';
import { getMyInsights } from '../services/myProfileService';
import { MyInsights } from '../model/myProfile.types';

export function useMyInsights() {
  return useQuery<MyInsights, Error>({
    queryKey: ['mypage', 'insights'],
    queryFn: getMyInsights,
  });
}
