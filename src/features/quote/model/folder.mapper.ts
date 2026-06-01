import { GetFoldersInput, FolderItem } from './folder.types';
import { GetFoldersResponseDto } from './folder.dto';

export function buildGetFoldersQueryString(input: GetFoldersInput): string {
  const search = new URLSearchParams();
  if (typeof input.includeQuoteCount === 'boolean') {
    search.set('includeQuoteCount', String(input.includeQuoteCount));
  }
  return search.toString();
}

export function toFolderItems(dto: GetFoldersResponseDto): FolderItem[] {
  return dto.folders.map((folder) => ({
    folderId: folder.folderId,
    folderName: folder.folderName,
    quoteCount: folder.quoteCount,
    createdAt: folder.createdAt,
  }));
}
