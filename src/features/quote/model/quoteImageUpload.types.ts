export type QuoteImageUploadInput = {
  uploadUrl: string;
  method: string;
  headers: Record<string, string>;
  blob: Blob;
};
