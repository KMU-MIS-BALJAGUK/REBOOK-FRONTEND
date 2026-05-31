import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DeleteHomeFolderInput, DeleteHomeFolderResult } from '../model/folder.types';
import { deleteHomeFolder } from '../services/folderService';

export function useHomeDeleteFolder() {
  const queryClient = useQueryClient();

  return useMutation<DeleteHomeFolderResult, Error, DeleteHomeFolderInput>({
    mutationFn: (input) => deleteHomeFolder(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['home', 'folders'] });
    },
  });
}
