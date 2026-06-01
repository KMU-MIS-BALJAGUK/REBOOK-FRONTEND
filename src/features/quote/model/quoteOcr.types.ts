export type QuoteOcrInput = {
  imageId: number;
  imageUrl?: string;
};

export type QuoteOcrBlock = {
  blockId: number;
  text: string;
  selected: boolean;
  bbox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
};

export type QuoteOcrResult = {
  ocrId: number;
  imageId: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  fullText: string;
  blocks: QuoteOcrBlock[];
  detectedLanguage?: string;
  confidence?: number;
};
