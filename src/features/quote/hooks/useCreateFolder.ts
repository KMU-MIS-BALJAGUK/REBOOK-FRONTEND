import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateFolderInput, CreateFolderResult } from '../model/folderCreate.types';
import { createFolder } from '../services/folderService';

export function useCreateFolder() {
  const queryClient = useQueryClient();

  return useMutation<CreateFolderResult, Error, CreateFolderInput>({
    mutationFn: (input) => createFolder(input),
    onSuccess: () => {
      void Promise.all([
        queryClient.invalidateQueries({ queryKey: ['quote', 'folders'] }),
        queryClient.invalidateQueries({ queryKey: ['home', 'folders'] }),
      ]);
    },
  });
}
