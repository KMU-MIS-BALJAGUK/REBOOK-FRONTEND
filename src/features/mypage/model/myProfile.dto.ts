export type MyProfileResponseDto = {
  userId: number;
  nickname: string;
  bio: string;
  profileImageUrl: string;
  initial: string;
};

export type UpdateNicknameRequestDto = {
  nickname: string;
};

export type UpdateBioRequestDto = {
  bio: string;
};

export type MyInsightsResponseDto = {
  savedQuoteCount: number;
  registeredBookCount: number;
  writtenPostCount: number;
  aiConversationCount: number;
  favoriteEmotion: {
    emoji: string;
    label: string;
    count: number;
  };
  topKeywords: string[];
  favoriteGenre: {
    code: string;
    label: string;
  };
  savedQuotesThisMonth: number;
};
