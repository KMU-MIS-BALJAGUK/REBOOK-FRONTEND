export type QuoteImageUploadInput = {
  uploadUrl: string;
  method: string;
  headers: Record<string, string>;
  fileUri: string;
  mimeType: string;
};
