import React, { useEffect, useRef, useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, View } from 'react-native';
import { BottomNav } from '../../shared/ui/BottomNav';
import { toUserMessage } from '../../shared/utils/apiError';
import { formatChatMessageAt } from '../../shared/utils/formatChatMessageAt';
import { DeepReadingChatList } from './components/DeepReadingChatList';
import { DeepReadingRoom } from './components/DeepReadingRoom';
import { DeepReadingSelectorSheet } from './components/DeepReadingSelectorSheet';
import { useCloseDeepReadingChat } from './hooks/useCloseDeepReadingChat';
import { useCreateDeepReadingChat } from './hooks/useCreateDeepReadingChat';
import { useDeepReadingChat } from './hooks/useDeepReadingChat';
import { useDeepReadingChats } from './hooks/useDeepReadingChats';
import { useDeepReadingMessages } from './hooks/useDeepReadingMessages';
import { useSendDeepReadingMessage } from './hooks/useSendDeepReadingMessage';
import { mockQuickPrompts } from './model/mockData';
import {
  DeepReadingChatListItem,
  DeepReadingChatPreview,
  DeepReadingChatLaunchContext,
  DeepReadingChatView,
  DeepReadingMessage,
  DeepReadingQuoteSource,
  DeepReadingSessionStatus,
  DeepReadingStarterQuestion,
} from './model/deepReadingChat.types';

type Props = {
  nickname: string;
  onPressHome: () => void;
  onPressCommunity: () => void;
  onPressMyPage: () => void;
  showBottomNav?: boolean;
  launchContext?: DeepReadingChatLaunchContext | null;
  onConsumeLaunchContext?: () => void;
  onViewChange?: (view: DeepReadingChatView) => void;
};

