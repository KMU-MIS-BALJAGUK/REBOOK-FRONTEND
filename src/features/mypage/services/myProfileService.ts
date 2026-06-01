import { getJson } from '../../../shared/api/httpClient';
import { toMyProfile } from '../model/myProfile.mapper';
import { MyProfileResponseDto } from '../model/myProfile.dto';
import { MyProfile } from '../model/myProfile.types';

export async function getMyProfile(): Promise<MyProfile> {
  const response = await getJson<MyProfileResponseDto>('/api/v1/me/profile', { auth: true });
  return toMyProfile(response);
}
