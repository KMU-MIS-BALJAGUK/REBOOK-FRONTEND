export type DeleteAccountRequestDto = {
  reason?: 'NOT_USING' | 'PRICE_TOO_HIGH' | 'MISSING_FEATURE' | 'OTHER';
  feedback?: string;
};

export type DeleteAccountResponseDto = {
  deleted: boolean;
  deletedAt: string;
};
