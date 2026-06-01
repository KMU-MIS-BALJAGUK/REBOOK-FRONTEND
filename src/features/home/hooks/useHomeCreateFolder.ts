import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateHomeFolderInput, HomeFolder } from '../model/folder.types';
import { createHomeFolder } from '../services/folderService';

export function useHomeCreateFolder() {
  const queryClient = useQueryClient();

  return useMutation<HomeFolder, Error, CreateHomeFolderInput>({
    mutationFn: (input) => createHomeFolder(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['home', 'folders'] });
    },
  });
}
