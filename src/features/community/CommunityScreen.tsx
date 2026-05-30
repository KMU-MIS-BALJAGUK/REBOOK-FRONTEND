import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type CommunityViewMode = 'feed' | 'vote' | 'result';

type Props = {
  nickname: string;
  onPressHome: () => void;
};

const posts = [
  { id: '1', title: '나는 부지런할 때 더 행복해질까?', meta: '72 · 13 · 4' },
  { id: '2', title: '문장을 기록하면 감정이 오래 남나요?', meta: '43 · 7 · 2' },
  { id: '3', title: '독서할 때 메모 습관 공유해요.', meta: '21 · 3 · 1' },
];

export function CommunityScreen({ nickname, onPressHome }: Props) {
  const [mode, setMode] = useState<CommunityViewMode>('feed');
  const displayName = nickname.trim() ? nickname : 'User';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <Text style={styles.username}>{displayName}</Text>

        <View style={styles.searchRow}>
          <View style={styles.searchPill}>
            <Text style={styles.searchIcon}>⌕</Text>
            <Text style={styles.searchText}>커뮤니티 글 검색해보세요</Text>
          </View>
          <View style={styles.badgeButton}>
            <Text style={styles.badgeButtonText}>14</Text>
          </View>
        </View>

        <View style={styles.modeRow}>
          <ModeButton label="피드" active={mode === 'feed'} onPress={() => setMode('feed')} />
          <ModeButton label="투표" active={mode === 'vote'} onPress={() => setMode('vote')} />
          <ModeButton label="결과" active={mode === 'result'} onPress={() => setMode('result')} />
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.heroCard}>
            <Text style={styles.heroTag}>오늘의 투표</Text>
            <Text style={styles.heroTitle}>일기처럼 문장을 기록하면 더 오래 기억될까요?</Text>
            <Text style={styles.heroSub}>투표에 참여하고 다양한 생각을 확인해보세요</Text>
          </View>

          {mode !== 'feed' && (
            <View style={styles.voteRow}>
              <VoteChip label="찬성" active={mode === 'vote'} />
              <VoteChip label="잘 모르겠어" active={false} />
              <VoteChip label="반대" active={mode === 'result'} />
            </View>
          )}

          {mode === 'result' && (
            <View style={styles.resultCard}>
              <Text style={styles.resultQuestion}>문장 기록이 습관에 영향이 있나요?</Text>
              <View style={styles.resultNumbers}>
                <View style={styles.resultColumn}>
                  <Text style={styles.resultPercent}>68%</Text>
                  <Text style={styles.resultLabel}>기억이 선명해져요</Text>
                </View>
                <View style={styles.resultDivider} />
                <View style={styles.resultColumn}>
                  <Text style={styles.resultPercent}>32%</Text>
                  <Text style={styles.resultLabel}>효과가 비슷해요</Text>
                </View>
              </View>
            </View>
          )}

          <Text style={styles.sectionTitle}>지금 인기 있는 글</Text>
          {posts.map((post) => (
            <View key={post.id} style={styles.postCard}>
              <Text style={styles.postTitle}>{post.title}</Text>
              <Text style={styles.postMeta}>{post.meta}</Text>
            </View>
          ))}

          <Text style={styles.sectionTitle}>커뮤니티 둘러보기</Text>
          <View style={styles.smallCard}><Text style={styles.smallCardTitle}>같이 읽는 문장</Text></View>
          <View style={styles.smallCard}><Text style={styles.smallCardTitle}>이번 주 토론</Text></View>
        </ScrollView>

        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.bottomItem} onPress={onPressHome}>
            <Text style={styles.bottomIcon}>⌂</Text>
            <Text style={styles.bottomLabel}>홈으로</Text>
          </TouchableOpacity>
          <View style={styles.bottomItem}>
            <Text style={styles.bottomIcon}>◌</Text>
            <Text style={styles.bottomLabelActive}>커뮤니티</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

type ModeButtonProps = { label: string; active: boolean; onPress: () => void };

function ModeButton({ label, active, onPress }: ModeButtonProps) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.modeButton, active && styles.modeButtonActive]}>
      <Text style={[styles.modeButtonText, active && styles.modeButtonTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function VoteChip({ label, active }: { label: string; active: boolean }) {
  return (
    <View style={[styles.voteChip, active && styles.voteChipActive]}>
      <Text style={[styles.voteChipText, active && styles.voteChipTextActive]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f6f3ee' },
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 10 },
  username: { fontSize: 38, letterSpacing: -0.8, color: '#746d63', fontWeight: '700', marginBottom: 10 },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
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
  badgeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#8d7353',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeButtonText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  modeRow: { flexDirection: 'row', gap: 6, marginBottom: 10 },
  modeButton: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e4dbce',
    backgroundColor: '#f4efe7',
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  modeButtonActive: { backgroundColor: '#8d7353', borderColor: '#8d7353' },
  modeButtonText: { color: '#7b7369', fontSize: 11, fontWeight: '600' },
  modeButtonTextActive: { color: '#fff' },
  scroll: { flex: 1 },
  heroCard: {
    backgroundColor: '#f9f6f0',
    borderWidth: 1,
    borderColor: '#ece4d9',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  heroTag: { fontSize: 10, color: '#8d7353', fontWeight: '700', marginBottom: 6 },
  heroTitle: { fontSize: 13, color: '#322d27', lineHeight: 18, fontWeight: '600', marginBottom: 6 },
  heroSub: { fontSize: 10, color: '#8b8173' },
  voteRow: { flexDirection: 'row', gap: 6, marginBottom: 8 },
  voteChip: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e4dbce',
    backgroundColor: '#f4efe7',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  voteChipActive: { backgroundColor: '#8d7353', borderColor: '#8d7353' },
  voteChipText: { fontSize: 11, color: '#7b7369' },
  voteChipTextActive: { color: '#fff' },
  resultCard: {
    backgroundColor: '#f8f3ea',
    borderWidth: 1,
    borderColor: '#e7ddcf',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  resultQuestion: { fontSize: 12, color: '#40392f', marginBottom: 9 },
  resultNumbers: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  resultColumn: { flex: 1, alignItems: 'center' },
  resultDivider: { width: 1, height: 34, backgroundColor: '#e2d8c9' },
  resultPercent: { fontSize: 18, color: '#8d7353', fontWeight: '700' },
  resultLabel: { fontSize: 10, color: '#8a8173' },
  sectionTitle: { fontSize: 12, color: '#4f463c', fontWeight: '700', marginTop: 6, marginBottom: 6 },
  postCard: {
    backgroundColor: '#f9f6f0',
    borderWidth: 1,
    borderColor: '#ece4d9',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  postTitle: { fontSize: 12, color: '#322d27', lineHeight: 17, marginBottom: 5 },
  postMeta: { fontSize: 10, color: '#8b8173' },
  smallCard: {
    height: 58,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ece4d9',
    backgroundColor: '#f9f6f0',
    justifyContent: 'center',
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  smallCardTitle: { fontSize: 12, color: '#3f362d', fontWeight: '600' },
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
