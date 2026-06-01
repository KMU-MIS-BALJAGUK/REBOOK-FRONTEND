import { MyProfileResponseDto } from './myProfile.dto';
import { MyProfile } from './myProfile.types';

export function toMyProfile(dto: MyProfileResponseDto): MyProfile {
  return {
    userId: dto.userId,
    nickname: dto.nickname,
    bio: dto.bio,
    profileImageUrl: dto.profileImageUrl,
    initial: dto.initial,
  };
}
