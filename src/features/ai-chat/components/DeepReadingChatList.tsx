import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MyButton } from '../../../shared/ui/MyButton';
import { DeepReadingChatListItem } from '../model/deepReadingChat.types';

type Props = {
  chats: DeepReadingChatListItem[];
  isLoading?: boolean;
  errorMessage?: string | null;
  onRetry?: () => void;
  onPressMyPage: () => void;
  onPressStart: () => void;
  onPressChat: (chat: DeepReadingChatListItem) => void;
};

export function DeepReadingChatList({
  chats,
  isLoading = false,
  errorMessage = null,
  onRetry,
  onPressMyPage,
  onPressStart,
  onPressChat,
}: Props) {
  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>AI 채팅</Text>
          <Text style={styles.subtitle}>저장한 문장과 대화를 나눠보세요</Text>
        </View>
        <MyButton onPress={onPressMyPage} />
      </View>

      <TouchableOpacity style={styles.startButton} onPress={onPressStart} activeOpacity={0.9}>
        <Text style={styles.startButtonIcon}>＋</Text>
        <Text style={styles.startButtonText}>새 대화 시작하기</Text>
      </TouchableOpacity>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>최근 대화</Text>
        <Text style={styles.sectionMeta}>{chats.length}개</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {isLoading ? <Text style={styles.stateText}>최근 대화를 불러오는 중...</Text> : null}
        {!isLoading && errorMessage ? (
          <View style={styles.stateRow}>
            <Text style={styles.stateText}>{errorMessage}</Text>
            {onRetry ? (
              <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
                <Text style={styles.retryText}>다시 시도</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : null}
        {!isLoading && !errorMessage && chats.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>아직 열린 대화가 없어요</Text>
            <Text style={styles.emptyBody}>문장을 선택해 새 대화를 시작해보세요.</Text>
          </View>
        ) : null}
        {chats.map((chat) => (
          <TouchableOpacity key={chat.chatId} style={styles.card} onPress={() => onPressChat(chat)} activeOpacity={0.9}>
            <View style={styles.quoteBox}>
              <Text style={styles.quoteTitle} numberOfLines={2}>
                {truncateQuote(chat.quoteText)}
              </Text>
              <Text style={styles.quoteMeta}>{chat.bookTitle}</Text>
            </View>
            <View style={styles.messageRow}>
              <Text style={styles.messageIcon}>◌</Text>
              <Text style={styles.messageText} numberOfLines={2}>
                {chat.lastUserMessage}
              </Text>
            </View>
            <View style={styles.footerRow}>
              <Text style={styles.footerMeta}>{formatRelativeTime(chat.lastUserMessageAt)}</Text>
              <Text style={styles.footerMeta}>{chat.messageCount}개 메시지</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

function truncateQuote(text: string) {
  return text.length > 34 ? `${text.slice(0, 34)}...` : text;
}

function formatRelativeTime(isoDate: string) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return isoDate;
  }

  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return '방금 전';
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}시간 전`;
  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay}일 전`;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f7f2ea',
  },
  header: {
    paddingTop: 10,
    paddingHorizontal: 18,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerCopy: { flex: 1 },
  title: {
    fontSize: 29,
    lineHeight: 35,
    color: '#2d261f',
    fontWeight: '900',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: '#6c6155',
  },
  startButton: {
    marginHorizontal: 18,
    marginTop: 6,
    minHeight: 72,
    borderWidth: 1.5,
    borderColor: '#111',
    backgroundColor: '#48c3f2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  startButtonIcon: {
    fontSize: 24,
    lineHeight: 24,
    color: '#111',
    fontWeight: '700',
    marginTop: -2,
  },
  startButtonText: {
    fontSize: 18,
    color: '#111',
    fontWeight: '800',
  },
  sectionHeader: {
    marginTop: 22,
    marginBottom: 12,
    paddingHorizontal: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    color: '#2d261f',
    fontWeight: '900',
  },
  sectionMeta: {
    fontSize: 12,
    color: '#7a6f63',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 16,
  },
  stateText: {
    fontSize: 13,
    color: '#6c6155',
    paddingVertical: 8,
  },
  stateRow: {
    gap: 8,
    paddingVertical: 8,
  },
  retryButton: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#111',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  retryText: {
    fontSize: 12,
    color: '#111',
    fontWeight: '700',
  },
  emptyState: {
    paddingVertical: 24,
    alignItems: 'center',
    gap: 6,
  },
  emptyTitle: {
    fontSize: 15,
    color: '#2d261f',
    fontWeight: '800',
  },
  emptyBody: {
    fontSize: 13,
    color: '#766b5d',
    textAlign: 'center',
    lineHeight: 19,
  },
  card: {
    borderWidth: 1.5,
    borderColor: '#111',
    backgroundColor: '#fffdf8',
    padding: 12,
    marginBottom: 10,
    gap: 10,
  },
  quoteBox: {
    borderWidth: 1.5,
    borderColor: '#111',
    backgroundColor: '#fff',
    padding: 14,
    gap: 6,
  },
  quoteTitle: {
    fontSize: 16,
    lineHeight: 22,
    color: '#2b241d',
    fontWeight: '700',
  },
  quoteMeta: {
    fontSize: 11,
    color: '#85796c',
    fontWeight: '700',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  messageIcon: {
    fontSize: 16,
    color: '#7a6f63',
    marginTop: 1,
  },
  messageText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: '#2d261f',
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerMeta: {
    fontSize: 10,
    color: '#37a7e8',
    fontWeight: '700',
  },
});
