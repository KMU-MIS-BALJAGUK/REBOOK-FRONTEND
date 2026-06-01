import { getJson } from '../../../shared/api/httpClient';
import { GetFoldersResponseDto } from '../model/folder.dto';
import { CreateFolderResponseDto } from '../model/folderCreate.dto';
import { toCreateFolderRequestDto, toCreateFolderResult } from '../model/folderCreate.mapper';
import { buildGetFoldersQueryString, toFolderItems } from '../model/folder.mapper';
import { FolderItem, GetFoldersInput } from '../model/folder.types';
import { CreateFolderInput, CreateFolderResult } from '../model/folderCreate.types';
import { postJson } from '../../../shared/api/httpClient';

export async function getFolders(input: GetFoldersInput = {}): Promise<FolderItem[]> {
  const query = buildGetFoldersQueryString(input);
  const path = query ? `/api/v1/folders?${query}` : '/api/v1/folders';
  const response = await getJson<GetFoldersResponseDto>(path, { auth: true });
  return toFolderItems(response);
}

export async function createFolder(input: CreateFolderInput): Promise<CreateFolderResult> {
  const dto = toCreateFolderRequestDto(input);
  const response = await postJson<CreateFolderResponseDto>('/api/v1/folders', {
    auth: true,
    body: dto,
  });
  return toCreateFolderResult(response);
}
