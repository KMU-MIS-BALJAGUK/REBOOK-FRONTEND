import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  InputAccessoryView,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  PanResponder,
  ScrollView,
  useWindowDimensions,
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
  const { width } = useWindowDimensions();
  const edgeSwipeTranslateX = useRef(new Animated.Value(0)).current;
  const edgeSwipeStartX = useRef(0);
  const edgeSwipeAnimating = useRef(false);
  const [composerHeight, setComposerHeight] = useState(76);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const showPromptArea = messages.length === 0;
  const isIOS = Platform.OS === 'ios';

  const resetEdgeSwipe = () => {
    Animated.spring(edgeSwipeTranslateX, {
      toValue: 0,
      friction: 9,
      tension: 80,
      useNativeDriver: true,
    }).start(() => {
      edgeSwipeAnimating.current = false;
    });
  };

  const dismissEdgeSwipe = () => {
    edgeSwipeAnimating.current = true;
    Keyboard.dismiss();
    Animated.timing(edgeSwipeTranslateX, {
      toValue: width,
      duration: 180,
      useNativeDriver: true,
    }).start(() => {
      edgeSwipeAnimating.current = false;
      edgeSwipeTranslateX.setValue(0);
      onBack();
    });
  };

  const edgeSwipeResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: (_, gestureState) => gestureState.x0 <= 28 && !edgeSwipeAnimating.current,
        onMoveShouldSetPanResponderCapture: (_, gestureState) => {
          if (edgeSwipeAnimating.current) {
            return false;
          }
          if (gestureState.x0 > 28) {
            return false;
          }

          const absDx = Math.abs(gestureState.dx);
          const absDy = Math.abs(gestureState.dy);
          return gestureState.dx > 8 && absDx > absDy * 1.08;
        },
        onPanResponderGrant: () => {
          edgeSwipeTranslateX.stopAnimation((value) => {
            edgeSwipeStartX.current = value;
          });
        },
        onPanResponderMove: (_, gestureState) => {
          const next = Math.max(0, edgeSwipeStartX.current + gestureState.dx);
          edgeSwipeTranslateX.setValue(Math.min(next, width * 0.42));
        },
        onPanResponderRelease: (_, gestureState) => {
          const threshold = width * 0.2;
          if (gestureState.dx >= threshold) {
            dismissEdgeSwipe();
            return;
          }
          resetEdgeSwipe();
        },
        onPanResponderTerminate: () => {
          resetEdgeSwipe();
        },
      }),
    [edgeSwipeTranslateX, width],
  );

  useEffect(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    });
  }, [messages, selectedStarterQuestion, sessionStatus]);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSubscription = Keyboard.addListener(showEvent, (event) => {
      const nextKeyboardHeight = event.endCoordinates?.height ?? 0;
      setKeyboardHeight(nextKeyboardHeight);
      requestAnimationFrame(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      });
    });

    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const bottomSpacerHeight = composerHeight + keyboardHeight + 12;

  return (
    <Animated.View style={[styles.screen, { transform: [{ translateX: edgeSwipeTranslateX }] }]}>
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === 'ios' ? undefined : 'height'}
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

        <View style={styles.roomBody}>
          <ScrollView
            ref={scrollRef}
            style={styles.scroll}
            contentContainerStyle={[styles.content, { paddingBottom: bottomSpacerHeight }]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
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
                      <Text
                        style={[styles.promptChipText, selectedStarterQuestion?.id === prompt.id && styles.promptChipTextActive]}
                      >
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
                  const isLoadingAssistant =
                    message.role === 'assistant' && message.remoteMessageId === 'pending' && message.text.length === 0;

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

            <View style={{ height: 1 }} />
          </ScrollView>

          <View style={styles.edgeSwipeZone} {...edgeSwipeResponder.panHandlers} />
        </View>

        {isIOS ? (
          <InputAccessoryView>
            <Composer
              inputValue={inputValue}
              isSubmitting={isSubmitting}
              onChangeInput={onChangeInput}
              onSend={onSend}
              onFocusInput={() => {
                requestAnimationFrame(() => {
                  scrollRef.current?.scrollToEnd({ animated: false });
                });
              }}
              onLayoutHeight={setComposerHeight}
              accessory
            />
          </InputAccessoryView>
        ) : (
          <Composer
            inputValue={inputValue}
            isSubmitting={isSubmitting}
            onChangeInput={onChangeInput}
            onSend={onSend}
            onFocusInput={() => {
              requestAnimationFrame(() => {
                scrollRef.current?.scrollToEnd({ animated: false });
              });
            }}
            onLayoutHeight={setComposerHeight}
          />
        )}
      </KeyboardAvoidingView>
    </Animated.View>
  );
}

