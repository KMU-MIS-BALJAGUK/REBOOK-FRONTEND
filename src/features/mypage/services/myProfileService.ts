import { getJson, patchJson } from '../../../shared/api/httpClient';
import { toMyProfile, toUpdateNicknameRequestDto } from '../model/myProfile.mapper';
import { MyProfileResponseDto, UpdateNicknameRequestDto } from '../model/myProfile.dto';
import { MyProfile, UpdateNicknameInput } from '../model/myProfile.types';

export async function getMyProfile(): Promise<MyProfile> {
  const response = await getJson<MyProfileResponseDto>('/api/v1/me/profile', { auth: true });
  return toMyProfile(response);
}

export async function updateMyNickname(input: UpdateNicknameInput): Promise<MyProfile> {
  const dto: UpdateNicknameRequestDto = toUpdateNicknameRequestDto(input);
  const response = await patchJson<MyProfileResponseDto>('/api/v1/me/profile/nickname', {
    auth: true,
    body: dto,
  });
  return toMyProfile(response);
}
