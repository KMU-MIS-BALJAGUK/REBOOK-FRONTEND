import {
  CloseDeepReadingChatResponseDto,
  CreateDeepReadingChatRequestDto,
  CreateDeepReadingChatResponseDto,
  DeepReadingMessageDto,
  GetDeepReadingChatResponseDto,
  GetDeepReadingMessagesResponseDto,
  DeepReadingChatListItemDto,
  GetDeepReadingChatsResponseDto,
  SendDeepReadingMessageRequestDto,
  SendDeepReadingMessageResponseDto,
} from './deepReadingChat.dto';
import {
  CloseDeepReadingChatResult,
  CreateDeepReadingChatInput,
  CreateDeepReadingChatResult,
  DeepReadingChatListItem,
  DeepReadingMessage,
  GetDeepReadingChatResult,
  GetDeepReadingMessagesResult,
  SendDeepReadingMessageInput,
  SendDeepReadingMessageResult,
} from './deepReadingChat.types';
import { formatChatMessageAt } from '../../../shared/utils/formatChatMessageAt';

export function toCreateDeepReadingChatRequestDto(
  input: CreateDeepReadingChatInput,
): CreateDeepReadingChatRequestDto {
  return {
    quoteId: input.quoteId,
    selectedQuestion: input.selectedQuestion,
    selectedQuestionType: input.selectedQuestionType,
  };
}

export function toCreateDeepReadingChatResult(
  dto: CreateDeepReadingChatResponseDto,
): CreateDeepReadingChatResult {
  return {
    chatId: dto.chatId,
    quoteId: dto.quoteId,
    status: dto.status,
  };
}

export function toSendDeepReadingMessageRequestDto(
  input: SendDeepReadingMessageInput,
): SendDeepReadingMessageRequestDto {
  return {
    message: input.message,
  };
}

export function toSendDeepReadingMessageResult(
  dto: SendDeepReadingMessageResponseDto,
): SendDeepReadingMessageResult {
  return {
    chatId: dto.chatId,
    conversationId: dto.conversationId,
    messageId: dto.messageId,
    answer: dto.answer,
    messageAt: dto.messageAt,
    usage: dto.metadata?.usage
      ? {
          promptTokens: dto.metadata.usage.prompt_tokens,
          completionTokens: dto.metadata.usage.completion_tokens,
          totalTokens: dto.metadata.usage.total_tokens,
        }
      : undefined,
  };
}

export function toGetDeepReadingChatResult(
  dto: GetDeepReadingChatResponseDto,
): GetDeepReadingChatResult {
  return {
    chatId: dto.chatId,
    quoteId: dto.quoteId,
    status: dto.status,
    selectedQuestion: dto.selectedQuestion,
    difyConversationId: dto.difyConversationId,
    createdAt: dto.createdAt,
  };
}

function toDeepReadingMessageRole(role: string): DeepReadingMessage['role'] {
  if (role === 'assistant' || role === 'user' || role === 'system') {
    return role;
  }

  return 'assistant';
}

function toDeepReadingMessage(dto: DeepReadingMessageDto): DeepReadingMessage {
  return {
    id: String(dto.messageId),
    role: toDeepReadingMessageRole(dto.role),
    text: dto.content,
    createdAt: formatChatMessageAt(dto.createdAt),
    remoteMessageId: String(dto.messageId),
  };
}

export function toGetDeepReadingMessagesResult(
  dto: GetDeepReadingMessagesResponseDto,
): GetDeepReadingMessagesResult {
  return {
    chatId: dto.chatId,
    messages: dto.messages.map(toDeepReadingMessage),
  };
}

export function toCloseDeepReadingChatResult(
  dto: CloseDeepReadingChatResponseDto,
): CloseDeepReadingChatResult {
  return {
    chatId: dto.chatId,
    status: dto.status,
  };
}

function toDeepReadingChatListItemStatus(value: string): 'ACTIVE' {
  if (value === 'ACTIVE') {
    return 'ACTIVE';
  }

  throw new Error(`Invalid deep reading chat status: ${value}`);
}

function toDeepReadingChatListItem(dto: DeepReadingChatListItemDto): DeepReadingChatListItem {
  return {
    chatId: dto.chatId,
    quoteId: dto.quoteId,
    bookTitle: dto.bookTitle,
    quoteText: dto.quoteText,
    lastUserMessage: dto.lastUserMessage,
    lastUserMessageAt: dto.lastUserMessageAt,
    messageCount: dto.messageCount,
    status: toDeepReadingChatListItemStatus(dto.status),
    createdAt: dto.createdAt,
  };
}

export function toGetDeepReadingChatsResult(dto: GetDeepReadingChatsResponseDto): DeepReadingChatListItem[] {
  return dto.items.map(toDeepReadingChatListItem);
}
