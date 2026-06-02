export type DeleteAccountReason = 'NOT_USING' | 'PRICE_TOO_HIGH' | 'MISSING_FEATURE' | 'OTHER';

export type DeleteAccountInput = {
  reason?: DeleteAccountReason;
  feedback?: string;
};

export type DeleteAccountResult = {
  deleted: boolean;
  deletedAt: string;
};
