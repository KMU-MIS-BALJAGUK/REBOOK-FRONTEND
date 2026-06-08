import { getJson, postJson } from '../../../shared/api/httpClient';
import {
  CloseDeepReadingChatResponseDto,
  CreateDeepReadingChatRequestDto,
  CreateDeepReadingChatResponseDto,
  DeepReadingChatListItemDto,
  GetDeepReadingMessagesResponseDto,
  GetDeepReadingChatResponseDto,
  GetDeepReadingChatsResponseDto,
  SendDeepReadingMessageRequestDto,
  SendDeepReadingMessageResponseDto,
} from '../model/deepReadingChat.dto';
import {
  toCloseDeepReadingChatResult,
  toCreateDeepReadingChatRequestDto,
  toCreateDeepReadingChatResult,
  toGetDeepReadingChatsResult,
  toGetDeepReadingChatResult,
  toGetDeepReadingMessagesResult,
  toSendDeepReadingMessageRequestDto,
  toSendDeepReadingMessageResult,
} from '../model/deepReadingChat.mapper';
import {
  CloseDeepReadingChatResult,
  CreateDeepReadingChatInput,
  CreateDeepReadingChatResult,
  DeepReadingChatListItem,
  GetDeepReadingChatResult,
  GetDeepReadingMessagesResult,
  SendDeepReadingMessageInput,
  SendDeepReadingMessageResult,
} from '../model/deepReadingChat.types';

export async function createDeepReadingChat(
  input: CreateDeepReadingChatInput,
): Promise<CreateDeepReadingChatResult> {
  const dto: CreateDeepReadingChatRequestDto = toCreateDeepReadingChatRequestDto(input);
  const response = await postJson<CreateDeepReadingChatResponseDto>('/api/v1/ai/chats', {
    auth: true,
    body: dto,
  });

  return toCreateDeepReadingChatResult(response);
}

export async function sendDeepReadingMessage(
  input: SendDeepReadingMessageInput,
): Promise<SendDeepReadingMessageResult> {
  const dto: SendDeepReadingMessageRequestDto = toSendDeepReadingMessageRequestDto(input);
  const response = await postJson<SendDeepReadingMessageResponseDto>(`/api/v1/ai/chats/${input.chatId}/messages`, {
    auth: true,
    body: dto,
  });

  return toSendDeepReadingMessageResult(response);
}

export async function getDeepReadingChat(chatId: number): Promise<GetDeepReadingChatResult> {
  const response = await getJson<GetDeepReadingChatResponseDto>(`/api/v1/ai/chats/${chatId}`, {
    auth: true,
  });

  return toGetDeepReadingChatResult(response);
}

export async function getDeepReadingMessages(chatId: number): Promise<GetDeepReadingMessagesResult> {
  const response = await getJson<GetDeepReadingMessagesResponseDto>(`/api/v1/ai/chats/${chatId}/messages`, {
    auth: true,
  });

  return toGetDeepReadingMessagesResult(response);
}

export async function closeDeepReadingChat(chatId: number): Promise<CloseDeepReadingChatResult> {
  const response = await postJson<CloseDeepReadingChatResponseDto>(`/api/v1/ai/chats/${chatId}/close`, {
    auth: true,
    body: {},
  });

  return toCloseDeepReadingChatResult(response);
}

export async function getDeepReadingChats(): Promise<DeepReadingChatListItem[]> {
  const response = await getJson<GetDeepReadingChatsResponseDto>('/api/v1/ai/chats', {
    auth: true,
  });

  return toGetDeepReadingChatsResult(response);
}
