export type CreateDeepReadingChatRequestDto = {
  quoteId: number;
  selectedQuestion: string;
  selectedQuestionType: string;
};

export type CreateDeepReadingChatResponseDto = {
  chatId: number;
  quoteId: number;
  status: string;
};

export type GetDeepReadingChatResponseDto = {
  chatId: number;
  quoteId: number;
  status: string;
  selectedQuestion: string;
  difyConversationId: string | null;
  createdAt: string;
};

export type SendDeepReadingMessageRequestDto = {
  message: string;
};

export type SendDeepReadingMessageResponseDto = {
  chatId: number;
  conversationId: string;
  messageId: string;
  answer: string;
  messageAt: string;
  metadata?: {
    usage?: {
      prompt_tokens?: number;
      completion_tokens?: number;
      total_tokens?: number;
    };
  };
};

export type DeepReadingMessageDto = {
  messageId: number;
  role: string;
  content: string;
  createdAt: string;
};

export type GetDeepReadingMessagesResponseDto = {
  chatId: number;
  messages: DeepReadingMessageDto[];
};

export type CloseDeepReadingChatResponseDto = {
  chatId: number;
  status: string;
};

export type DeepReadingChatListItemDto = {
  chatId: number;
  quoteId: number;
  bookTitle: string;
  quoteText: string;
  lastUserMessage: string;
  lastUserMessageAt: string;
  messageCount: number;
  status: string;
  createdAt: string;
};

export type GetDeepReadingChatsResponseDto = {
  items: DeepReadingChatListItemDto[];
};
