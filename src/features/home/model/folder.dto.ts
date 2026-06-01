export type HomeFolderDto = {
  folderId: number;
  folderName: string;
  quoteCount: number;
  createdAt: string;
};

export type HomeFoldersResponseDto = {
  folders: HomeFolderDto[];
};

export type CreateHomeFolderRequestDto = {
  folderName: string;
};

export type CreateHomeFolderResponseDto = HomeFolderDto;

export type DeleteHomeFolderResponseDto = {
  folderId: number;
  deleted: boolean;
};
