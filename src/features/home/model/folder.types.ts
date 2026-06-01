export type HomeFolder = {
  folderId: number;
  folderName: string;
  quoteCount: number;
  createdAt: string;
};

export type GetHomeFoldersInput = {
  includeQuoteCount?: boolean;
};

export type CreateHomeFolderInput = {
  folderName: string;
};

export type DeleteHomeFolderInput = {
  folderId: number;
};

export type DeleteHomeFolderResult = {
  folderId: number;
  deleted: boolean;
};
