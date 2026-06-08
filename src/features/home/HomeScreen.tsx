import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  ActivityIndicator,
  Keyboard,
  Image,
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
import { useHomeFolders } from './hooks/useHomeFolders';
import { useHomeCreateFolder } from './hooks/useHomeCreateFolder';
import { useHomeDeleteFolder } from './hooks/useHomeDeleteFolder';
import { HomeCardEmojiType, HomeCardItem, HomeCardSort, HomeCardView } from './model/home.types';
import { toUserMessage } from '../../shared/utils/apiError';
import { API_BASE_URL } from '../../shared/constants/api';
import { BottomNav } from '../../shared/ui/BottomNav';
import { FeedTopBar } from '../../shared/ui/FeedTopBar';
import { formatChatMessageAt } from '../../shared/utils/formatChatMessageAt';

type Props = {
  nickname: string;
  tab: HomeTabKey;
  onChangeTab: (tab: HomeTabKey) => void;
  onPressRegister: () => void;
  onPressCommunity: () => void;
  onPressAiChat: () => void;
  onPressMyPage: () => void;
  showBottomNav?: boolean;
  onPressGenerateQuestions?: (quote: {
    quoteId: number;
    bookTitle: string;
    author: string;
    pageNumber: number;
    quoteText: string;
  }) => void;
};

