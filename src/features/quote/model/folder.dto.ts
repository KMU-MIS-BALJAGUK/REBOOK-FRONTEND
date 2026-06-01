export type FolderDto = {
  folderId: number;
  folderName: string;
  quoteCount: number;
  createdAt: string;
};

export type GetFoldersResponseDto = {
  folders: FolderDto[];
};
