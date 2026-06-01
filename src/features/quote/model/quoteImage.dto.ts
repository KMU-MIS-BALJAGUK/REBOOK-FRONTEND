export type CreatePresignedUrlRequestDto = {
  fileName: string;
  contentType: string;
  fileSize: number;
  purpose: 'QUOTE_OCR';
};

export type CreatePresignedUrlResponseDto = {
  imageId: number;
  objectKey: string;
  uploadUrl: string;
  method: string;
  headers: Record<string, string>;
  expiresIn: number;
  publicUrl?: string;
};
