export type QuoteSourceTypeDto = 'IMAGE_OCR' | 'MANUAL';

export type CreateQuoteRequestDto = {
  book: {
    title: string;
    author: string;
    coverImageUrl?: string;
  };
  pageNumber: number;
  quoteText: string;
  memo?: string;
  folderId?: number;
  source: {
    type: QuoteSourceTypeDto;
    imageId?: number;
    ocrId?: number;
    blockIds?: number[];
  };
};

export type CreateQuoteResponseDto = {
  quoteId: number;
  book: {
    bookId: number;
    title: string;
    author: string;
  };
  pageNumber: number;
  quoteText: string;
  memo: string | null;
  folder: {
    folderId: number;
    folderName: string;
  } | null;
  source: {
    type: QuoteSourceTypeDto;
    imageId?: number;
    ocrId?: number;
  };
  createdAt: string;
};
