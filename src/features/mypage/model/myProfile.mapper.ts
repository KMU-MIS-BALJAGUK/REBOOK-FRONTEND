import { MyProfileResponseDto } from './myProfile.dto';
import { MyProfile, UpdateNicknameInput } from './myProfile.types';
import { UpdateNicknameRequestDto } from './myProfile.dto';

export function toMyProfile(dto: MyProfileResponseDto): MyProfile {
  return {
    userId: dto.userId,
    nickname: dto.nickname,
    bio: dto.bio,
    profileImageUrl: dto.profileImageUrl,
    initial: dto.initial,
  };
}

export function toUpdateNicknameRequestDto(input: UpdateNicknameInput): UpdateNicknameRequestDto {
  return {
    nickname: input.nickname.trim(),
  };
}
