import {
  CreateHomeFolderRequestDto,
  CreateHomeFolderResponseDto,
  DeleteHomeFolderResponseDto,
  HomeFoldersResponseDto,
} from './folder.dto';
import { CreateHomeFolderInput, DeleteHomeFolderResult, GetHomeFoldersInput, HomeFolder } from './folder.types';

export function buildHomeFoldersQueryString(input: GetHomeFoldersInput): string {
  const query = new URLSearchParams();
  if (typeof input.includeQuoteCount === 'boolean') {
    query.set('includeQuoteCount', String(input.includeQuoteCount));
  }
  return query.toString();
}

export function toHomeFolders(dto: HomeFoldersResponseDto): HomeFolder[] {
  return dto.folders.map((folder) => ({
    folderId: folder.folderId,
    folderName: folder.folderName,
    quoteCount: folder.quoteCount,
    createdAt: folder.createdAt,
  }));
}

export function toCreateHomeFolderRequestDto(input: CreateHomeFolderInput): CreateHomeFolderRequestDto {
  return {
    folderName: input.folderName.trim(),
  };
}

export function toCreatedHomeFolder(dto: CreateHomeFolderResponseDto): HomeFolder {
  return {
    folderId: dto.folderId,
    folderName: dto.folderName,
    quoteCount: dto.quoteCount,
    createdAt: dto.createdAt,
  };
}

export function toDeleteHomeFolderResult(dto: DeleteHomeFolderResponseDto): DeleteHomeFolderResult {
  return {
    folderId: dto.folderId,
    deleted: dto.deleted,
  };
}
