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
