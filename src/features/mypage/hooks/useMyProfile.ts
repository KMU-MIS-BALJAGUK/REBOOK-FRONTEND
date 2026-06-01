import { useQuery } from '@tanstack/react-query';
import { getMyProfile } from '../services/myProfileService';
import { MyProfile } from '../model/myProfile.types';

export function useMyProfile() {
  return useQuery<MyProfile, Error>({
    queryKey: ['mypage', 'profile'],
    queryFn: getMyProfile,
  });
}
