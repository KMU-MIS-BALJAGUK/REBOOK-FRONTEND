import { MyInsightsResponseDto, MyProfileResponseDto, UpdateBioRequestDto, UpdateNicknameRequestDto } from './myProfile.dto';
import { MyInsights, MyProfile, UpdateBioInput, UpdateNicknameInput } from './myProfile.types';

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

export function toMyInsights(dto: MyInsightsResponseDto): MyInsights {
  return {
    savedQuoteCount: dto.savedQuoteCount,
    registeredBookCount: dto.registeredBookCount,
    writtenPostCount: dto.writtenPostCount,
    aiConversationCount: dto.aiConversationCount,
    favoriteEmotion: {
      emoji: dto.favoriteEmotion.emoji,
      label: dto.favoriteEmotion.label,
      count: dto.favoriteEmotion.count,
    },
    topKeywords: dto.topKeywords,
    favoriteGenre: {
      code: dto.favoriteGenre.code,
      label: dto.favoriteGenre.label,
    },
    savedQuotesThisMonth: dto.savedQuotesThisMonth,
  };
}
