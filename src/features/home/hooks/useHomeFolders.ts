import { useQuery } from '@tanstack/react-query';
import { getHomeFolders } from '../services/folderService';
import { GetHomeFoldersInput, HomeFolder } from '../model/folder.types';

export function useHomeFolders(input: GetHomeFoldersInput = {}, enabled = true) {
  return useQuery<HomeFolder[], Error>({
    queryKey: ['home', 'folders', input],
    queryFn: () => getHomeFolders(input),
    enabled,
  });
}
