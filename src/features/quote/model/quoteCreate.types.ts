import { RegisterType } from '../../../app/types';

export type QuoteSourceType = 'IMAGE_OCR' | 'MANUAL';

export type CreateQuoteInput = {
  bookTitle: string;
  author: string;
  coverImageUrl?: string;
  pageNumber: number;
  quoteText: string;
  memo?: string;
  folderId?: number;
  registerType: RegisterType;
  ocrSource?: {
    imageId: number;
    ocrId: number;
    blockIds?: number[];
  };
};

export type CreateQuoteResult = {
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
    type: QuoteSourceType;
    imageId?: number;
    ocrId?: number;
  };
  createdAt: string;
};
