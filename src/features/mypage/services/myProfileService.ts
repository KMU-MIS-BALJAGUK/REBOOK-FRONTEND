import { getJson, patchJson } from '../../../shared/api/httpClient';
import { toMyInsights, toMyProfile, toUpdateBioRequestDto, toUpdateNicknameRequestDto } from '../model/myProfile.mapper';
import { MyInsightsResponseDto, MyProfileResponseDto, UpdateBioRequestDto, UpdateNicknameRequestDto } from '../model/myProfile.dto';
import { MyInsights, MyProfile, UpdateBioInput, UpdateNicknameInput } from '../model/myProfile.types';

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

export async function updateMyBio(input: UpdateBioInput): Promise<MyProfile> {
  const dto: UpdateBioRequestDto = toUpdateBioRequestDto(input);
  const response = await patchJson<MyProfileResponseDto>('/api/v1/me/profile/bio', {
    auth: true,
    body: dto,
  });
  return toMyProfile(response);
}

export async function getMyInsights(): Promise<MyInsights> {
  const response = await getJson<MyInsightsResponseDto>('/api/v1/me/insights', { auth: true });
  return toMyInsights(response);
}
