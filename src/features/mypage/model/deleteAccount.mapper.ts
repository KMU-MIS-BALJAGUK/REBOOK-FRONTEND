import { DeleteAccountRequestDto, DeleteAccountResponseDto } from './deleteAccount.dto';
import { DeleteAccountInput, DeleteAccountResult } from './deleteAccount.types';

export function toDeleteAccountRequestDto(input: DeleteAccountInput): DeleteAccountRequestDto {
  return {
    reason: input.reason,
    feedback: input.feedback?.trim() ? input.feedback.trim() : undefined,
  };
}

export function toDeleteAccountResult(dto: DeleteAccountResponseDto): DeleteAccountResult {
  return {
    deleted: dto.deleted,
    deletedAt: dto.deletedAt,
  };
}
