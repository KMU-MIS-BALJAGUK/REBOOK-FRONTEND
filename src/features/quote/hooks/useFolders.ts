import { useQuery } from '@tanstack/react-query';
import { FolderItem, GetFoldersInput } from '../model/folder.types';
import { getFolders } from '../services/folderService';

export function useFolders(input: GetFoldersInput = {}) {
  return useQuery<FolderItem[], Error>({
    queryKey: ['quote', 'folders', input],
    queryFn: () => getFolders(input),
  });
}
