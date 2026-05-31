import React, { useMemo, useState } from 'react';
import {
  Modal,
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
import { HomeTabKey } from '../../app/types';
import { useHomeCards } from './hooks/useHomeCards';
import { useSearchHomeCards } from './hooks/useSearchHomeCards';
import { useHomeCardsFilter } from './hooks/useHomeCardsFilter';
import { useHomeCardDetail } from './hooks/useHomeCardDetail';
import { useReactionEmojis } from './hooks/useReactionEmojis';
import { useCardReaction } from './hooks/useCardReaction';
import { HomeCardEmojiType, HomeCardItem, HomeCardSort, HomeCardView } from './model/home.types';
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
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [selectedEmojiType, setSelectedEmojiType] = useState<HomeCardEmojiType | undefined>(undefined);
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [reactionPickerCardId, setReactionPickerCardId] = useState<number | null>(null);

  const viewMode: HomeCardView = useMemo(() => {
    if (tab === 'folder') return 'grid';
    return 'list';
  }, [tab]);
  const sort: HomeCardSort = useMemo(() => (tab === 'emotion' ? 'MOST_REACTED' : 'LATEST'), [tab]);
  const trimmedKeyword = searchKeyword.trim();
  const isSearchMode = trimmedKeyword.length > 0;

  const homeCardsQuery = useHomeCards({
    view: 'list',
    size: 20,
    sort: 'LATEST',
  });
  const homeFilterQuery = useHomeCardsFilter(
    {
      view: viewMode,
      size: 20,
      sort,
      category: tab === 'book' ? 'BOOK' : tab === 'folder' ? 'ALL' : tab === 'emotion' ? 'ALL' : undefined,
      emojiType: tab === 'emotion' ? selectedEmojiType : undefined,
    },
    !isSearchMode && tab !== 'all',
  );
  const homeSearchQuery = useSearchHomeCards(
    {
      q: trimmedKeyword,
      view: 'list',
      size: 20,
      sort,
    },
    isSearchMode,
  );
  const homeCardDetailQuery = useHomeCardDetail(selectedCardId);
  const reactionEmojisQuery = useReactionEmojis(tab === 'emotion' || selectedCardId !== null || reactionPickerCardId !== null);
  const cardReactionMutation = useCardReaction();

  const activeQuery = isSearchMode ? homeSearchQuery : tab === 'all' ? homeCardsQuery : homeFilterQuery;

  const displayName = nickname.trim() ? nickname : 'User';
  const list = activeQuery.data?.items ?? [];

  const handleReact = (cardId: number, emojiType: HomeCardEmojiType) => {
    cardReactionMutation.mutate(
      { cardId, emojiType },
      {
        onSuccess: () => {
          void activeQuery.refetch();
          if (selectedCardId === cardId) {
            void homeCardDetailQuery.refetch();
          }
        },
      },
    );
  };

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
            <TextInput
              style={styles.searchInput}
              placeholder="키워드를 검색하세요"
              placeholderTextColor="#9f968a"
              value={searchKeyword}
              onChangeText={setSearchKeyword}
            />
          </View>
          <View style={styles.roundButton}>
            <Text style={styles.roundButtonText}>나</Text>
          </View>
        </View>

        <View style={styles.homeTabRow}>
          <HomeTabButton label="전체" active={tab === 'all'} onPress={() => onChangeTab('all')} />
          <HomeTabButton label="도서별" active={tab === 'book'} onPress={() => onChangeTab('book')} />
          <HomeTabButton label="폴더별" active={tab === 'folder'} onPress={() => onChangeTab('folder')} />
          <HomeTabButton label="감정별" active={tab === 'emotion'} onPress={() => onChangeTab('emotion')} />
        </View>

        {tab === 'emotion' ? (
          <View style={styles.emojiChipRow}>
            {(reactionEmojisQuery.data ?? []).map((chip) => (
              <TouchableOpacity
                key={chip.emojiType}
                onPress={() => setSelectedEmojiType((prev) => (prev === chip.emojiType ? undefined : chip.emojiType))}
                style={[styles.emojiChip, selectedEmojiType === chip.emojiType && styles.emojiChipActive]}
              >
                <Text style={styles.emojiChipText}>{emojiTypeToIcon(chip.emojiType)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}

        {activeQuery.isLoading ? (
          <View style={styles.centerStateWrap}>
            <Text style={styles.stateText}>{isSearchMode ? '검색 결과를 불러오는 중...' : '카드를 불러오는 중...'}</Text>
          </View>
        ) : null}

        {!activeQuery.isLoading && activeQuery.isError ? (
          <View style={styles.centerStateWrap}>
            <Text style={styles.stateText}>{toUserMessage(activeQuery.error)}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => void activeQuery.refetch()}>
              <Text style={styles.retryButtonText}>다시 시도</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {!activeQuery.isLoading && !activeQuery.isError && list.length === 0 ? (
          <View style={styles.centerStateWrap}>
            <Text style={styles.stateText}>{isSearchMode ? '검색 결과가 없어요.' : '표시할 카드가 아직 없어요.'}</Text>
          </View>
        ) : null}

        {!activeQuery.isLoading && !activeQuery.isError && list.length > 0 ? (
          (isSearchMode ? 'list' : viewMode) === 'list' ? (
            <ScrollView style={styles.homeList} showsVerticalScrollIndicator={false}>
              {list.map((item) => (
                <ListCard
                  key={item.cardId}
                  item={item}
                  onPress={() => setSelectedCardId(item.cardId)}
                  onLongPress={() => setReactionPickerCardId(item.cardId)}
                />
              ))}
            </ScrollView>
          ) : (
            <ScrollView style={styles.homeList} showsVerticalScrollIndicator={false} contentContainerStyle={styles.gridWrap}>
              {list.map((item) => (
                <GridCard
                  key={item.cardId}
                  item={item}
                  onPress={() => setSelectedCardId(item.cardId)}
                  onLongPress={() => setReactionPickerCardId(item.cardId)}
                />
              ))}
            </ScrollView>
          )
        ) : null}

        <Modal visible={selectedCardId !== null} transparent animationType="fade" onRequestClose={() => setSelectedCardId(null)}>
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              {homeCardDetailQuery.isLoading ? <Text style={styles.stateText}>상세 정보를 불러오는 중...</Text> : null}
              {!homeCardDetailQuery.isLoading && homeCardDetailQuery.isError ? (
                <>
                  <Text style={styles.stateText}>{toUserMessage(homeCardDetailQuery.error)}</Text>
                  <TouchableOpacity style={styles.retryButton} onPress={() => void homeCardDetailQuery.refetch()}>
                    <Text style={styles.retryButtonText}>다시 시도</Text>
                  </TouchableOpacity>
                </>
              ) : null}
              {!homeCardDetailQuery.isLoading && !homeCardDetailQuery.isError && homeCardDetailQuery.data ? (
                <>
                  <Text style={styles.detailTitle}>
                    {homeCardDetailQuery.data.bookTitle} · P.{homeCardDetailQuery.data.pageNumber}
                  </Text>
                  <Text style={styles.detailQuote}>{homeCardDetailQuery.data.quoteText}</Text>
                  <Text style={styles.detailMeta}>저자: {homeCardDetailQuery.data.author}</Text>
                  <Text style={styles.detailMeta}>
                    폴더: {homeCardDetailQuery.data.folder ? homeCardDetailQuery.data.folder.folderName : '없음'}
                  </Text>
                  <Text style={styles.detailMeta}>메모: {homeCardDetailQuery.data.memo ?? '없음'}</Text>
                  <Text style={styles.detailMeta}>수정: {homeCardDetailQuery.data.updatedAt}</Text>
                  <View style={styles.detailReactionRow}>
                    {(reactionEmojisQuery.data ?? []).map((chip) => (
                      <TouchableOpacity
                        key={`detail-${chip.emojiType}`}
                        style={styles.detailReactionChip}
                        onPress={() => {
                          if (!selectedCardId) return;
                          handleReact(selectedCardId, chip.emojiType);
                        }}
                      >
                        <Text style={styles.detailReactionChipText}>{emojiTypeToIcon(chip.emojiType)}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              ) : null}
              <TouchableOpacity style={styles.modalCloseButton} onPress={() => setSelectedCardId(null)}>
                <Text style={styles.modalCloseButtonText}>닫기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal visible={reactionPickerCardId !== null} transparent animationType="fade" onRequestClose={() => setReactionPickerCardId(null)}>
          <View style={styles.reactionPickerBackdrop}>
            <View style={styles.reactionPickerCard}>
              <Text style={styles.reactionPickerTitle}>반응 선택</Text>
              <View style={styles.reactionPickerRow}>
                {(reactionEmojisQuery.data ?? []).map((chip) => (
                  <TouchableOpacity
                    key={`picker-${chip.emojiType}`}
                    style={styles.reactionPickerChip}
                    onPress={() => {
                      if (!reactionPickerCardId) return;
                      handleReact(reactionPickerCardId, chip.emojiType);
                      setReactionPickerCardId(null);
                    }}
                  >
                    <Text style={styles.reactionPickerChipText}>{emojiTypeToIcon(chip.emojiType)}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity style={styles.modalCloseButton} onPress={() => setReactionPickerCardId(null)}>
                <Text style={styles.modalCloseButtonText}>닫기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

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

function ListCard({ item, onPress, onLongPress }: { item: HomeCardItem; onPress: () => void; onLongPress: () => void }) {
  return (
    <Pressable style={styles.quoteCard} onPress={onPress} onLongPress={onLongPress}>
      <Text style={styles.quoteTitle}>{item.bookTitle} · P.{item.pageNumber}</Text>
      <Text style={styles.quoteText}>{item.quoteText}</Text>
      <Text style={styles.quoteMeta}>{item.author}</Text>
      <Text style={styles.quoteMark}>{item.reactionSummary.myReaction ? '🙂' : '·'}</Text>
    </Pressable>
  );
}

function GridCard({ item, onPress, onLongPress }: { item: HomeCardItem; onPress: () => void; onLongPress: () => void }) {
  return (
    <Pressable style={styles.gridCard} onPress={onPress} onLongPress={onLongPress}>
      <Text style={styles.gridTitle} numberOfLines={1}>{item.bookTitle}</Text>
      <Text style={styles.gridPage}>P.{item.pageNumber}</Text>
      <Text style={styles.gridQuote} numberOfLines={3}>{item.quoteText}</Text>
    </Pressable>
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
  searchInput: { flex: 1, fontSize: 12, color: '#4a433a', paddingVertical: 0 },
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
  emojiChipRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  emojiChip: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: '#e4dbce',
    backgroundColor: '#f7f3ec',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiChipActive: { borderColor: '#8d7353', backgroundColor: '#f3ece1' },
  emojiChipText: { fontSize: 16 },
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(32, 26, 20, 0.45)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    backgroundColor: '#f9f6f0',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e8dfd2',
    padding: 16,
    gap: 6,
  },
  detailTitle: { fontSize: 16, fontWeight: '700', color: '#2f2a24', marginBottom: 4 },
  detailQuote: { fontSize: 14, lineHeight: 22, color: '#322d27', marginBottom: 6 },
  detailMeta: { fontSize: 12, color: '#756b5f' },
  detailReactionRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  detailReactionChip: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#d9d0c2',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f4efe7',
  },
  detailReactionChipText: { fontSize: 16 },
  modalCloseButton: {
    marginTop: 10,
    alignSelf: 'flex-end',
    backgroundColor: '#8d7353',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  modalCloseButtonText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  reactionPickerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(32, 26, 20, 0.38)',
    justifyContent: 'flex-end',
    padding: 20,
  },
  reactionPickerCard: {
    backgroundColor: '#f9f6f0',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e8dfd2',
    padding: 14,
  },
  reactionPickerTitle: { fontSize: 14, color: '#2f2a24', fontWeight: '700', marginBottom: 10 },
  reactionPickerRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  reactionPickerChip: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: '#d9d0c2',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f4efe7',
  },
  reactionPickerChipText: { fontSize: 17 },
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

function emojiTypeToIcon(type: HomeCardEmojiType): string {
  if (type === 'SMILE') return '😊';
  if (type === 'HEART') return '😍';
  if (type === 'THINKING') return '🤔';
  if (type === 'FIRE') return '🔥';
  if (type === 'CLAP') return '👏';
  return '🙂';
}
