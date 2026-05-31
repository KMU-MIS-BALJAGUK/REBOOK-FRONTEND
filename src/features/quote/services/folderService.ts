import { getJson } from '../../../shared/api/httpClient';
import { GetFoldersResponseDto } from '../model/folder.dto';
import { buildGetFoldersQueryString, toFolderItems } from '../model/folder.mapper';
import { FolderItem, GetFoldersInput } from '../model/folder.types';

export async function getFolders(input: GetFoldersInput = {}): Promise<FolderItem[]> {
  const query = buildGetFoldersQueryString(input);
  const path = query ? `/api/v1/folders?${query}` : '/api/v1/folders';
  const response = await getJson<GetFoldersResponseDto>(path, { auth: true });
  return toFolderItems(response);
}
