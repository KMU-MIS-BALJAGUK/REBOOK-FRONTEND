export type PresignedUrlInput = {
  fileName: string;
  contentType: string;
  fileSize: number;
  purpose: 'QUOTE_OCR';
};

export type PresignedUrlResult = {
  imageId: number;
  objectKey: string;
  uploadUrl: string;
  method: string;
  headers: Record<string, string>;
  expiresIn: number;
  publicUrl?: string;
};
