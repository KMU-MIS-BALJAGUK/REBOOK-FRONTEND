import React, { useMemo, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { HomeTabKey } from '../../app/types';
import { useHomeCards } from './hooks/useHomeCards';
import { HomeCardItem, HomeCardSort, HomeCardView } from './model/home.types';
import { toUserMessage } from '../../shared/utils/apiError';

type Props = {
  nickname: string;
  tab: HomeTabKey;
  onChangeTab: (tab: HomeTabKey) => void;
  onPressRegister: () => void;
  onPressCommunity: () => void;
  onPressAiChat: () => void;
  onPressMyPage: () => void;
};

export function HomeScreen({ nickname, tab, onChangeTab, onPressRegister, onPressCommunity, onPressAiChat, onPressMyPage }: Props) {
  const [viewMode, setViewMode] = useState<HomeCardView>('list');
  const sort: HomeCardSort = useMemo(() => (tab === 'insight' ? 'MOST_REACTED' : 'LATEST'), [tab]);

  const homeCardsQuery = useHomeCards({
    view: viewMode,
    size: 20,
    sort,
  });

  const displayName = nickname.trim() ? nickname : 'User';
  const list = homeCardsQuery.data?.items ?? [];

  return (
    <SafeAreaView style={styles.homeSafeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.homeContainer}>
        <View style={styles.homeHeader}>
          <Text style={styles.homeUsername}>{displayName}</Text>
        </View>

        <View style={styles.homeSearchRow}>
          <View style={styles.searchPill}>
            <Text style={styles.searchIcon}>⌕</Text>
            <Text style={styles.searchText}>문장을 검색해보세요</Text>
          </View>
          <TouchableOpacity
            style={styles.roundButton}
            onPress={() => setViewMode((prev) => (prev === 'list' ? 'grid' : 'list'))}
          >
            <Text style={styles.roundButtonText}>{viewMode === 'list' ? '▦' : '☰'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.homeTabRow}>
          <HomeTabButton label="모두 보기" active={tab === 'all'} onPress={() => onChangeTab('all')} />
          <HomeTabButton label="내 도서관" active={tab === 'library'} onPress={() => onChangeTab('library')} />
          <HomeTabButton label="인사이트" active={tab === 'insight'} onPress={() => onChangeTab('insight')} />
        </View>

        {homeCardsQuery.isLoading ? (
          <View style={styles.centerStateWrap}>
            <Text style={styles.stateText}>카드를 불러오는 중...</Text>
          </View>
        ) : null}

        {!homeCardsQuery.isLoading && homeCardsQuery.isError ? (
          <View style={styles.centerStateWrap}>
            <Text style={styles.stateText}>{toUserMessage(homeCardsQuery.error)}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => void homeCardsQuery.refetch()}>
              <Text style={styles.retryButtonText}>다시 시도</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {!homeCardsQuery.isLoading && !homeCardsQuery.isError && list.length === 0 ? (
          <View style={styles.centerStateWrap}>
            <Text style={styles.stateText}>표시할 카드가 아직 없어요.</Text>
          </View>
        ) : null}

        {!homeCardsQuery.isLoading && !homeCardsQuery.isError && list.length > 0 ? (
          viewMode === 'list' ? (
            <ScrollView style={styles.homeList} showsVerticalScrollIndicator={false}>
              {list.map((item) => (
                <ListCard key={item.cardId} item={item} />
              ))}
            </ScrollView>
          ) : (
            <ScrollView style={styles.homeList} showsVerticalScrollIndicator={false} contentContainerStyle={styles.gridWrap}>
              {list.map((item) => (
                <GridCard key={item.cardId} item={item} />
              ))}
            </ScrollView>
          )
        ) : null}

        <Pressable style={styles.floatingButton} onPress={onPressRegister}>
          <Text style={styles.floatingButtonText}>＋</Text>
        </Pressable>

        <View style={styles.bottomNav}>
          <View style={styles.bottomItem}>
            <Text style={styles.bottomIcon}>⌂</Text>
            <Text style={styles.bottomLabelActive}>홈</Text>
          </View>
          <TouchableOpacity style={styles.bottomItem} onPress={onPressCommunity}>
            <Text style={styles.bottomIcon}>◌</Text>
            <Text style={styles.bottomLabel}>커뮤니티</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bottomItem} onPress={onPressAiChat}>
            <Text style={styles.bottomIcon}>◔</Text>
            <Text style={styles.bottomLabel}>AI 채팅</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bottomItem} onPress={onPressMyPage}>
            <Text style={styles.bottomIcon}>⚪</Text>
            <Text style={styles.bottomLabel}>마이</Text>
          </TouchableOpacity>
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

function ListCard({ item }: { item: HomeCardItem }) {
  return (
    <View style={styles.quoteCard}>
      <Text style={styles.quoteTitle}>{item.bookTitle} · P.{item.pageNumber}</Text>
      <Text style={styles.quoteText}>{item.quoteText}</Text>
      <Text style={styles.quoteMeta}>{item.author}</Text>
      <Text style={styles.quoteMark}>{item.reactionSummary.myReaction ? '🙂' : '·'}</Text>
    </View>
  );
}

function GridCard({ item }: { item: HomeCardItem }) {
  return (
    <View style={styles.gridCard}>
      <Text style={styles.gridTitle} numberOfLines={1}>{item.bookTitle}</Text>
      <Text style={styles.gridPage}>P.{item.pageNumber}</Text>
      <Text style={styles.gridQuote} numberOfLines={3}>{item.quoteText}</Text>
    </View>
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
  roundButtonText: { color: '#fff', fontSize: 13, marginTop: -1 },
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
  centerStateWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  stateText: { color: '#7c7468', fontSize: 13 },
  retryButton: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#c8beaf',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f4efe7',
  },
  retryButtonText: { color: '#5f564b', fontWeight: '600', fontSize: 13 },
  quoteCard: {
    backgroundColor: '#f9f6f0',
    borderWidth: 1,
    borderColor: '#ece4d9',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  quoteTitle: { fontSize: 13, color: '#3f3830', fontWeight: '700', marginBottom: 6 },
  quoteText: { fontSize: 13, color: '#322d27', lineHeight: 19, marginBottom: 9 },
  quoteMeta: { fontSize: 10, color: '#8b8173' },
  quoteMark: { position: 'absolute', right: 10, bottom: 8, color: '#e6b545', fontSize: 11 },
  gridWrap: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 10 },
  gridCard: {
    width: '48.5%',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ece4d8',
    backgroundColor: '#f7f3ec',
    padding: 10,
    minHeight: 126,
  },
  gridTitle: { color: '#3f3830', fontWeight: '700', fontSize: 12, marginBottom: 4 },
  gridPage: { color: '#8b8173', fontSize: 10, marginBottom: 8 },
  gridQuote: { color: '#322d27', fontSize: 12, lineHeight: 18 },
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
