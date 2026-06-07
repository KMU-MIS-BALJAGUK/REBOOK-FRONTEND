import React, { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { BottomNav } from '../../shared/ui/BottomNav';
import { MyButton } from '../../shared/ui/MyButton';

type ChatView = 'list' | 'room';

type Props = {
  nickname: string;
  onPressHome: () => void;
  onPressCommunity: () => void;
  onPressMyPage: () => void;
};

const recentChats = [
  {
    id: '1',
    title: '"우리는 말을 하면서 사유할 수 있다..."',
    book: '델리쿠르 등 백작부인',
    preview: '이 문장은 언어와 관계를 이야기하는 것 같아',
    count: '8개 메시지',
  },
  {
    id: '2',
    title: '"슬픔은 시간이 지나면 사라지는 것이 아니라..."',
    book: '우리가 빛의 속도로 갈 수 없다면',
    preview: '감정에 대한 깊은 통찰이에요.',
    count: '12개 메시지',
  },
  {
    id: '3',
    title: '"나는 나의 삶을 살고 있는가..."',
    book: '82년생 김지영',
    preview: '자신의 삶에 대해 질문하는 것은 중요해요.',
    count: '5개 메시지',
  },
];

const storedSentences = [
  '"우리는 말을 하면서 사유할 수 있다. 말은 생각을 반복한다."',
  '"슬픔은 시간이 지나면 사라지는 것이 아니라, 익숙해지는 것이다."',
  '"나는 나의 삶을 살고 있는가, 아니면 누군가의 기대에 부응하고 있는가?"',
  '"따뜻한 말 한마디가 세상을 바꿀 수 있다."',
];

const quickQuestions = ['이 문장 쉽게 해석해줘', '왜 이 문장이 인상 깊었을까?', '내 상황과 연결해서 설명해줘', '비슷한 문장 추천해줘'];

export function AiChatScreen({ nickname, onPressHome, onPressCommunity, onPressMyPage }: Props) {
  const [view, setView] = useState<ChatView>('list');
  const [showSelector, setShowSelector] = useState(false);
  const displayName = nickname.trim() ? nickname : 'User';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <View style={styles.contentSurface}>
          {view === 'list' ? (
            <>
              <View style={styles.listHeader}>
                <View>
                  <Text style={styles.screenTitle}>AI 채팅</Text>
                  <Text style={styles.screenSub}>저장한 문장과 대화를 나눠보세요</Text>
                </View>
                <MyButton onPress={onPressMyPage} />
              </View>

              <TouchableOpacity style={styles.newChatButton} onPress={() => setShowSelector(true)}>
                <Text style={styles.newChatButtonText}>＋ 새 대화 시작하기</Text>
              </TouchableOpacity>

              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>최근 대화</Text>
                <Text style={styles.sectionCount}>{recentChats.length}개</Text>
              </View>

              <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
                {recentChats.map((chat) => (
                  <TouchableOpacity key={chat.id} style={styles.chatCard} onPress={() => setView('room')}>
                    <Text style={styles.chatTitle}>{chat.title}</Text>
                    <Text style={styles.chatBook}>{chat.book}</Text>
                    <Text style={styles.chatPreview}>{chat.preview}</Text>
                    <Text style={styles.chatCount}>{chat.count}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          ) : (
            <>
              <View style={styles.roomHeader}>
                <TouchableOpacity onPress={() => setView('list')}>
                  <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <Text style={styles.roomTitle}>시와 대화하기</Text>
                <View style={styles.headerSpacer} />
              </View>

              <View style={styles.selectedSentenceCard}>
                <Text style={styles.selectedBook}>델리쿠르 등 백작부인 · P.23</Text>
                <Text style={styles.selectedSentence}>"우리는 말을 하면서 사유할 수 없다. 말은 생각을 비판한다."</Text>
              </View>

              <View style={styles.aiBubble}>
                <Text style={styles.aiBubbleText}>이 문장이 마음에 남은 이유가 있을까요?</Text>
              </View>

              <Text style={styles.recommendLabel}>추천 질문</Text>
              {quickQuestions.map((item) => (
                <TouchableOpacity key={item} style={styles.quickChip}>
                  <Text style={styles.quickChipText}>{item}</Text>
                </TouchableOpacity>
              ))}

              <View style={styles.inputRow}>
                <TextInput style={styles.input} placeholder="메시지를 입력하세요..." placeholderTextColor="#a69b8e" />
                <TouchableOpacity style={styles.sendButton}>
                  <Text style={styles.sendButtonText}>➤</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        <View style={styles.bottomNavShell}>
          <BottomNav active="ai-chat" onPressCommunity={onPressCommunity} onPressHome={onPressHome} onPressAiChat={() => {}} />
        </View>

        {showSelector && (
          <>
            <Pressable style={styles.dim} onPress={() => setShowSelector(false)} />
            <View style={styles.sheet}>
              <View style={styles.handle} />
              <Text style={styles.sheetTitle}>문장 선택하기</Text>
              <Text style={styles.sheetSub}>대화를 나눌 문장을 선택하세요</Text>

              <TouchableOpacity
                style={styles.freeTalkButton}
                onPress={() => {
                  setShowSelector(false);
                  setView('room');
                }}
              >
                <Text style={styles.freeTalkTitle}>자유 대화</Text>
                <Text style={styles.freeTalkSub}>문장 없이 AI와 대화하기</Text>
              </TouchableOpacity>

              <Text style={styles.storedTitle}>저장한 문장</Text>
              <ScrollView style={styles.storedList} showsVerticalScrollIndicator={false}>
                {storedSentences.map((sentence) => (
                  <TouchableOpacity
                    key={sentence}
                    style={styles.storedCard}
                    onPress={() => {
                      setShowSelector(false);
                      setView('room');
                    }}
                  >
                    <Text style={styles.storedSentence}>{sentence}</Text>
                    <Text style={styles.storedMeta}>책 정보 · P.23</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, backgroundColor: '#fff' },
  contentSurface: { flex: 1, backgroundColor: '#fff' },
  bottomNavShell: { backgroundColor: '#44c3f3' },
  listHeader: {
    backgroundColor: '#fff',
    paddingTop: 6,
    paddingHorizontal: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#111',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  screenTitle: { fontSize: 28, color: '#2f2a24', fontWeight: '900', marginBottom: 4, letterSpacing: 0.2 },
  screenSub: { fontSize: 11, color: '#6d6256' },
  newChatButton: {
    height: 52,
    borderRadius: 0,
    backgroundColor: '#44c3f3',
    borderWidth: 1,
    borderColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 14,
    marginTop: 12,
  },
  newChatButtonText: { color: '#111', fontSize: 16, fontWeight: '700' },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, marginTop: 14, paddingHorizontal: 14 },
  sectionTitle: { fontSize: 16, color: '#2f2a24', fontWeight: '800' },
  sectionCount: { fontSize: 11, color: '#978c7d' },
  scroll: { flex: 1, paddingHorizontal: 14 },
  chatCard: {
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#e5ddd0',
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  chatTitle: { fontSize: 14, color: '#111', marginBottom: 4, fontWeight: '700' },
  chatBook: { fontSize: 10, color: '#6f6457', marginBottom: 8 },
  chatPreview: { fontSize: 12, color: '#4f463c', marginBottom: 6 },
  chatCount: { fontSize: 10, color: '#6f6457', textAlign: 'right' },
  roomHeader: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee4d8',
  },
  backIcon: { fontSize: 18, color: '#111' },
  roomHeaderTitleWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, justifyContent: 'center' },
  roomHeaderBadge: { width: 28, height: 28, borderRadius: 14, textAlign: 'center', textAlignVertical: 'center', backgroundColor: '#f5efe6', color: '#8d7353', borderWidth: 1, borderColor: '#e3d9cb', overflow: 'hidden' },
  roomTitle: { fontSize: 18, color: '#2f2a24', fontWeight: '800' },
  headerSpacer: { width: 18 },
  selectedSentenceCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e6ddcf',
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 12,
    marginHorizontal: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  selectedBook: { fontSize: 12, color: '#7a6e5f', marginBottom: 6 },
  selectedSentence: { fontSize: 13, color: '#3f362d', lineHeight: 19 },
  aiBubble: {
    alignSelf: 'flex-start',
    borderRadius: 14,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e4dbce',
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 12,
    marginHorizontal: 14,
  },
  aiBubbleText: { fontSize: 13, color: '#544b3f' },
  recommendLabel: { fontSize: 11, color: '#968b7d', marginBottom: 6, marginHorizontal: 14 },
  quickChip: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e7dece',
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 7,
    marginHorizontal: 14,
  },
  quickChipText: { fontSize: 12, color: '#4d4439', fontWeight: '600' },
  inputRow: { marginTop: 'auto', flexDirection: 'row', alignItems: 'center', gap: 8, paddingBottom: 10, paddingHorizontal: 14 },
  input: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5dbce',
    backgroundColor: '#f7f2ea',
    paddingHorizontal: 12,
    color: '#3f362d',
    fontSize: 12,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#d3cabd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonText: { color: '#fff', fontSize: 13 },
  dim: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(0,0,0,0.24)' },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '72%',
    backgroundColor: '#f8f4ed',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  handle: {
    width: 52,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ddd2c3',
    alignSelf: 'center',
    marginBottom: 10,
  },
  sheetTitle: { fontSize: 24, color: '#2f2a24', fontWeight: '700', marginBottom: 3 },
  sheetSub: { fontSize: 11, color: '#918679', marginBottom: 10 },
  freeTalkButton: {
    borderRadius: 10,
    backgroundColor: '#44c3f3',
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#111',
  },
  freeTalkTitle: { fontSize: 14, color: '#111', fontWeight: '700', marginBottom: 2 },
  freeTalkSub: { fontSize: 11, color: '#111' },
  storedTitle: { fontSize: 10, color: '#8f8477', marginBottom: 7 },
  storedList: { flexGrow: 0 },
  storedCard: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e8dfd2',
    backgroundColor: '#f9f5ef',
    padding: 10,
    marginBottom: 8,
  },
  storedSentence: { fontSize: 12, color: '#3f362d', marginBottom: 4 },
  storedMeta: { fontSize: 10, color: '#918679' },
});