export function HomeScreen({
  nickname,
  tab,
  onChangeTab,
  onPressRegister,
  onPressCommunity,
  onPressAiChat,
  onPressMyPage,
  showBottomNav = true,
  onPressGenerateQuestions,
}: Props) {
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [selectedEmojiType, setSelectedEmojiType] = useState<HomeCardEmojiType | undefined>(undefined);
  const [selectedFolderId, setSelectedFolderId] = useState<number | undefined>(undefined);
  const [selectedBookId, setSelectedBookId] = useState<number | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [reactionPickerCardId, setReactionPickerCardId] = useState<number | null>(null);
  const [selectedCardReactionOverride, setSelectedCardReactionOverride] = useState<HomeCardEmojiType | null>(null);
  const [isFolderManageVisible, setIsFolderManageVisible] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [folderFormError, setFolderFormError] = useState<string | null>(null);

  const viewMode: HomeCardView = useMemo(() => {
    if (tab === 'folder') return 'grid';
    return 'list';
  }, [tab]);
  const sort: HomeCardSort = useMemo(() => (tab === 'emotion' ? 'MOST_REACTED' : 'LATEST'), [tab]);
  const trimmedKeyword = searchKeyword.trim();
  const isSearchMode = trimmedKeyword.length > 0;
  const isEmotionFallbackMode = tab === 'emotion' && typeof selectedEmojiType === 'undefined';

  const homeCardsQuery = useHomeCards({
    view: 'list',
    size: 20,
    sort: 'LATEST',
  });
  const homeUnfilteredTabQuery = useHomeCards({
    view: viewMode,
    size: 20,
    sort,
    enabled: !isSearchMode && isEmotionFallbackMode,
  });
  const homeFilterQuery = useHomeCardsFilter(
    {
      view: viewMode,
      size: 20,
      sort,
      category: tab === 'book' ? 'BOOK' : undefined,
      emojiType: tab === 'emotion' ? selectedEmojiType : undefined,
      folderId: tab === 'folder' ? selectedFolderId : undefined,
    },
    !isSearchMode &&
      tab !== 'all' &&
      tab !== 'book' &&
      !isEmotionFallbackMode &&
      (tab !== 'folder' || typeof selectedFolderId === 'number'),
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
  const homeFoldersQuery = useHomeFolders({ includeQuoteCount: true }, tab === 'folder' || isFolderManageVisible);
  const homeCreateFolderMutation = useHomeCreateFolder();
  const homeDeleteFolderMutation = useHomeDeleteFolder();

  useEffect(() => {
    setSelectedCardReactionOverride(null);
  }, [selectedCardId]);

  useEffect(() => {
    setSelectedCardReactionOverride(homeCardDetailQuery.data?.reactionSummary.myReaction ?? null);
  }, [homeCardDetailQuery.data?.reactionSummary.myReaction]);

  const activeQuery = isSearchMode
    ? homeSearchQuery
    : tab === 'all' || tab === 'book'
      ? homeCardsQuery
      : isEmotionFallbackMode
        ? homeUnfilteredTabQuery
        : homeFilterQuery;

  const list = activeQuery.data?.items ?? [];
  const bookShelfItems = useMemo(() => {
    const items = homeCardsQuery.data?.items ?? [];
    const grouped = new Map<
      number,
      {
        bookId: number;
        bookTitle: string;
        author: string;
        coverImageUrl: string;
        latestCreatedAt: string;
        items: HomeCardItem[];
      }
    >();

    items.forEach((item) => {
      const current = grouped.get(item.bookId);
      if (current) {
        current.items.push(item);
        if (item.createdAt > current.latestCreatedAt) {
          current.latestCreatedAt = item.createdAt;
          current.bookTitle = item.bookTitle;
          current.author = item.author;
          current.coverImageUrl = item.coverImageUrl;
        }
        return;
      }

      grouped.set(item.bookId, {
        bookId: item.bookId,
        bookTitle: item.bookTitle,
        author: item.author,
        coverImageUrl: item.coverImageUrl,
        latestCreatedAt: item.createdAt,
        items: [item],
      });
    });

    return Array.from(grouped.values()).sort((a, b) => b.latestCreatedAt.localeCompare(a.latestCreatedAt));
  }, [homeCardsQuery.data?.items]);
  const selectedBook = useMemo(
    () => bookShelfItems.find((book) => book.bookId === selectedBookId) ?? null,
    [bookShelfItems, selectedBookId],
  );
  const selectedBookCards = useMemo(() => {
    if (selectedBookId === null) {
      return [];
    }

    return (homeCardsQuery.data?.items ?? [])
      .filter((item) => item.bookId === selectedBookId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [homeCardsQuery.data?.items, selectedBookId]);

  useEffect(() => {
    if (tab !== 'folder') {
      return;
    }

    const folders = homeFoldersQuery.data ?? [];

    if (folders.length === 0) {
      if (typeof selectedFolderId !== 'undefined') {
        setSelectedFolderId(undefined);
      }
      return;
    }

    const hasSelectedFolder = typeof selectedFolderId === 'number' && folders.some((folder) => folder.folderId === selectedFolderId);
    if (!hasSelectedFolder) {
      setSelectedFolderId(folders[0].folderId);
    }
  }, [homeFoldersQuery.data, selectedFolderId, tab]);

  useEffect(() => {
    if (tab !== 'book') {
      setSelectedBookId(null);
    }
  }, [tab]);

  useEffect(() => {
    if (tab !== 'book' || selectedBookId === null) {
      return;
    }

    const hasSelectedBook = bookShelfItems.some((book) => book.bookId === selectedBookId);
    if (!hasSelectedBook) {
      setSelectedBookId(null);
    }
  }, [bookShelfItems, selectedBookId, tab]);

  const handleReact = (cardId: number, emojiType: HomeCardEmojiType) => {
    cardReactionMutation.mutate(
      { cardId, emojiType },
      {
        onSuccess: (result) => {
          if (selectedCardId === cardId) {
            setSelectedCardReactionOverride(result.myReaction);
          }
          void activeQuery.refetch();
          if (selectedCardId === cardId) {
            void homeCardDetailQuery.refetch();
          }
        },
      },
    );
  };

  const handleCreateFolder = () => {
    const trimmed = newFolderName.trim();
    if (!trimmed) {
      setFolderFormError('폴더 이름을 입력해주세요.');
      return;
    }
    if (trimmed.length > 20) {
      setFolderFormError('폴더 이름은 20자 이하로 입력해주세요.');
      return;
    }

    setFolderFormError(null);
    Keyboard.dismiss();
    homeCreateFolderMutation.mutate(
      { folderName: trimmed },
      {
        onSuccess: () => {
          setNewFolderName('');
          void homeFoldersQuery.refetch();
        },
      },
    );
  };

  const handleDeleteFolder = (folderId: number) => {
    Alert.alert('정말 삭제하시겠습니까?', '폴더 안의 문장이 있다면 먼저 이동하거나 삭제해야 합니다.', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => {
          setFolderFormError(null);
          homeDeleteFolderMutation.mutate(
            { folderId },
            {
              onSuccess: () => {
                void homeFoldersQuery.refetch();
              },
            },
          );
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.homeSafeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.homeContainer}>
        <FeedTopBar searchKeyword={searchKeyword} onSearchKeywordChange={setSearchKeyword} onPressMyPage={onPressMyPage}>
          <View style={styles.homeTabRow}>
            <HomeTabButton label="전체" active={tab === 'all'} onPress={() => onChangeTab('all')} />
            <HomeTabButton label="도서별" active={tab === 'book'} onPress={() => onChangeTab('book')} />
            <HomeTabButton label="폴더별" active={tab === 'folder'} onPress={() => onChangeTab('folder')} />
            <HomeTabButton label="감정별" active={tab === 'emotion'} onPress={() => onChangeTab('emotion')} />
          </View>

          {tab === 'folder' ? (
            <View style={styles.folderControlRow}>
              {homeFoldersQuery.isLoading ? <Text style={styles.inlineInfoText}>폴더를 불러오는 중...</Text> : null}
              {homeFoldersQuery.isError ? (
                <View style={styles.inlineRow}>
                  <Text style={styles.inlineErrorText}>폴더를 불러오지 못했어요.</Text>
                  <TouchableOpacity style={styles.inlineRetryButton} onPress={() => void homeFoldersQuery.refetch()}>
                    <Text style={styles.inlineRetryText}>재시도</Text>
                  </TouchableOpacity>
                </View>
              ) : null}
              {!homeFoldersQuery.isLoading && !homeFoldersQuery.isError && (homeFoldersQuery.data ?? []).length > 0 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.folderChipRow} style={styles.folderChipScroll}>
                  {(homeFoldersQuery.data ?? []).map((folder) => (
                    <TouchableOpacity
                      key={`folder-chip-${folder.folderId}`}
                      onPress={() => setSelectedFolderId(folder.folderId)}
                      style={[styles.folderChip, selectedFolderId === folder.folderId && styles.folderChipActive]}
                    >
                      <Text
                        style={[
                          styles.folderChipText,
                          selectedFolderId === folder.folderId && styles.folderChipTextActive,
                        ]}
                      >
                        {folder.folderName}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              ) : null}
              <TouchableOpacity style={styles.folderManageButton} onPress={() => setIsFolderManageVisible(true)}>
                <Text style={styles.folderManageButtonText}>폴더 관리</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {tab === 'emotion' ? (
            <>
              {reactionEmojisQuery.isLoading ? <Text style={styles.inlineInfoText}>이모지를 불러오는 중...</Text> : null}
              {reactionEmojisQuery.isError ? (
                <View style={styles.inlineRow}>
                  <Text style={styles.inlineErrorText}>이모지를 불러오지 못했어요.</Text>
                  <TouchableOpacity style={styles.inlineRetryButton} onPress={() => void reactionEmojisQuery.refetch()}>
                    <Text style={styles.inlineRetryText}>재시도</Text>
                  </TouchableOpacity>
                </View>
              ) : null}
              {!reactionEmojisQuery.isLoading && !reactionEmojisQuery.isError ? (
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
            </>
          ) : null}
        </FeedTopBar>

        <View style={styles.homeContent}>
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

          {!activeQuery.isLoading && !activeQuery.isError && tab === 'folder' && !homeFoldersQuery.isLoading && !homeFoldersQuery.isError && (homeFoldersQuery.data ?? []).length === 0 ? (
            <View style={styles.centerStateWrap}>
              <Text style={styles.stateText}>등록된 폴더가 없어요. 폴더를 먼저 만들어주세요.</Text>
            </View>
          ) : null}

          {!activeQuery.isLoading &&
          !activeQuery.isError &&
          tab === 'book' &&
          !isSearchMode &&
          selectedBookId === null &&
          bookShelfItems.length > 0 ? (
            <View style={styles.bookShelfSection}>
              <ScrollView style={styles.homeList} showsVerticalScrollIndicator={false} contentContainerStyle={styles.bookShelfGrid}>
                {bookShelfItems.map((book) => (
                  <BookShelfCard key={book.bookId} item={book} onPress={() => setSelectedBookId(book.bookId)} />
                ))}
              </ScrollView>
            </View>
          ) : null}

          {!activeQuery.isLoading &&
          !activeQuery.isError &&
          tab === 'book' &&
          !isSearchMode &&
          selectedBookId !== null &&
          selectedBook ? (
            <View style={styles.bookSentenceSection}>
              <View style={styles.bookSentenceHeader}>
                <TouchableOpacity style={styles.bookSentenceBackButton} onPress={() => setSelectedBookId(null)}>
                  <Text style={styles.bookSentenceBackText}>← 책 표지</Text>
                </TouchableOpacity>
                <View style={styles.bookSentenceMeta}>
                  <Text style={styles.bookSentenceTitle}>{selectedBook.bookTitle}</Text>
                  <Text style={styles.bookSentenceAuthor}>{selectedBook.author}</Text>
                </View>
              </View>
              <ScrollView style={styles.homeList} showsVerticalScrollIndicator={false}>
                {selectedBookCards.map((item) => (
                  <ListCard
                    key={item.cardId}
                    item={item}
                    onPress={() => setSelectedCardId(item.cardId)}
                    onLongPress={() => setReactionPickerCardId(item.cardId)}
                  />
                ))}
              </ScrollView>
            </View>
          ) : null}

          {!activeQuery.isLoading &&
          !activeQuery.isError &&
          tab === 'book' &&
          !isSearchMode &&
          selectedBookId === null &&
          bookShelfItems.length === 0 ? (
            <View style={styles.centerStateWrap}>
              <Text style={styles.stateText}>저장된 책이 아직 없어요.</Text>
            </View>
          ) : null}

          {!activeQuery.isLoading &&
          !activeQuery.isError &&
          tab === 'book' &&
          !isSearchMode &&
          selectedBookId !== null &&
          selectedBookCards.length === 0 ? (
            <View style={styles.centerStateWrap}>
              <Text style={styles.stateText}>이 책에 저장된 문장이 아직 없어요.</Text>
              <TouchableOpacity style={styles.retryButton} onPress={() => setSelectedBookId(null)}>
                <Text style={styles.retryButtonText}>책 목록으로</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {!activeQuery.isLoading &&
          !activeQuery.isError &&
          list.length === 0 &&
          !(tab === 'folder' && !homeFoldersQuery.isLoading && !homeFoldersQuery.isError && (homeFoldersQuery.data ?? []).length === 0) ? (
            <View style={styles.centerStateWrap}>
              <Text style={styles.stateText}>{isSearchMode ? '검색 결과가 없어요.' : '표시할 카드가 아직 없어요.'}</Text>
            </View>
          ) : null}

          {!activeQuery.isLoading && !activeQuery.isError && list.length > 0 && !(tab === 'book' && !isSearchMode) ? (
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
        </View>

        <Modal visible={selectedCardId !== null} transparent animationType="fade" onRequestClose={() => setSelectedCardId(null)}>
          <Pressable style={styles.modalBackdrop} onPress={() => setSelectedCardId(null)}>
            <View style={styles.modalSheetWrap}>
              <Pressable style={styles.modalCard} onPress={() => undefined}>
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
                  <Text style={styles.detailMeta}>
                    수정: {formatChatMessageAt(homeCardDetailQuery.data.updatedAt) || homeCardDetailQuery.data.updatedAt}
                  </Text>
                  {onPressGenerateQuestions ? (
                    <TouchableOpacity
                      style={styles.questionButton}
                      onPress={() =>
                        onPressGenerateQuestions({
                          quoteId: homeCardDetailQuery.data.quoteId,
                          bookTitle: homeCardDetailQuery.data.bookTitle,
                          author: homeCardDetailQuery.data.author,
                          pageNumber: homeCardDetailQuery.data.pageNumber,
                          quoteText: homeCardDetailQuery.data.quoteText,
                        })
                      }
                    >
                      <Text style={styles.questionButtonText}>AI 질문 생성하기</Text>
                    </TouchableOpacity>
                  ) : null}
                  {reactionEmojisQuery.isLoading ? <Text style={styles.inlineInfoText}>이모지 로딩 중...</Text> : null}
                  {reactionEmojisQuery.isError ? (
                    <View style={styles.inlineRow}>
                      <Text style={styles.inlineErrorText}>이모지를 불러오지 못했어요.</Text>
                      <TouchableOpacity style={styles.inlineRetryButton} onPress={() => void reactionEmojisQuery.refetch()}>
                        <Text style={styles.inlineRetryText}>재시도</Text>
                      </TouchableOpacity>
                    </View>
                  ) : null}
                  {!reactionEmojisQuery.isLoading && !reactionEmojisQuery.isError ? (
                    <View style={styles.detailReactionRow}>
                      {(reactionEmojisQuery.data ?? []).map((chip) => (
                        <TouchableOpacity
                          key={`detail-${chip.emojiType}`}
                          style={[
                            styles.detailReactionChip,
                            (selectedCardReactionOverride ?? homeCardDetailQuery.data.reactionSummary.myReaction) === chip.emojiType &&
                              styles.detailReactionChipActive,
                          ]}
                          onPress={() => {
                            if (!selectedCardId) return;
                            handleReact(selectedCardId, chip.emojiType);
                          }}
                        >
                          <Text
                            style={[
                              styles.detailReactionChipText,
                              (selectedCardReactionOverride ?? homeCardDetailQuery.data.reactionSummary.myReaction) === chip.emojiType &&
                                styles.detailReactionChipTextActive,
                            ]}
                          >
                            {emojiTypeToIcon(chip.emojiType)}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  ) : null}
                </>
              ) : null}
              <TouchableOpacity style={styles.modalCloseButton} onPress={() => setSelectedCardId(null)}>
                <Text style={styles.modalCloseButtonText}>닫기</Text>
              </TouchableOpacity>
              </Pressable>
            </View>
          </Pressable>
        </Modal>

        <Modal visible={reactionPickerCardId !== null} transparent animationType="fade" onRequestClose={() => setReactionPickerCardId(null)}>
          <View style={styles.reactionPickerBackdrop}>
            <View style={styles.reactionPickerCard}>
              <Text style={styles.reactionPickerTitle}>반응 선택</Text>
              {reactionEmojisQuery.isLoading ? <Text style={styles.inlineInfoText}>이모지 로딩 중...</Text> : null}
              {reactionEmojisQuery.isError ? (
                <View style={styles.inlineRow}>
                  <Text style={styles.inlineErrorText}>이모지를 불러오지 못했어요.</Text>
                  <TouchableOpacity style={styles.inlineRetryButton} onPress={() => void reactionEmojisQuery.refetch()}>
                    <Text style={styles.inlineRetryText}>재시도</Text>
                  </TouchableOpacity>
                </View>
              ) : null}
              {!reactionEmojisQuery.isLoading && !reactionEmojisQuery.isError ? (
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
              ) : null}
              <TouchableOpacity style={styles.modalCloseButton} onPress={() => setReactionPickerCardId(null)}>
                <Text style={styles.modalCloseButtonText}>닫기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal visible={isFolderManageVisible} transparent animationType="fade" onRequestClose={() => setIsFolderManageVisible(false)}>
          <Pressable style={styles.modalBackdrop} onPress={() => setIsFolderManageVisible(false)}>
            <View style={styles.modalSheetWrap}>
              <Pressable style={styles.modalCard} onPress={() => undefined}>
              <Text style={styles.detailTitle}>폴더 관리</Text>
              <View style={styles.folderCreateRow}>
                <TextInput
                  style={styles.folderCreateInput}
                  value={newFolderName}
                  onChangeText={setNewFolderName}
                  placeholder="새 폴더 이름 (최대 20자)"
                  placeholderTextColor="#9f968a"
                  maxLength={20}
                />
                <TouchableOpacity
                  style={styles.folderCreateButton}
                  onPress={handleCreateFolder}
                  disabled={homeCreateFolderMutation.isPending}
                >
                  {homeCreateFolderMutation.isPending ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.folderCreateButtonText}>생성</Text>
                  )}
                </TouchableOpacity>
              </View>
              {folderFormError ? <Text style={styles.inlineErrorText}>{folderFormError}</Text> : null}
              {homeCreateFolderMutation.isError ? (
                <Text style={styles.inlineErrorText}>{toUserMessage(homeCreateFolderMutation.error)}</Text>
              ) : null}
              {homeDeleteFolderMutation.isError ? (
                <Text style={styles.inlineErrorText}>{toUserMessage(homeDeleteFolderMutation.error)}</Text>
              ) : null}

              {homeFoldersQuery.isLoading ? <Text style={styles.inlineInfoText}>폴더를 불러오는 중...</Text> : null}
              {homeFoldersQuery.isError ? (
                <View style={styles.inlineRow}>
                  <Text style={styles.inlineErrorText}>폴더를 불러오지 못했어요.</Text>
                  <TouchableOpacity style={styles.inlineRetryButton} onPress={() => void homeFoldersQuery.refetch()}>
                    <Text style={styles.inlineRetryText}>재시도</Text>
                  </TouchableOpacity>
                </View>
              ) : null}
              {!homeFoldersQuery.isLoading && !homeFoldersQuery.isError && (homeFoldersQuery.data ?? []).length === 0 ? (
                <Text style={styles.inlineInfoText}>등록된 폴더가 없어요.</Text>
              ) : null}
              {!homeFoldersQuery.isLoading && !homeFoldersQuery.isError ? (
                <ScrollView style={styles.folderListWrap}>
                  {(homeFoldersQuery.data ?? []).map((folder) => (
                    <View key={`folder-manage-${folder.folderId}`} style={styles.folderListItem}>
                      <View style={styles.folderListTextWrap}>
                        <Text style={styles.folderListName}>{folder.folderName}</Text>
                        <Text style={styles.folderListMeta}>문장 {folder.quoteCount}개</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.folderDeleteButton}
                        disabled={homeDeleteFolderMutation.isPending}
                        onPress={() => handleDeleteFolder(folder.folderId)}
                      >
                        <Text style={styles.folderDeleteButtonText}>삭제</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              ) : null}

              <TouchableOpacity style={styles.modalCloseButton} onPress={() => setIsFolderManageVisible(false)}>
                <Text style={styles.modalCloseButtonText}>닫기</Text>
              </TouchableOpacity>
              </Pressable>
            </View>
          </Pressable>
        </Modal>

        <Pressable style={styles.floatingButton} onPress={onPressRegister}>
          <Text style={styles.floatingButtonText}>＋</Text>
        </Pressable>

        {showBottomNav ? (
          <BottomNav active="home" onPressCommunity={onPressCommunity} onPressHome={() => {}} onPressAiChat={onPressAiChat} />
        ) : null}
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
      <Text style={styles.quoteMark}>
        {item.reactionSummary.myReaction ? emojiTypeToIcon(item.reactionSummary.myReaction) : '·'}
      </Text>
    </Pressable>
  );
}

function GridCard({ item, onPress, onLongPress }: { item: HomeCardItem; onPress: () => void; onLongPress: () => void }) {
  return (
    <Pressable style={styles.gridCard} onPress={onPress} onLongPress={onLongPress}>
      <Text style={styles.gridTitle} numberOfLines={1}>{item.bookTitle}</Text>
      <Text style={styles.gridPage}>P.{item.pageNumber}</Text>
      <Text style={styles.gridQuote} numberOfLines={3}>{item.quoteText}</Text>
      <Text style={styles.gridReactionMark}>
        {item.reactionSummary.myReaction ? emojiTypeToIcon(item.reactionSummary.myReaction) : '·'}
      </Text>
    </Pressable>
  );
}

function BookShelfCard({
  item,
  onPress,
}: {
  item: {
    bookId: number;
    bookTitle: string;
    author: string;
    coverImageUrl: string;
    items: HomeCardItem[];
  };
  onPress: () => void;
}) {
  const [hasImageError, setHasImageError] = useState(false);
  const resolvedCoverImageUrl = resolveRemoteImageUrl(item.coverImageUrl);

  return (
    <Pressable style={styles.bookShelfCard} onPress={onPress}>
      <View style={styles.bookShelfCover}>
        {!hasImageError && resolvedCoverImageUrl ? (
          <Image
            source={{ uri: resolvedCoverImageUrl }}
            style={styles.bookShelfCoverImage}
            resizeMode="cover"
            onError={() => setHasImageError(true)}
          />
        ) : (
          <View style={styles.bookShelfCoverFallback}>
            <Text style={styles.bookShelfCoverFallbackLabel}>표지</Text>
          </View>
        )}
        <View style={styles.bookShelfCountChip}>
          <Text style={styles.bookShelfCountChipText}>{item.items.length}개</Text>
        </View>
      </View>
      <View style={styles.bookShelfBody}>
        <Text style={styles.bookShelfCardTitle} numberOfLines={1}>
          {item.bookTitle}
        </Text>
        <Text style={styles.bookShelfCardAuthor} numberOfLines={1}>
          {item.author}
        </Text>
      </View>
    </Pressable>
  );
}

function resolveRemoteImageUrl(url: string | null | undefined): string {
  if (typeof url !== 'string') {
    return '';
  }

  const trimmed = url.trim();
  if (!trimmed) {
    return '';
  }

  if (/^https?:\/\//i.test(trimmed) || /^data:/i.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith('//')) {
    return `https:${trimmed}`;
  }

  if (trimmed.startsWith('/')) {
    return `${API_BASE_URL}${trimmed}`;
  }

  return `${API_BASE_URL}/${trimmed}`;
}

const styles = StyleSheet.create({
  homeSafeArea: { flex: 1, backgroundColor: '#44c3f3' },
  homeContainer: { flex: 1, paddingHorizontal: 0, paddingTop: 8, paddingBottom: 0, backgroundColor: '#44c3f3' },
  topPanel: {
    backgroundColor: '#44c3f3',
    paddingTop: 6,
    paddingHorizontal: 14,
    paddingBottom: 10,
  },
  homeContent: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#d6d6d6',
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  brandTitle: {
    textAlign: 'center',
    color: '#111',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 0.2,
    marginBottom: 8,
  },
  homeSearchRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  searchPill: {
    flex: 1,
    minHeight: 40,
    borderRadius: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#0d0d0d',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIcon: { fontSize: 16, color: '#111', marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, color: '#141414', paddingVertical: 0 },
  homeTabRow: { flexDirection: 'row', gap: 6, marginBottom: 10 },
  homeTabButton: {
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#0d0d0d',
    backgroundColor: '#7fd0ee',
    paddingVertical: 8,
    paddingHorizontal: 10,
    flex: 1,
    alignItems: 'center',
  },
  homeTabButtonActive: { backgroundColor: '#0d0d0d', borderColor: '#0d0d0d' },
  homeTabText: { color: '#0d0d0d', fontSize: 12, fontWeight: '700' },
  homeTabTextActive: { color: '#44c3f3' },
  folderControlRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 10,
  },
  folderManageButton: {
    flexShrink: 0,
    borderWidth: 1,
    borderColor: '#0d0d0d',
    backgroundColor: '#44c3f3',
    borderRadius: 0,
    paddingHorizontal: 10,
    paddingVertical: 9,
    marginTop: 16,
  },
  folderManageButtonText: { color: '#0d0d0d', fontSize: 11, fontWeight: '800' },
  folderChipScroll: {
    flex: 1,
    minWidth: 0,
    marginTop: 16,
  },
  folderChipRow: { gap: 8, paddingBottom: 12 },
  folderChip: {
    minHeight: 34,
    paddingHorizontal: 14,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#0d0d0d',
    backgroundColor: '#7fd0ee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  folderChipActive: { backgroundColor: '#0d0d0d', borderColor: '#0d0d0d' },
  folderChipText: { color: '#0d0d0d', fontSize: 12, fontWeight: '700' },
  folderChipTextActive: { color: '#44c3f3' },
  inlineInfoText: { color: '#66707a', fontSize: 12, marginBottom: 8 },
  inlineRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  inlineErrorText: { color: '#b25555', fontSize: 12 },
  inlineRetryButton: {
    borderWidth: 1,
    borderColor: '#c8beaf',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#fff',
  },
  inlineRetryText: { color: '#5f564b', fontSize: 11, fontWeight: '600' },
  emojiChipRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  emojiChip: {
    width: 38,
    height: 38,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#0d0d0d',
    backgroundColor: '#7fd0ee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiChipActive: { borderColor: '#0d0d0d', backgroundColor: '#0d0d0d' },
  emojiChipText: { fontSize: 16 },
  homeList: { flex: 1 },
  centerStateWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  stateText: { color: '#66707a', fontSize: 13 },
  retryButton: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#dbe3ea',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  retryButtonText: { color: '#5f564b', fontWeight: '600', fontSize: 13 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(32, 26, 20, 0.45)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalSheetWrap: {
    width: '100%',
    alignItems: 'center',
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#dbe3ea',
    padding: 16,
    gap: 6,
  },
  detailTitle: { fontSize: 16, fontWeight: '700', color: '#111', marginBottom: 4 },
  detailQuote: { fontSize: 14, lineHeight: 22, color: '#111', marginBottom: 6 },
  detailMeta: { fontSize: 12, color: '#66707a' },
  questionButton: {
    marginTop: 12,
    height: 48,
    borderRadius: 0,
    backgroundColor: '#181614',
    alignItems: 'center',
    justifyContent: 'center',
  },
  questionButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '700',
  },
  detailReactionRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  detailReactionChip: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#dbe3ea',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  detailReactionChipActive: {
    backgroundColor: '#e6f9ff',
    borderColor: '#44c3f3',
  },
  detailReactionChipText: { fontSize: 16 },
  detailReactionChipTextActive: {
    transform: [{ scale: 1.08 }],
  },
  folderCreateRow: { flexDirection: 'row', gap: 8, marginTop: 8, marginBottom: 8, alignItems: 'center' },
  folderCreateInput: {
    flex: 1,
    minHeight: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dbe3ea',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    fontSize: 12,
    color: '#111',
  },
  folderCreateButton: {
    minWidth: 56,
    minHeight: 36,
    borderRadius: 0,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  folderCreateButtonText: { color: '#44c3f3', fontSize: 12, fontWeight: '700' },
  folderListWrap: { maxHeight: 220, marginTop: 8 },
  folderListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#dbe3ea',
  },
  folderListTextWrap: { flex: 1, paddingRight: 8 },
  folderListName: { color: '#111', fontSize: 13, fontWeight: '700' },
  folderListMeta: { color: '#66707a', fontSize: 11, marginTop: 2 },
  folderDeleteButton: {
    borderWidth: 1,
    borderColor: '#dbe3ea',
    backgroundColor: '#fff',
    borderRadius: 0,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  folderDeleteButtonText: { color: '#111', fontSize: 11, fontWeight: '700' },
  modalCloseButton: {
    marginTop: 10,
    alignSelf: 'flex-end',
    backgroundColor: '#111',
    borderRadius: 0,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  modalCloseButtonText: { color: '#44c3f3', fontWeight: '700', fontSize: 12 },
  reactionPickerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(32, 26, 20, 0.38)',
    justifyContent: 'flex-end',
    padding: 20,
  },
  reactionPickerCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#dbe3ea',
    padding: 14,
  },
  reactionPickerTitle: { fontSize: 14, color: '#111', fontWeight: '700', marginBottom: 10 },
  reactionPickerRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  reactionPickerChip: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: '#dbe3ea',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  reactionPickerChipText: { fontSize: 17 },
  quoteCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e8e8e8',
    borderRadius: 0,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  quoteTitle: { fontSize: 13, color: '#111', fontWeight: '700', marginBottom: 10 },
  quoteText: { fontSize: 14, color: '#111', lineHeight: 22, marginBottom: 12 },
  quoteMeta: { fontSize: 10, color: '#66707a' },
  quoteMark: { position: 'absolute', right: 12, bottom: 10, color: '#44c3f3', fontSize: 13 },
  gridWrap: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 10 },
  gridCard: {
    width: '48.5%',
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#e8e8e8',
    backgroundColor: '#fff',
    padding: 10,
    minHeight: 126,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  gridTitle: { color: '#111', fontWeight: '700', fontSize: 12, marginBottom: 4 },
  gridPage: { color: '#66707a', fontSize: 10, marginBottom: 8 },
  gridQuote: { color: '#111', fontSize: 12, lineHeight: 18 },
  gridReactionMark: { position: 'absolute', right: 10, bottom: 8, color: '#44c3f3', fontSize: 11 },
  bookShelfSection: { flex: 1 },
  bookShelfHint: { color: '#66707a', fontSize: 12, marginBottom: 10 },
  bookShelfGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12, paddingBottom: 12 },
  bookShelfCard: {
    width: '48.5%',
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#dbe3ea',
    backgroundColor: '#fff',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  bookShelfCover: {
    height: 180,
    backgroundColor: '#fff',
    position: 'relative',
  },
  bookShelfCoverImage: {
    width: '100%',
    height: '100%',
  },
  bookShelfCoverFallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  bookShelfCoverFallbackLabel: {
    color: '#66707a',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  bookShelfCountChip: {
    position: 'absolute',
    left: 8,
    bottom: 8,
    backgroundColor: 'rgba(20, 16, 11, 0.82)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  bookShelfCountChipText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  bookShelfBody: { paddingHorizontal: 10, paddingVertical: 9 },
  bookShelfCardTitle: { color: '#111', fontWeight: '700', fontSize: 12, marginBottom: 3 },
  bookShelfCardAuthor: { color: '#66707a', fontSize: 10 },
  bookSentenceSection: { flex: 1 },
  bookSentenceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
    paddingVertical: 4,
  },
  bookSentenceBackButton: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#dbe3ea',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  bookSentenceBackText: { color: '#111', fontSize: 11, fontWeight: '700' },
  bookSentenceMeta: { flex: 1 },
  bookSentenceTitle: { color: '#111', fontSize: 15, fontWeight: '700' },
  bookSentenceAuthor: { color: '#66707a', fontSize: 11, marginTop: 2 },
  floatingButton: {
    position: 'absolute',
    right: 16,
    bottom: 22,
    width: 66,
    height: 66,
    borderRadius: 0,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  floatingButtonText: { color: '#fff', fontSize: 36, lineHeight: 36, marginTop: -2, fontWeight: '700' },
  bottomNav: {
    height: 84,
    borderTopWidth: 1,
    borderColor: '#0d0d0d',
    backgroundColor: '#44c3f3',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 12,
  },
  bottomItem: { alignItems: 'center', justifyContent: 'center', flex: 1, paddingVertical: 8 },
  bottomIcon: { fontSize: 22, color: '#111', marginBottom: 5 },
  bottomLabel: { fontSize: 11, color: '#111', fontWeight: '700' },
  bottomLabelActive: { fontSize: 11, color: '#fff', fontWeight: '700' },
});

function emojiTypeToIcon(type: HomeCardEmojiType): string {
  if (type === 'SMILE') return '😊';
  if (type === 'HEART') return '😍';
  if (type === 'THINKING') return '🤔';
  if (type === 'FIRE') return '🔥';
  if (type === 'CLAP') return '👏';
  return '🙂';
}
