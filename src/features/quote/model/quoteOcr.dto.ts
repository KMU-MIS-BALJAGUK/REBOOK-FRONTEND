export type QuoteImageOcrRequestDto = {
  imageId: number;
  imageUrl?: string;
};

export type QuoteOcrBlockDto = {
  blockId: number;
  text: string;
  selected?: boolean;
  bbox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
};

export type QuoteImageOcrResponseDto = {
  ocrId: number;
  imageId: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  fullText: string;
  blocks: QuoteOcrBlockDto[];
  detectedLanguage?: string;
  confidence?: number;
};

export type CreateQuoteOcrRequestDto = QuoteImageOcrRequestDto;
export type CreateQuoteOcrResponseDto = QuoteImageOcrResponseDto;
