import React, { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  DeepReadingMessage,
  DeepReadingQuoteSource,
  DeepReadingSessionStatus,
  DeepReadingStarterQuestion,
} from '../model/deepReadingChat.types';

type Props = {
  quoteSource: DeepReadingQuoteSource;
  sessionStatus: DeepReadingSessionStatus;
  messages: DeepReadingMessage[];
  selectedStarterQuestion: DeepReadingStarterQuestion | null;
  inputValue: string;
  quickPrompts: DeepReadingStarterQuestion[];
  sessionErrorMessage?: string | null;
  isSubmitting?: boolean;
  canCloseSession?: boolean;
  onBack: () => void;
  onCloseSession: () => void;
  onChangeInput: (value: string) => void;
  onSend: () => void;
  onPressQuickPrompt: (prompt: DeepReadingStarterQuestion) => void;
};

export function DeepReadingRoom({
  quoteSource,
  sessionStatus,
  messages,
  selectedStarterQuestion,
  inputValue,
  quickPrompts,
  sessionErrorMessage,
  isSubmitting = false,
  onBack,
  onChangeInput,
  onSend,
  onPressQuickPrompt,
}: Props) {
  const scrollRef = useRef<ScrollView>(null);
  const showPromptArea = messages.length === 0;

  useEffect(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    });
  }, [messages, selectedStarterQuestion, sessionStatus]);

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} hitSlop={8}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>✦</Text>
          </View>
          <Text style={styles.title}>AI와 대화하기</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.quoteCard}>
          <Text style={styles.quoteMeta}>
            {quoteSource.bookTitle}
            {typeof quoteSource.pageNumber === 'number' ? ` · P.${quoteSource.pageNumber}` : ''}
          </Text>
          <Text style={styles.quoteText}>“{quoteSource.quoteText}”</Text>
        </View>

        {showPromptArea ? (
          <>
            <View style={styles.startBubble}>
              <Text style={styles.startBubbleText}>
                {selectedStarterQuestion?.question ?? '질문 없이 바로 대화를 시작해도 좋아요.'}
              </Text>
            </View>

            <View style={styles.promptLabelWrap}>
              <Text style={styles.promptLabel}>추천 질문</Text>
            </View>

            <View style={styles.promptList}>
              {quickPrompts.map((prompt) => (
                <TouchableOpacity
                  key={prompt.id}
                  style={[styles.promptChip, selectedStarterQuestion?.id === prompt.id && styles.promptChipActive]}
                  onPress={() => onPressQuickPrompt(prompt)}
                  activeOpacity={0.9}
                >
                  <Text style={[styles.promptChipText, selectedStarterQuestion?.id === prompt.id && styles.promptChipTextActive]}>
                    {prompt.question}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        ) : null}

        {messages.length > 0 ? (
          <View style={styles.messageArea}>
            {messages.map((message) => {
              const isUser = message.role === 'user';
              const isLoadingAssistant = message.role === 'assistant' && message.remoteMessageId === 'pending' && message.text.length === 0;

              return (
                  <View key={message.id} style={[styles.messageWrap, isUser ? styles.messageWrapUser : styles.messageWrapAssistant]}>
                  <View
                    style={[
                      styles.messageBubble,
                      isUser ? styles.messageBubbleUser : styles.messageBubbleAssistant,
                      isLoadingAssistant && styles.messageBubbleAssistantLoading,
                    ]}
                  >
                    {isLoadingAssistant ? (
                      <LoadingBubble />
                    ) : (
                      <>
                        <Text style={[styles.messageText, isUser && styles.messageTextUser]}>{message.text}</Text>
                        <Text style={[styles.messageTime, isUser && styles.messageTimeUser]}>{message.createdAt}</Text>
                      </>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        ) : null}

        {sessionErrorMessage ? <Text style={styles.errorText}>{sessionErrorMessage}</Text> : null}
      </ScrollView>

      <View style={styles.inputShell}>
        <TextInput
          style={styles.input}
          value={inputValue}
          onChangeText={onChangeInput}
          placeholder="메시지를 입력하세요..."
          placeholderTextColor="#8a8073"
          multiline={false}
          returnKeyType="send"
          blurOnSubmit
          onSubmitEditing={() => {
            Keyboard.dismiss();
            onSend();
          }}
        />
        <TouchableOpacity
          style={[styles.sendButton, isSubmitting && styles.sendButtonDisabled]}
          disabled={isSubmitting}
          onPress={() => {
            Keyboard.dismiss();
            onSend();
          }}
        >
          {isSubmitting ? <ActivityIndicator color="#111" size="small" /> : <Text style={styles.sendButtonText}>➤</Text>}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

function LoadingBubble() {
  const pulse = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 650,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.45,
          duration: 650,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );

    loop.start();
    return () => {
      loop.stop();
    };
  }, [pulse]);

  return (
    <View style={styles.loadingBubbleWrap}>
      <Animated.View style={[styles.loadingLine, styles.loadingLineShort, { opacity: pulse }]} />
      <Animated.View style={[styles.loadingLine, styles.loadingLineMedium, { opacity: pulse }]} />
      <Animated.View style={[styles.loadingLine, styles.loadingLineLong, { opacity: pulse }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fbf7f1',
  },
  header: {
    height: 64,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#e8e0d4',
    backgroundColor: '#fbf7f1',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  backIcon: {
    fontSize: 22,
    color: '#2f281f',
    fontWeight: '600',
  },
  headerTitleWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#f1eadf',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2d8ca',
  },
  headerBadgeText: {
    fontSize: 15,
    color: '#9a7f55',
    fontWeight: '800',
  },
  title: {
    fontSize: 19,
    color: '#2d261f',
    fontWeight: '900',
  },
  headerSpacer: {
    width: 22,
  },
  scroll: {
    flex: 1,
    backgroundColor: '#fbf7f1',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 18,
    gap: 16,
  },
  quoteCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#ece4d7',
    padding: 18,
    gap: 10,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  quoteMeta: {
    fontSize: 14,
    color: '#5f5549',
    fontWeight: '700',
  },
  quoteText: {
    fontSize: 17,
    lineHeight: 24,
    color: '#2b241d',
    fontWeight: '500',
  },
  startBubble: {
    alignSelf: 'flex-start',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#ebe2d6',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: '90%',
  },
  startBubbleText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#2d261f',
  },
  promptLabelWrap: {
    marginTop: 2,
  },
  promptLabel: {
    fontSize: 13,
    color: '#8a8073',
    fontWeight: '700',
  },
  promptList: {
    gap: 10,
  },
  promptChip: {
    minHeight: 54,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#ece4d7',
    backgroundColor: '#fff',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  promptChipActive: {
    borderColor: '#2d261f',
    backgroundColor: '#f8f2e7',
  },
  promptChipText: {
    fontSize: 15,
    lineHeight: 20,
    color: '#2d261f',
    fontWeight: '600',
  },
  promptChipTextActive: {
    fontWeight: '700',
  },
  messageArea: {
    gap: 10,
    paddingTop: 4,
  },
  messageWrap: { width: '100%' },
  messageWrapAssistant: { alignItems: 'flex-start' },
  messageWrapUser: { alignItems: 'flex-end' },
  messageBubble: {
    maxWidth: '86%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    gap: 6,
    borderWidth: 1,
    borderColor: '#e6ddd0',
  },
  messageBubbleAssistant: { backgroundColor: '#fff' },
  messageBubbleAssistantLoading: {
    paddingVertical: 14,
  },
  messageBubbleUser: { backgroundColor: '#2d261f', borderColor: '#2d261f' },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#2d261f',
  },
  messageTextUser: {
    color: '#fff8ef',
  },
  messageTime: {
    fontSize: 10,
    color: '#8d8175',
  },
  messageTimeUser: {
    color: '#ddd4c7',
  },
  loadingBubbleWrap: {
    gap: 8,
    minWidth: 120,
  },
  loadingLine: {
    height: 10,
    borderRadius: 999,
    backgroundColor: '#ddd6cb',
  },
  loadingLineShort: {
    width: 92,
  },
  loadingLineMedium: {
    width: 128,
  },
  loadingLineLong: {
    width: 108,
  },
  errorText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#b42318',
    fontWeight: '600',
  },
  inputShell: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: '#e8e0d4',
    backgroundColor: '#fbf7f1',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  input: {
    flex: 1,
    height: 50,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e6ddd0',
    backgroundColor: '#f7f0e5',
    paddingHorizontal: 16,
    paddingVertical: 0,
    fontSize: 14,
    lineHeight: 20,
    color: '#2d261f',
    textAlignVertical: 'center',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#d2c6b4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.75,
  },
  sendButtonText: {
    fontSize: 18,
    color: '#fffdf7',
    fontWeight: '900',
    marginTop: -1,
  },
});
