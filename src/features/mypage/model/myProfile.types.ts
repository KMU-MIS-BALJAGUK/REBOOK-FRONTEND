export type MyProfile = {
  userId: number;
  nickname: string;
  bio: string;
  profileImageUrl: string;
  initial: string;
};

export type UpdateNicknameInput = {
  nickname: string;
};

export type UpdateBioInput = {
  bio: string;
};

export type MyInsights = {
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
