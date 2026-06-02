import { deleteJson } from '../../../shared/api/httpClient';
import { toDeleteAccountRequestDto, toDeleteAccountResult } from '../model/deleteAccount.mapper';
import { DeleteAccountInput, DeleteAccountResult } from '../model/deleteAccount.types';
import { DeleteAccountResponseDto } from '../model/deleteAccount.dto';

export async function deleteAccount(input: DeleteAccountInput): Promise<DeleteAccountResult> {
  const dto = toDeleteAccountRequestDto(input);
  const response = await deleteJson<DeleteAccountResponseDto>('/api/v1/me', {
    auth: true,
    body: Object.keys(dto).length > 0 ? dto : undefined,
  });

  return toDeleteAccountResult(response);
}
