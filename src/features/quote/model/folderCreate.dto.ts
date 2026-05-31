export type CreateFolderRequestDto = {
  folderName: string;
};

export type CreateFolderResponseDto = {
  folderId: number;
  folderName: string;
  quoteCount: number;
  createdAt: string;
};
