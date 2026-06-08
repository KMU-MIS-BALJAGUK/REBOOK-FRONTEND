export type DeepReadingChatView = 'list' | 'room';

export type DeepReadingSessionStatus = 'idle' | 'creating' | 'active' | 'error' | 'closed';

export type DeepReadingQuoteSource = {
  quoteId: number;
  bookTitle: string;
  author: string;
  pageNumber?: number | null;
  quoteText: string;
  bookId?: number;
  folderId?: number | null;
  folderName?: string | null;
  emotionType?: string | null;
  emotionLabel?: string | null;
};

export type DeepReadingChatPreview = {
  chatId: number;
  title: string;
  preview: string;
  messageCount: number;
  sessionStatus: DeepReadingSessionStatus;
  lastMessageAt: string;
  conversationId?: string | null;
  quoteSource: DeepReadingQuoteSource;
};

export type DeepReadingChatListItem = {
  chatId: number;
  quoteId: number;
  bookTitle: string;
  quoteText: string;
  lastUserMessage: string;
  lastUserMessageAt: string;
  messageCount: number;
  status: 'ACTIVE';
  createdAt: string;
};

export type DeepReadingMessageRole = 'assistant' | 'user' | 'system';

export type DeepReadingMessage = {
  id: string;
  role: DeepReadingMessageRole;
  text: string;
  createdAt: string;
  remoteMessageId?: string;
};

export type DeepReadingStarterQuestion = {
  id: string;
  type: string;
  question: string;
};

export type DeepReadingChatLaunchContext = {
  quoteSource: DeepReadingQuoteSource;
  starterQuestion: DeepReadingStarterQuestion;
  initialMessage: string;
};

export type CreateDeepReadingChatInput = {
  quoteId: number;
  selectedQuestion: string;
  selectedQuestionType: string;
};

export type CreateDeepReadingChatResult = {
  chatId: number;
  quoteId: number;
  status: string;
};

export type GetDeepReadingChatResult = {
  chatId: number;
  quoteId: number;
  status: string;
  selectedQuestion: string;
  difyConversationId: string | null;
  createdAt: string;
};

export type SendDeepReadingMessageInput = {
  chatId: number;
  message: string;
};

export type SendDeepReadingMessageResult = {
  chatId: number;
  conversationId: string;
  messageId: string;
  answer: string;
  messageAt: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
};

export type GetDeepReadingMessagesResult = {
  chatId: number;
  messages: DeepReadingMessage[];
};

export type CloseDeepReadingChatResult = {
  chatId: number;
  status: string;
};
