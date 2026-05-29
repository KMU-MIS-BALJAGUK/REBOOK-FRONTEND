import React from 'react';
import { Pressable, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { HomeTabKey } from '../../app/types';

type Props = {
  nickname: string;
  tab: HomeTabKey;
  onChangeTab: (tab: HomeTabKey) => void;
  onPressRegister: () => void;
};

const allNotes = [
  { id: '1', quote: '우리는 길을 잃음으로써 새로운 길을 배운다.', book: '데미안', author: '헤르만 헤세' },
  { id: '2', quote: '희망은 좋은 것이다. 아마 가장 좋은 것일지 모른다.', book: '쇼생크 탈출', author: '스티븐 킹' },
  { id: '3', quote: '나는 나에게 일어난 일의 희생자가 아니라 선택자다.', book: '인생수업', author: '엘리자베스 퀴블러 로스' },
];

const insightNotes = [
  { id: '4', quote: '당신이 읽은 책은 결국 당신이 된다.', book: '독서의 기쁨', author: '수전 와이즈 바우어' },
  { id: '5', quote: '성장은 불편함과 함께 온다.', book: '아주 작은 습관의 힘', author: '제임스 클리어' },
];

export function HomeScreen({ nickname, tab, onChangeTab, onPressRegister }: Props) {
  const list = tab === 'all' ? allNotes : tab === 'insight' ? insightNotes : [];
  const displayName = nickname.trim() ? nickname : 'User';

  return (
    <SafeAreaView style={styles.homeSafeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.homeContainer}>
        <View style={styles.homeHeader}>
          <Text style={styles.homeUsername}>{displayName} r...</Text>
        </View>

        <View style={styles.homeSearchRow}>
          <View style={styles.searchPill}>
            <Text style={styles.searchIcon}>⌕</Text>
            <Text style={styles.searchText}>문장을 검색해보세요</Text>
          </View>
          <View style={styles.roundButton}>
            <Text style={styles.roundButtonText}>⌄</Text>
          </View>
        </View>

        <View style={styles.homeTabRow}>
          <HomeTabButton label="모두 보기" active={tab === 'all'} onPress={() => onChangeTab('all')} />
          <HomeTabButton label="내 도서관" active={tab === 'library'} onPress={() => onChangeTab('library')} />
          <HomeTabButton label="인사이트" active={tab === 'insight'} onPress={() => onChangeTab('insight')} />
        </View>

        {list.length > 0 ? (
          <ScrollView style={styles.homeList} showsVerticalScrollIndicator={false}>
            {list.map((item) => (
              <View key={item.id} style={styles.quoteCard}>
                <Text style={styles.quoteText}>{item.quote}</Text>
                <Text style={styles.quoteMeta}>{item.book} · {item.author}</Text>
                <Text style={styles.quoteMark}>●</Text>
              </View>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyGrid}>
            {[...Array(4)].map((_, index) => (
              <View key={index} style={styles.emptyCard}>
                <Text style={styles.emptyEmoji}>🗒️</Text>
                <Text style={styles.emptyTitle}>아직 기록이 없어요</Text>
              </View>
            ))}
          </View>
        )}

        <Pressable style={styles.floatingButton} onPress={onPressRegister}>
          <Text style={styles.floatingButtonText}>＋</Text>
        </Pressable>

        <View style={styles.bottomNav}>
          <View style={styles.bottomItem}>
            <Text style={styles.bottomIcon}>⌂</Text>
            <Text style={styles.bottomLabelActive}>홈으로</Text>
          </View>
          <View style={styles.bottomItem}>
            <Text style={styles.bottomIcon}>◌</Text>
            <Text style={styles.bottomLabel}>채팅</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

type HomeTabButtonProps = {
  label: string;
  active: boolean;
  onPress: () => void;
};

function HomeTabButton({ label, active, onPress }: HomeTabButtonProps) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.homeTabButton, active && styles.homeTabButtonActive]}>
      <Text style={[styles.homeTabText, active && styles.homeTabTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  homeSafeArea: { flex: 1, backgroundColor: '#f6f3ee' },
  homeContainer: { flex: 1, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 10 },
  homeHeader: { marginBottom: 10 },
  homeUsername: { fontSize: 38, letterSpacing: -0.8, color: '#746d63', fontWeight: '700' },
  homeSearchRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  searchPill: {
    flex: 1,
    minHeight: 32,
    borderRadius: 16,
    backgroundColor: '#efe9df',
    borderWidth: 1,
    borderColor: '#e2d9cc',
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIcon: { fontSize: 13, color: '#948878', marginRight: 6 },
  searchText: { fontSize: 11, color: '#9f968a' },
  roundButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#8d7353',
    justifyContent: 'center',
    alignItems: 'center',
  },
  roundButtonText: { color: '#fff', fontSize: 14, marginTop: -1 },
  homeTabRow: { flexDirection: 'row', gap: 6, marginBottom: 10 },
  homeTabButton: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e4dbce',
    backgroundColor: '#f4efe7',
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  homeTabButtonActive: { backgroundColor: '#8d7353', borderColor: '#8d7353' },
  homeTabText: { color: '#7b7369', fontSize: 11, fontWeight: '600' },
  homeTabTextActive: { color: '#fff' },
  homeList: { flex: 1 },
  quoteCard: {
    backgroundColor: '#f9f6f0',
    borderWidth: 1,
    borderColor: '#ece4d9',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  quoteText: { fontSize: 13, color: '#322d27', lineHeight: 19, marginBottom: 9 },
  quoteMeta: { fontSize: 10, color: '#8b8173' },
  quoteMark: { position: 'absolute', right: 10, bottom: 8, color: '#e6b545', fontSize: 11 },
  emptyGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignContent: 'flex-start',
    rowGap: 10,
    paddingTop: 4,
  },
  emptyCard: {
    width: '48.4%',
    aspectRatio: 0.93,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ece4d8',
    backgroundColor: '#f7f3ec',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyEmoji: { fontSize: 16, opacity: 0.5 },
  emptyTitle: { fontSize: 10, color: '#998f83' },
  floatingButton: {
    position: 'absolute',
    right: 18,
    bottom: 58,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#8d7353',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  floatingButtonText: { color: '#fff', fontSize: 18, lineHeight: 18, marginTop: -1 },
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
});
