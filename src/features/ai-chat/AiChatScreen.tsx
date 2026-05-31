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
        {view === 'list' ? (
          <>
            <Text style={styles.screenTitle}>AI 채팅</Text>
            <Text style={styles.screenSub}>저장한 문장과 대화를 나눠보세요</Text>

            <View style={styles.newChatRow}>
              <TouchableOpacity style={styles.newChatButton} onPress={() => setShowSelector(true)}>
                <Text style={styles.newChatButtonText}>＋ 새 대화 시작하기</Text>
              </TouchableOpacity>
              <View style={styles.plusBadge}>
                <Text style={styles.plusBadgeText}>＋</Text>
              </View>
            </View>

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

        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.bottomItem} onPress={onPressCommunity}>
            <Text style={styles.bottomIcon}>◌</Text>
            <Text style={styles.bottomLabel}>커뮤니티</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bottomItem} onPress={onPressHome}>
            <Text style={styles.bottomIcon}>⌂</Text>
            <Text style={styles.bottomLabel}>홈</Text>
          </TouchableOpacity>
          <View style={styles.bottomItem}>
            <Text style={styles.bottomIcon}>◔</Text>
            <Text style={styles.bottomLabelActive}>AI 채팅</Text>
          </View>
          <TouchableOpacity style={styles.bottomItem} onPress={onPressMyPage}>
            <Text style={styles.bottomIcon}>⚪</Text>
            <Text style={styles.bottomLabel}>마이</Text>
          </TouchableOpacity>
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
  safeArea: { flex: 1, backgroundColor: '#f6f3ee' },
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 10 },
  screenTitle: { fontSize: 34, color: '#2f2a24', fontWeight: '700', marginBottom: 4 },
  screenSub: { fontSize: 11, color: '#9a8f81', marginBottom: 12 },
  newChatRow: { marginBottom: 12 },
  newChatButton: {
    height: 42,
    borderRadius: 10,
    backgroundColor: '#8d7353',
    alignItems: 'center',
    justifyContent: 'center',
  },
  newChatButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  plusBadge: {
    position: 'absolute',
    right: 0,
    top: -16,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#8d7353',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusBadgeText: { color: '#fff', fontSize: 16 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  sectionTitle: { fontSize: 14, color: '#3e352b', fontWeight: '700' },
  sectionCount: { fontSize: 11, color: '#978c7d' },
  scroll: { flex: 1 },
  chatCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e8dfd2',
    backgroundColor: '#f9f5ef',
    padding: 12,
    marginBottom: 10,
  },
  chatTitle: { fontSize: 14, color: '#2f2a24', marginBottom: 4 },
  chatBook: { fontSize: 10, color: '#9a8f81', marginBottom: 8 },
  chatPreview: { fontSize: 12, color: '#5e5448', marginBottom: 6 },
  chatCount: { fontSize: 10, color: '#938777', textAlign: 'right' },
  roomHeader: { height: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  backIcon: { fontSize: 18, color: '#4b4236' },
  roomTitle: { fontSize: 17, color: '#2f2a24', fontWeight: '700' },
  headerSpacer: { width: 18 },
  selectedSentenceCard: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e8dfd2',
    backgroundColor: '#f9f5ef',
    padding: 12,
    marginBottom: 12,
  },
  selectedBook: { fontSize: 10, color: '#8f8477', marginBottom: 6 },
  selectedSentence: { fontSize: 12, color: '#3f362d', lineHeight: 18 },
  aiBubble: {
    alignSelf: 'flex-start',
    borderRadius: 14,
    backgroundColor: '#f0ece5',
    borderWidth: 1,
    borderColor: '#e4dbce',
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 12,
  },
  aiBubbleText: { fontSize: 12, color: '#544b3f' },
  recommendLabel: { fontSize: 10, color: '#968b7d', marginBottom: 6 },
  quickChip: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e7dece',
    backgroundColor: '#f8f4ed',
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 7,
  },
  quickChipText: { fontSize: 12, color: '#4d4439' },
  inputRow: { marginTop: 'auto', flexDirection: 'row', alignItems: 'center', gap: 8, paddingBottom: 10 },
  input: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5dbce',
    backgroundColor: '#f1ece4',
    paddingHorizontal: 12,
    color: '#3f362d',
    fontSize: 12,
  },
  sendButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#d3cabd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonText: { color: '#fff', fontSize: 11 },
  bottomNav: {
    height: 48,
    borderTopWidth: 1,
    borderColor: '#e6ddcf',
    backgroundColor: '#f8f4ed',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 8,
  },
  bottomItem: { alignItems: 'center', justifyContent: 'center' },
  bottomIcon: { fontSize: 14, color: '#8f8578', marginBottom: 1 },
  bottomLabel: { fontSize: 10, color: '#92897d' },
  bottomLabelActive: { fontSize: 10, color: '#8d7353', fontWeight: '700' },
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
    backgroundColor: '#8d7353',
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  freeTalkTitle: { fontSize: 14, color: '#fff', fontWeight: '700', marginBottom: 2 },
  freeTalkSub: { fontSize: 11, color: '#eee7dd' },
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
