import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateMyBio } from '../services/myProfileService';
import { MyProfile, UpdateBioInput } from '../model/myProfile.types';

export function useUpdateMyBio() {
  const queryClient = useQueryClient();

  return useMutation<MyProfile, Error, UpdateBioInput>({
    mutationFn: updateMyBio,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['mypage', 'profile'] });
    },
  });
}
