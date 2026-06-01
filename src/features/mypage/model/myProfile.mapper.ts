import { MyProfileResponseDto, UpdateBioRequestDto, UpdateNicknameRequestDto } from './myProfile.dto';
import { MyProfile, UpdateBioInput, UpdateNicknameInput } from './myProfile.types';

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

export function toUpdateBioRequestDto(input: UpdateBioInput): UpdateBioRequestDto {
  return {
    bio: input.bio.trim(),
  };
}
