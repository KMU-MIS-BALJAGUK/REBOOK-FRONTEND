import { CreateFolderRequestDto, CreateFolderResponseDto } from './folderCreate.dto';
import { CreateFolderInput, CreateFolderResult } from './folderCreate.types';

export function toCreateFolderRequestDto(input: CreateFolderInput): CreateFolderRequestDto {
  return {
    folderName: input.folderName.trim(),
  };
}

export function toCreateFolderResult(dto: CreateFolderResponseDto): CreateFolderResult {
  return {
    folderId: dto.folderId,
    folderName: dto.folderName,
    quoteCount: dto.quoteCount,
    createdAt: dto.createdAt,
  };
}