type ComposerProps = {
  inputValue: string;
  isSubmitting: boolean;
  onChangeInput: (value: string) => void;
  onSend: () => void;
  onFocusInput?: () => void;
  onLayoutHeight?: (height: number) => void;
  accessory?: boolean;
};

function Composer({
  inputValue,
  isSubmitting,
  onChangeInput,
  onSend,
  onFocusInput,
  onLayoutHeight,
  accessory = false,
}: ComposerProps) {
  return (
    <View
      style={[styles.inputShell, accessory && styles.inputShellAccessory]}
      onLayout={(event) => {
        onLayoutHeight?.(event.nativeEvent.layout.height);
      }}
    >
      <TextInput
        style={styles.input}
        value={inputValue}
        onChangeText={onChangeInput}
        placeholder="메시지를 입력하세요..."
        placeholderTextColor="#9aa3ad"
        multiline={false}
        returnKeyType="send"
        blurOnSubmit
        onFocus={onFocusInput}
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
    backgroundColor: '#fff',
  },
  roomBody: {
    flex: 1,
    position: 'relative',
  },
  header: {
    height: 64,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#dbe3ea',
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  backIcon: {
    fontSize: 22,
    color: '#111',
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
    backgroundColor: '#48c3f2',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#111',
  },
  headerBadgeText: {
    fontSize: 15,
    color: '#111',
    fontWeight: '800',
  },
  title: {
    fontSize: 19,
    color: '#111',
    fontWeight: '900',
  },
  headerSpacer: {
    width: 22,
  },
  scroll: {
    flex: 1,
    backgroundColor: '#fff',
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
    borderColor: '#dbe3ea',
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
    color: '#66707a',
    fontWeight: '700',
  },
  quoteText: {
    fontSize: 17,
    lineHeight: 24,
    color: '#111',
    fontWeight: '500',
  },
  startBubble: {
    alignSelf: 'flex-start',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#dbe3ea',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: '90%',
  },
  startBubbleText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#111',
  },
  promptLabelWrap: {
    marginTop: 2,
  },
  promptLabel: {
    fontSize: 13,
    color: '#66707a',
    fontWeight: '700',
  },
  promptList: {
    gap: 10,
  },
  promptChip: {
    minHeight: 54,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#dbe3ea',
    backgroundColor: '#fff',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  promptChipActive: {
    borderColor: '#111',
    backgroundColor: '#eef8fd',
  },
  promptChipText: {
    fontSize: 15,
    lineHeight: 20,
    color: '#111',
    fontWeight: '600',
  },
  promptChipTextActive: {
    fontWeight: '700',
  },
  messageArea: {
    gap: 10,
    paddingTop: 4,
  },
  edgeSwipeZone: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 28,
    zIndex: 10,
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
    borderColor: '#dbe3ea',
  },
  messageBubbleAssistant: { backgroundColor: '#fff' },
  messageBubbleAssistantLoading: {
    paddingVertical: 14,
  },
  messageBubbleUser: { backgroundColor: '#111', borderColor: '#111' },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#111',
  },
  messageTextUser: {
    color: '#fff',
  },
  messageTime: {
    fontSize: 10,
    color: '#66707a',
  },
  messageTimeUser: {
    color: '#d9e5ec',
    alignSelf: 'flex-end',
  },
  loadingBubbleWrap: {
    gap: 8,
    minWidth: 120,
  },
  loadingLine: {
    height: 10,
    borderRadius: 999,
    backgroundColor: '#d7e3ea',
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
    borderTopColor: '#dbe3ea',
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  inputShellAccessory: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -2 },
    elevation: 8,
  },
  input: {
    flex: 1,
    height: 50,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#dbe3ea',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 0,
    fontSize: 14,
    lineHeight: 20,
    color: '#111',
    textAlignVertical: 'center',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#48c3f2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.75,
  },
  sendButtonText: {
    fontSize: 18,
    color: '#111',
    fontWeight: '900',
    marginTop: -1,
  },
});
