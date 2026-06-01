export type FolderItem = {
  folderId: number;
  folderName: string;
  quoteCount: number;
  createdAt: string;
};

export type GetFoldersInput = {
  includeQuoteCount?: boolean;
};
