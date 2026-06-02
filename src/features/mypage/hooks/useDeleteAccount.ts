import { useMutation, useQueryClient } from '@tanstack/react-query';
import { clearSession, getSession } from '../../../shared/auth/authSession';
import { ApiError } from '../../../shared/utils/apiError';
import { deleteAccount } from '../services/deleteAccountService';
import { DeleteAccountInput, DeleteAccountResult } from '../model/deleteAccount.types';

export function useDeleteAccount() {
  const queryClient = useQueryClient();

  return useMutation<DeleteAccountResult, Error, DeleteAccountInput | undefined>({
    mutationFn: async (input) => {
      const session = getSession();

      if (!session?.refreshToken) {
        return { deleted: true, deletedAt: new Date().toISOString() };
      }

      try {
        return await deleteAccount(input ?? {});
      } catch (error) {
        if (error instanceof ApiError && (error.status === 401 || error.status === 409)) {
          return { deleted: true, deletedAt: new Date().toISOString() };
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
