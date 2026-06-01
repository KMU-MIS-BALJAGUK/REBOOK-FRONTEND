import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateMyNickname } from '../services/myProfileService';
import { MyProfile, UpdateNicknameInput } from '../model/myProfile.types';

export function useUpdateMyNickname() {
  const queryClient = useQueryClient();

  return useMutation<MyProfile, Error, UpdateNicknameInput>({
    mutationFn: updateMyNickname,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['mypage', 'profile'] });
    },
  });
}
