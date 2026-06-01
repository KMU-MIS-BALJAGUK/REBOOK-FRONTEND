import { ApiError } from '../../../shared/utils/apiError';
import { deleteJson, getJson, postJson } from '../../../shared/api/httpClient';
import {
  buildHomeFoldersQueryString,
  toCreatedHomeFolder,
  toCreateHomeFolderRequestDto,
  toDeleteHomeFolderResult,
  toHomeFolders,
} from '../model/folder.mapper';
import {
  CreateHomeFolderResponseDto,
  DeleteHomeFolderResponseDto,
  HomeFoldersResponseDto,
} from '../model/folder.dto';
import {
  CreateHomeFolderInput,
  DeleteHomeFolderInput,
  DeleteHomeFolderResult,
  GetHomeFoldersInput,
  HomeFolder,
} from '../model/folder.types';

export async function getHomeFolders(input: GetHomeFoldersInput = {}): Promise<HomeFolder[]> {
  const query = buildHomeFoldersQueryString(input);
  const path = query ? `/api/v1/folders?${query}` : '/api/v1/folders';
  const response = await getJson<HomeFoldersResponseDto>(path, { auth: true });
  return toHomeFolders(response);
}

export async function createHomeFolder(input: CreateHomeFolderInput): Promise<HomeFolder> {
  const dto = toCreateHomeFolderRequestDto(input);
  const response = await postJson<CreateHomeFolderResponseDto>('/api/v1/folders', {
    auth: true,
    body: dto,
  });
  return toCreatedHomeFolder(response);
}

export async function deleteHomeFolder(input: DeleteHomeFolderInput): Promise<DeleteHomeFolderResult> {
  try {
    const response = await deleteJson<DeleteHomeFolderResponseDto>(`/api/v1/folders/${input.folderId}`, {
      auth: true,
    });
    return toDeleteHomeFolderResult(response);
  } catch (error) {
    if (error instanceof ApiError && error.status === 409) {
      throw new Error('폴더에 등록된 문장이 있어 삭제할 수 없어요. 먼저 문장을 이동하거나 삭제해주세요.');
    }
    throw error;
  }
}