export function AiChatScreen({
  nickname: _nickname,
  onPressHome,
  onPressCommunity,
  onPressMyPage,
  showBottomNav = true,
  launchContext = null,
  onConsumeLaunchContext,
  onViewChange,
}: Props) {
  const closeDeepReadingChatMutation = useCloseDeepReadingChat();
  const createDeepReadingChatMutation = useCreateDeepReadingChat();
  const [view, setView] = useState<DeepReadingChatView>('list');
  const [showSelector, setShowSelector] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<DeepReadingQuoteSource | null>(null);
  const [selectedChat, setSelectedChat] = useState<DeepReadingChatPreview | null>(null);
  const deepReadingChatsQuery = useDeepReadingChats(true);
  const deepReadingChatQuery = useDeepReadingChat({
    chatId: view === 'room' ? (selectedChat?.chatId ?? null) : null,
    enabled: view === 'room' && selectedChat !== null,
  });
  const deepReadingMessagesQuery = useDeepReadingMessages({
    chatId: view === 'room' ? (selectedChat?.chatId ?? null) : null,
    enabled: view === 'room' && selectedChat !== null,
  });
  const sendDeepReadingMessageMutation = useSendDeepReadingMessage();
  const [sessionStatus, setSessionStatus] = useState<DeepReadingSessionStatus>('idle');
  const [selectedStarterQuestion, setSelectedStarterQuestion] = useState<DeepReadingStarterQuestion | null>(null);
  const [sessionValidationMessage, setSessionValidationMessage] = useState<string | null>(null);
  const [draftMessage, setDraftMessage] = useState('');
  const [messages, setMessages] = useState<DeepReadingMessage[]>([]);
  const [hideQuickPrompts, setHideQuickPrompts] = useState(false);
  const handledLaunchKeyRef = useRef<string | null>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingTokenRef = useRef(0);
  const typingResolveRef = useRef<(() => void) | null>(null);

  const clearTypingAnimation = () => {
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
      typingTimerRef.current = null;
    }
    if (typingResolveRef.current) {
      const resolve = typingResolveRef.current;
      typingResolveRef.current = null;
      resolve();
    }
    typingTokenRef.current += 1;
  };

  const getFallbackStarterQuestion = (): DeepReadingStarterQuestion => ({
    id: 'free_chat',
    type: 'free_chat',
    question: '이 문장이 마음에 남은 이유가 있을까요?',
  });

  const playAssistantTyping = (
    chatId: number,
    assistantMessageId: string,
    answer: string,
    conversationId: string,
    messageAt: string,
  ) =>
    new Promise<void>((resolve) => {
      clearTypingAnimation();
      typingResolveRef.current = resolve;
      const token = typingTokenRef.current;

      if (answer.length === 0) {
        setMessages((current) =>
          current.map((message) =>
            message.id === assistantMessageId
              ? { ...message, text: '', createdAt: formatChatMessageAt(messageAt) }
              : message,
          ),
        );
        setSelectedChat((current) =>
          current && current.chatId === chatId
            ? {
                ...current,
                preview: '',
                lastMessageAt: formatChatMessageAt(messageAt),
                sessionStatus: 'active',
                messageCount: current.messageCount + 2,
                conversationId,
              }
            : current,
        );
        typingResolveRef.current = null;
        resolve();
        return;
      }

      let index = 0;
      const step = () => {
        if (typingTokenRef.current !== token) {
          typingResolveRef.current = null;
          resolve();
          return;
        }

        index = Math.min(index + 1, answer.length);
        const nextText = answer.slice(0, index);
        setMessages((current) =>
          current.map((message) =>
            message.id === assistantMessageId ? { ...message, text: nextText } : message,
          ),
        );

        if (index >= answer.length) {
          const formattedMessageAt = formatChatMessageAt(messageAt);
          setSelectedChat((current) =>
            current && current.chatId === chatId
              ? {
                  ...current,
                  preview: answer,
                  lastMessageAt: formattedMessageAt,
                  sessionStatus: 'active',
                  messageCount: current.messageCount + 2,
                conversationId,
              }
            : current,
          );
          setMessages((current) =>
            current.map((message) =>
              message.id === assistantMessageId
                ? { ...message, createdAt: formattedMessageAt }
                : message,
            ),
          );
          typingTimerRef.current = null;
          typingResolveRef.current = null;
          resolve();
          return;
        }

        const lastChar = answer[index - 1];
        const delay = lastChar === ' ' ? 12 : /[,.!?]/.test(lastChar) ? 60 : 18;
        typingTimerRef.current = setTimeout(step, delay);
      };

      typingTimerRef.current = setTimeout(step, 420);
    });

  useEffect(() => {
    if (!deepReadingChatQuery.data) {
      return;
    }

    const matchedPrompt = mockQuickPrompts.find((prompt) => prompt.question === deepReadingChatQuery.data?.selectedQuestion);
    setSelectedStarterQuestion(
      matchedPrompt ?? {
        id: `restored-${deepReadingChatQuery.data.chatId}`,
        type: 'selected_question',
        question: deepReadingChatQuery.data.selectedQuestion,
      },
    );
    setSelectedChat((current) =>
      current
        ? {
            ...current,
            chatId: deepReadingChatQuery.data.chatId,
            conversationId: deepReadingChatQuery.data.difyConversationId,
            sessionStatus: deepReadingChatQuery.data.status === 'ACTIVE' ? 'active' : current.sessionStatus,
          }
        : current,
    );
    setSessionStatus(deepReadingChatQuery.data.status === 'ACTIVE' ? 'active' : 'closed');
  }, [deepReadingChatQuery.data]);

  useEffect(() => {
    if (!deepReadingMessagesQuery.data) {
      return;
    }

    if (deepReadingMessagesQuery.data.messages.length === 0 && messages.length > 0) {
      return;
    }

    setMessages(deepReadingMessagesQuery.data.messages);
  }, [deepReadingMessagesQuery.data, messages.length]);

  useEffect(() => {
    return () => {
      clearTypingAnimation();
    };
  }, []);

  useEffect(() => {
    onViewChange?.(view);
  }, [onViewChange, view]);

  const recentChats = deepReadingChatsQuery.data ?? [];

  const handleOpenChat = (chat: DeepReadingChatListItem) => {
    clearTypingAnimation();
    const quoteSource: DeepReadingQuoteSource = {
      quoteId: chat.quoteId,
      bookTitle: chat.bookTitle,
      author: '',
      pageNumber: null,
      quoteText: chat.quoteText,
    };

    setSelectedChat({
      chatId: chat.chatId,
      title: chat.quoteText,
      preview: chat.lastUserMessage,
      messageCount: chat.messageCount,
      sessionStatus: 'active',
      lastMessageAt: chat.lastUserMessageAt,
      conversationId: null,
      quoteSource,
    });
    setSelectedQuote(quoteSource);
    setMessages([]);
    setSessionStatus('active');
    setSelectedStarterQuestion(null);
    setHideQuickPrompts(false);
    setSessionValidationMessage(null);
    setDraftMessage('');
    createDeepReadingChatMutation.reset();
    sendDeepReadingMessageMutation.reset();
    setView('room');
  };

  const handleCloseSession = async () => {
    if (!selectedChat?.chatId) {
      setSessionValidationMessage('종료할 대화 세션 정보를 찾을 수 없어요.');
      return;
    }

    try {
      clearTypingAnimation();
      setSessionValidationMessage(null);
      const result = await closeDeepReadingChatMutation.mutateAsync(selectedChat.chatId);
      setSessionStatus(result.status === 'CLOSED' ? 'closed' : sessionStatus);
      setSelectedChat(null);
      setMessages([]);
      setDraftMessage('');
      setHideQuickPrompts(false);
      setView('list');
    } catch {
      // Mutation error is rendered in room.
    }
  };

  const handleSelectQuote = (quote: DeepReadingQuoteSource) => {
    clearTypingAnimation();
    setShowSelector(false);
    setSelectedChat(null);
    setSelectedQuote(quote);
    setMessages([]);
    setSessionStatus('idle');
    setSelectedStarterQuestion(null);
    setHideQuickPrompts(false);
    setSessionValidationMessage(null);
    setDraftMessage('');
    createDeepReadingChatMutation.reset();
    sendDeepReadingMessageMutation.reset();
    setView('room');
  };

  const appendConversationTurn = (userText: string, assistantMessageId: string, isPendingAssistant = false) => {
    const now = formatChatMessageAt(Date.now());
    setMessages((current) => [
      ...current,
      {
        id: `user-${Date.now()}`,
        role: 'user',
        text: userText,
        createdAt: now,
      },
      {
        id: `assistant-${assistantMessageId}`,
        role: 'assistant',
        text: '',
        createdAt: now,
        remoteMessageId: isPendingAssistant ? 'pending' : assistantMessageId,
      },
    ]);
  };

  const sendMessageToActiveChat = async (
    chatId: number,
    message: string,
    context?: {
      quoteSource?: DeepReadingQuoteSource | null;
      starterQuestion?: DeepReadingStarterQuestion | null;
    },
  ) => {
    setDraftMessage('');
    const assistantPlaceholderId = `pending-${Date.now()}`;
    appendConversationTurn(message, assistantPlaceholderId, true);

    try {
      const result = await sendDeepReadingMessageMutation.mutateAsync({
        chatId,
        message,
      });

      await playAssistantTyping(
        result.chatId,
        `assistant-${assistantPlaceholderId}`,
        result.answer,
        result.conversationId,
        result.messageAt,
      );
    } catch {
      setMessages((current) =>
        current.map((item) =>
          item.id === `assistant-${assistantPlaceholderId}`
            ? {
                ...item,
                text: '응답을 불러오지 못했어요.',
                remoteMessageId: 'error',
              }
            : item,
        ),
      );
    }
  };

  const createSessionAndSendMessage = async (
    quoteSource: DeepReadingQuoteSource,
    starterQuestion: DeepReadingStarterQuestion,
    initialMessage: string,
  ) => {
    setSessionStatus('creating');
    setSessionValidationMessage(null);

    try {
      const createdSession = await createDeepReadingChatMutation.mutateAsync({
        quoteId: quoteSource.quoteId,
        selectedQuestion: starterQuestion.question,
        selectedQuestionType: starterQuestion.type,
      });

      const createdPreview: DeepReadingChatPreview = {
        chatId: createdSession.chatId,
        title: starterQuestion.question,
        preview: '',
        messageCount: 0,
        sessionStatus: 'active',
        lastMessageAt: formatChatMessageAt(Date.now()),
        conversationId: null,
        quoteSource,
      };

      setSelectedQuote(quoteSource);
      setSelectedStarterQuestion(starterQuestion);
      setSelectedChat(createdPreview);
      setSessionStatus('active');

      try {
        await sendMessageToActiveChat(createdSession.chatId, initialMessage, {
          quoteSource,
          starterQuestion,
        });
      } catch {
        setSessionStatus('active');
      }
    } catch {
      setSessionStatus('error');
    }
  };

  useEffect(() => {
    if (!launchContext) {
      handledLaunchKeyRef.current = null;
      return;
    }

    const launchKey = `${launchContext.quoteSource.quoteId}-${launchContext.starterQuestion.id}-${launchContext.initialMessage}`;
    if (handledLaunchKeyRef.current === launchKey) {
      return;
    }

    handledLaunchKeyRef.current = launchKey;
    setShowSelector(false);
    setSelectedQuote(launchContext.quoteSource);
    setSelectedStarterQuestion(launchContext.starterQuestion);
    setSelectedChat(null);
    setMessages([]);
    setSessionStatus('idle');
    setSessionValidationMessage(null);
    setDraftMessage(launchContext.initialMessage);
    setHideQuickPrompts(true);
    closeDeepReadingChatMutation.reset();
    createDeepReadingChatMutation.reset();
    sendDeepReadingMessageMutation.reset();
    setView('room');
    void createSessionAndSendMessage(
      launchContext.quoteSource,
      launchContext.starterQuestion,
      launchContext.initialMessage,
    );
    onConsumeLaunchContext?.();
  }, [
    closeDeepReadingChatMutation,
    createDeepReadingChatMutation,
    launchContext,
    onConsumeLaunchContext,
    sendDeepReadingMessageMutation,
  ]);

  const handleSend = async () => {
    if (
      sendDeepReadingMessageMutation.isPending ||
      createDeepReadingChatMutation.isPending ||
      closeDeepReadingChatMutation.isPending ||
      deepReadingChatQuery.isLoading ||
      deepReadingMessagesQuery.isLoading ||
      typingTimerRef.current !== null ||
      typingResolveRef.current !== null
    ) {
      return;
    }

    const trimmed = draftMessage.trim();
    if (!trimmed) {
      return;
    }

    if (sessionStatus === 'idle') {
      if (!selectedQuote) {
        setSessionValidationMessage('세션을 시작할 문장을 먼저 선택해주세요.');
        return;
      }

      const starterQuestion = selectedStarterQuestion ?? getFallbackStarterQuestion();
      setSelectedStarterQuestion(starterQuestion);
      await createSessionAndSendMessage(selectedQuote, starterQuestion, trimmed);
      return;
    }

    if (sessionStatus !== 'active') {
      return;
    }

    if (!selectedChat?.chatId) {
      setSessionValidationMessage('대화 세션 정보를 찾을 수 없어요. 다시 시작해주세요.');
      return;
    }

    try {
      setSessionValidationMessage(null);
      await sendMessageToActiveChat(selectedChat.chatId, trimmed);
    } catch {
      // The mutation error is rendered below.
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <View style={styles.contentSurface}>
          {view === 'list' ? (
            <DeepReadingChatList
              chats={recentChats}
              isLoading={deepReadingChatsQuery.isLoading}
              errorMessage={deepReadingChatsQuery.isError ? toUserMessage(deepReadingChatsQuery.error) : null}
              onRetry={() => {
                void deepReadingChatsQuery.refetch();
              }}
              onPressMyPage={onPressMyPage}
              onPressStart={() => setShowSelector(true)}
              onPressChat={handleOpenChat}
            />
          ) : selectedQuote ? (
            <>
              <DeepReadingRoom
                quoteSource={selectedQuote}
                sessionStatus={sessionStatus}
                messages={messages}
                selectedStarterQuestion={selectedStarterQuestion}
                inputValue={draftMessage}
                quickPrompts={mockQuickPrompts}
                hideQuickPrompts={hideQuickPrompts}
                sessionErrorMessage={
                  sessionValidationMessage ??
                  (closeDeepReadingChatMutation.isError ? toUserMessage(closeDeepReadingChatMutation.error) : null) ??
                  (deepReadingChatQuery.isError ? toUserMessage(deepReadingChatQuery.error) : null) ??
                  (deepReadingMessagesQuery.isError ? toUserMessage(deepReadingMessagesQuery.error) : null) ??
                  (sendDeepReadingMessageMutation.isError ? toUserMessage(sendDeepReadingMessageMutation.error) : null) ??
                  (createDeepReadingChatMutation.isError ? toUserMessage(createDeepReadingChatMutation.error) : null)
                }
                isSubmitting={
                  closeDeepReadingChatMutation.isPending ||
                  deepReadingChatQuery.isLoading ||
                  deepReadingMessagesQuery.isLoading ||
                  createDeepReadingChatMutation.isPending ||
                  sendDeepReadingMessageMutation.isPending ||
                  typingTimerRef.current !== null ||
                  typingResolveRef.current !== null
                }
                canCloseSession={Boolean(selectedChat?.chatId) && sessionStatus === 'active'}
                onBack={() => {
                  clearTypingAnimation();
                  setView('list');
                  setSelectedChat(null);
                  setDraftMessage('');
                  setHideQuickPrompts(false);
                  setSessionValidationMessage(null);
                  closeDeepReadingChatMutation.reset();
                  createDeepReadingChatMutation.reset();
                  sendDeepReadingMessageMutation.reset();
                }}
                onCloseSession={handleCloseSession}
                onChangeInput={(value) => {
                  if (closeDeepReadingChatMutation.isError) {
                    closeDeepReadingChatMutation.reset();
                  }
                  if (deepReadingChatQuery.isError) {
                    void deepReadingChatQuery.refetch();
                  }
                  if (deepReadingMessagesQuery.isError) {
                    void deepReadingMessagesQuery.refetch();
                  }
                  if (createDeepReadingChatMutation.isError) {
                    createDeepReadingChatMutation.reset();
                    if (sessionStatus === 'error') {
                      setSessionStatus('idle');
                    }
                  }
                  if (sendDeepReadingMessageMutation.isError) {
                    sendDeepReadingMessageMutation.reset();
                  }
                  setSessionValidationMessage(null);
                  setDraftMessage(value);
                }}
                onSend={handleSend}
                onPressQuickPrompt={(prompt) => {
                  if (closeDeepReadingChatMutation.isError) {
                    closeDeepReadingChatMutation.reset();
                  }
                  if (deepReadingChatQuery.isError) {
                    void deepReadingChatQuery.refetch();
                  }
                  if (deepReadingMessagesQuery.isError) {
                    void deepReadingMessagesQuery.refetch();
                  }
                  if (createDeepReadingChatMutation.isError) {
                    createDeepReadingChatMutation.reset();
                    if (sessionStatus === 'error') {
                      setSessionStatus('idle');
                    }
                  }
                  if (sendDeepReadingMessageMutation.isError) {
                    sendDeepReadingMessageMutation.reset();
                  }
                  setSessionValidationMessage(null);
                  setSelectedStarterQuestion(prompt);
                  setDraftMessage(prompt.question);
                }}
              />
            </>
          ) : null}
        </View>

      <DeepReadingSelectorSheet
        visible={showSelector}
        onClose={() => setShowSelector(false)}
        onSelectQuote={handleSelectQuote}
      />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, backgroundColor: '#fff' },
  contentSurface: { flex: 1, backgroundColor: '#fff', position: 'relative' },
});
