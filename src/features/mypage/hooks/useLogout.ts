import { useMutation, useQueryClient } from '@tanstack/react-query';
import { clearSession, getSession } from '../../../shared/auth/authSession';
import { ApiError } from '../../../shared/utils/apiError';
import { logout } from '../services/logoutService';
import { LogoutResult } from '../model/logout.types';

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation<LogoutResult, Error, void>({
    mutationFn: async () => {
      const session = getSession();

      if (!session?.refreshToken) {
        return { success: true };
      }

      try {
        return await logout({ refreshToken: session.refreshToken });
      } catch (error) {
        if (error instanceof ApiError && (error.status === 400 || error.status === 401)) {
          return { success: true };
        }

        throw error;
      }
    },
    onSuccess: async () => {
      await clearSession();
      queryClient.clear();
    },
  });
}
