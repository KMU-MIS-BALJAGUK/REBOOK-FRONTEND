import React, { useEffect, useMemo, useState } from 'react';
import {
  Animated,
  Image,
  Keyboard,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useHomeCards } from '../../home/hooks/useHomeCards';
import { useHomeCardsFilter } from '../../home/hooks/useHomeCardsFilter';
import { useHomeFolders } from '../../home/hooks/useHomeFolders';
import { useReactionEmojis } from '../../home/hooks/useReactionEmojis';
import { useSearchHomeCards } from '../../home/hooks/useSearchHomeCards';
import { HomeCardEmojiType, HomeCardItem, HomeCardSort } from '../../home/model/home.types';
import { API_BASE_URL } from '../../../shared/constants/api';
import { useDismissableBottomSheet } from '../../../shared/hooks/useDismissableBottomSheet';
import { DeepReadingQuoteSource } from '../model/deepReadingChat.types';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelectQuote: (quote: DeepReadingQuoteSource) => void;
};

type QuoteFilterTab = 'all' | 'book' | 'folder' | 'emotion';

type BookGroup = {
  bookId: number;
  bookTitle: string;
  author: string;
  coverImageUrl: string;
  latestCreatedAt: string;
  items: HomeCardItem[];
};

export function DeepReadingSelectorSheet({ visible, onClose, onSelectQuote }: Props) {
  const [activeTab, setActiveTab] = useState<QuoteFilterTab>('all');
  const [selectedBookId, setSelectedBookId] = useState<number | null>(null);
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const [selectedEmojiType, setSelectedEmojiType] = useState<HomeCardEmojiType | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const { onScroll, onSheetLayout, requestClose, sheetAnimatedStyle } = useDismissableBottomSheet({
    visible,
    onClose,
  });

  const sort: HomeCardSort = activeTab === 'emotion' ? 'MOST_REACTED' : 'LATEST';
  const trimmedKeyword = searchKeyword.trim();
  const isSearchMode = trimmedKeyword.length > 0;
  const view = activeTab === 'folder' ? 'grid' : 'list';

  const homeCardsQuery = useHomeCards(
    {
      view,
      size: 20,
      sort,
      enabled: visible && !isSearchMode && (activeTab === 'all' || activeTab === 'book'),
    },
  );
  const homeSearchQuery = useSearchHomeCards(
    {
      q: trimmedKeyword,
      view: 'list',
      size: 20,
      sort,
    },
    visible && isSearchMode,
  );
  const homeFoldersQuery = useHomeFolders({ includeQuoteCount: true }, visible && activeTab === 'folder');
  const reactionEmojisQuery = useReactionEmojis(visible && activeTab === 'emotion');
  const folderFilterQuery = useHomeCardsFilter(
    {
      view,
      size: 20,
      sort,
      folderId: selectedFolderId ?? undefined,
    },
    visible && !isSearchMode && activeTab === 'folder' && typeof selectedFolderId === 'number',
  );
  const emojiFilterQuery = useHomeCardsFilter(
    {
      view,
      size: 20,
      sort,
      emojiType: selectedEmojiType ?? undefined,
    },
    visible && !isSearchMode && activeTab === 'emotion' && selectedEmojiType !== null,
  );

  useEffect(() => {
    if (!visible) {
      return;
    }

    setActiveTab('all');
    setSelectedBookId(null);
    setSelectedFolderId(null);
    setSelectedEmojiType(null);
    setSelectedCardId(null);
    setSearchKeyword('');
  }, [visible]);

  useEffect(() => {
    if (!visible) {
      return;
    }

    if (activeTab === 'folder') {
      const folders = homeFoldersQuery.data ?? [];
      if (folders.length > 0 && selectedFolderId === null) {
        setSelectedFolderId(folders[0].folderId);
      }
    }

    if (activeTab === 'emotion') {
      const emojis = reactionEmojisQuery.data ?? [];
      if (emojis.length > 0 && selectedEmojiType === null) {
        setSelectedEmojiType(emojis[0].emojiType);
      }
    }
  }, [activeTab, homeFoldersQuery.data, reactionEmojisQuery.data, selectedEmojiType, selectedFolderId, visible]);

  const allCards = homeCardsQuery.data?.items ?? [];
  const searchCards = homeSearchQuery.data?.items ?? [];
  const folderCards = folderFilterQuery.data?.items ?? [];
  const emojiCards = emojiFilterQuery.data?.items ?? [];
  const activeErrorMessage = useMemo(() => {
    if (isSearchMode && homeSearchQuery.isError) {
      return homeSearchQuery.error.message;
    }
    if ((activeTab === 'all' || activeTab === 'book') && homeCardsQuery.isError) {
      return homeCardsQuery.error.message;
    }
    if (activeTab === 'folder' && !isSearchMode && homeFoldersQuery.isError) {
      return homeFoldersQuery.error.message;
    }
    if (activeTab === 'folder' && folderFilterQuery.isError) {
      return folderFilterQuery.error.message;
    }
    if (activeTab === 'emotion' && !isSearchMode && reactionEmojisQuery.isError) {
      return reactionEmojisQuery.error.message;
    }
    if (activeTab === 'emotion' && emojiFilterQuery.isError) {
      return emojiFilterQuery.error.message;
    }
    return null;
  }, [
    activeTab,
    emojiFilterQuery.error,
    emojiFilterQuery.isError,
    folderFilterQuery.error,
    folderFilterQuery.isError,
    homeCardsQuery.error,
    homeCardsQuery.isError,
    homeFoldersQuery.error,
    homeFoldersQuery.isError,
    homeSearchQuery.error,
    homeSearchQuery.isError,
    isSearchMode,
    reactionEmojisQuery.error,
    reactionEmojisQuery.isError,
  ]);

  const bookGroups = useMemo(() => {
    const grouped = new Map<number, BookGroup>();

    allCards.forEach((item) => {
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
  }, [allCards]);

  const selectedBook = useMemo(
    () => bookGroups.find((book) => book.bookId === selectedBookId) ?? null,
    [bookGroups, selectedBookId],
  );

  const visibleCards = useMemo(() => {
    if (isSearchMode) {
      return searchCards;
    }
    if (activeTab === 'folder') {
      return folderCards;
    }
    if (activeTab === 'emotion') {
      return emojiCards;
    }
    if (activeTab === 'book' && selectedBookId !== null) {
      return allCards.filter((item) => item.bookId === selectedBookId);
    }
    return allCards;
  }, [activeTab, allCards, emojiCards, folderCards, isSearchMode, searchCards, selectedBookId]);

  const selectedQuote = useMemo(
    () => visibleCards.find((item) => item.cardId === selectedCardId) ?? null,
    [selectedCardId, visibleCards],
  );

  if (!visible) {
    return null;
  }

  const canStart = selectedQuote !== null;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={requestClose} />
      <Animated.View style={[styles.sheet, sheetAnimatedStyle]} onLayout={onSheetLayout}>
        <View style={styles.handleArea}>
          <View style={styles.handle} />
        </View>
        <Pressable style={styles.topPanel} onPress={Keyboard.dismiss}>
          <View style={styles.sheetHeader}>
            <Text style={styles.title}>문장 선택하기</Text>
            <Text style={styles.subtitle}>저장한 문장을 분류해서 고를 수 있어요</Text>
          </View>

          <View style={styles.searchRow}>
            <View style={styles.searchPill}>
              <Text style={styles.searchIcon}>⌕</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="문장, 책, 저자, 메모를 검색하세요"
                placeholderTextColor="#9b9084"
                value={searchKeyword}
                onChangeText={(value) => {
                  setSearchKeyword(value);
                  setSelectedCardId(null);
                  setSelectedBookId(null);
                }}
                autoCorrect={false}
                autoCapitalize="none"
                returnKeyType="search"
                blurOnSubmit
                onSubmitEditing={() => Keyboard.dismiss()}
              />
            </View>
          </View>

          <View style={styles.tabRow}>
            <TabChip
              label="전체"
              active={activeTab === 'all'}
              onPress={() => {
                setActiveTab('all');
                setSelectedBookId(null);
                setSelectedCardId(null);
              }}
            />
            <TabChip
              icon="📖"
              label="도서별"
              active={activeTab === 'book'}
              onPress={() => {
                setActiveTab('book');
                setSelectedCardId(null);
              }}
            />
            <TabChip
              icon="🗂"
              label="폴더별"
              active={activeTab === 'folder'}
              onPress={() => {
                setActiveTab('folder');
                setSelectedBookId(null);
                setSelectedCardId(null);
              }}
            />
            <TabChip
              icon="♡"
              label="감정별"
              active={activeTab === 'emotion'}
              onPress={() => {
                setActiveTab('emotion');
                setSelectedBookId(null);
                setSelectedCardId(null);
              }}
            />
          </View>

          {activeTab === 'folder' && !isSearchMode ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
              {(homeFoldersQuery.data ?? []).map((folder) => (
                <FilterChip
                  key={`folder-${folder.folderId}`}
                  label={folder.folderName}
                  active={selectedFolderId === folder.folderId}
                  onPress={() => {
                    setSelectedFolderId(folder.folderId);
                    setSelectedCardId(null);
                  }}
                />
              ))}
            </ScrollView>
          ) : null}

          {activeTab === 'emotion' && !isSearchMode ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
              {(reactionEmojisQuery.data ?? []).map((emoji) => (
                <EmotionChip
                  key={emoji.emojiType}
                  active={selectedEmojiType === emoji.emojiType}
                  onPress={() => {
                    setSelectedEmojiType(emoji.emojiType);
                    setSelectedCardId(null);
                  }}
                  icon={emojiTypeToIcon(emoji.emojiType)}
                />
              ))}
            </ScrollView>
          ) : null}
        </Pressable>

        <ScrollView
          style={styles.list}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          onScroll={onScroll}
          scrollEventThrottle={16}
        >
          {activeErrorMessage ? (
            <View style={styles.stateRow}>
              <Text style={styles.stateText}>문장을 불러오지 못했어요.</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => {
                  if (isSearchMode) {
                    void homeSearchQuery.refetch();
                  } else if (activeTab === 'all' || activeTab === 'book') {
                    void homeCardsQuery.refetch();
                  } else if (activeTab === 'folder') {
                    void homeFoldersQuery.refetch();
                    void folderFilterQuery.refetch();
                  } else if (activeTab === 'emotion') {
                    void reactionEmojisQuery.refetch();
                    void emojiFilterQuery.refetch();
                  }
                }}
              >
                <Text style={styles.retryText}>다시 시도</Text>
              </TouchableOpacity>
            </View>
          ) : null}
          {isSearchMode && homeSearchQuery.isLoading ? <Text style={styles.inlineState}>검색 결과를 불러오는 중...</Text> : null}
          {activeTab === 'folder' && !isSearchMode && homeFoldersQuery.isLoading ? (
            <Text style={styles.inlineState}>폴더를 불러오는 중...</Text>
          ) : null}
          {activeTab === 'emotion' && !isSearchMode && reactionEmojisQuery.isLoading ? (
            <Text style={styles.inlineState}>이모지를 불러오는 중...</Text>
          ) : null}
          {activeTab === 'book' && !isSearchMode && homeCardsQuery.isLoading ? (
            <Text style={styles.inlineState}>문장을 불러오는 중...</Text>
          ) : null}

          {!isSearchMode && activeTab === 'book' && selectedBookId === null ? (
            <View style={styles.bookShelfGrid}>
              {bookGroups.map((book) => (
                <BookShelfCard
                  key={book.bookId}
                  item={book}
                  onPress={() => {
                    setSelectedBookId(book.bookId);
                    setSelectedCardId(null);
                  }}
                />
              ))}
            </View>
          ) : null}

          {!isSearchMode && activeTab === 'book' && selectedBookId !== null && selectedBook ? (
            <View style={styles.bookSentenceSection}>
              <View style={styles.bookSentenceHeader}>
                <TouchableOpacity
                  style={styles.bookSentenceBackButton}
                  onPress={() => {
                    setSelectedBookId(null);
                    setSelectedCardId(null);
                  }}
                  activeOpacity={0.9}
                >
                  <Text style={styles.bookSentenceBackText}>← 목록</Text>
                </TouchableOpacity>
                <View style={styles.bookSentenceMeta}>
                  <Text style={styles.bookSentenceTitle} numberOfLines={1}>
                    {selectedBook.bookTitle}
                  </Text>
                  <Text style={styles.bookSentenceSub} numberOfLines={1}>
                    {selectedBook.author}
                  </Text>
                </View>
              </View>
              {visibleCards.map((item) => (
                <SelectableQuoteCard
                  key={item.cardId}
                  item={item}
                  active={selectedCardId === item.cardId}
                  onPress={() => setSelectedCardId(item.cardId)}
                />
              ))}
            </View>
          ) : null}

          {(isSearchMode || activeTab !== 'book') &&
          visibleCards.length > 0 ? (
            visibleCards.map((item) => (
              <SelectableQuoteCard
                key={item.cardId}
                item={item}
                active={selectedCardId === item.cardId}
                onPress={() => setSelectedCardId(item.cardId)}
              />
            ))
          ) : null}

          {!isSearchMode &&
          activeTab !== 'book' &&
          !homeCardsQuery.isLoading &&
          !homeSearchQuery.isLoading &&
          !homeFoldersQuery.isLoading &&
          !reactionEmojisQuery.isLoading &&
          visibleCards.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>문장이 없어요</Text>
              <Text style={styles.emptyBody}>다른 탭을 선택하거나 저장한 문장을 추가해보세요.</Text>
            </View>
          ) : null}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.startButton, !canStart && styles.startButtonDisabled]}
            disabled={!canStart}
            onPress={() => {
              if (!selectedQuote) {
                return;
              }

              onSelectQuote({
                quoteId: selectedQuote.cardId,
                bookId: selectedQuote.bookId,
                bookTitle: selectedQuote.bookTitle,
                author: selectedQuote.author,
                pageNumber: selectedQuote.pageNumber,
                quoteText: selectedQuote.quoteText,
              });
              onClose();
            }}
          >
            <Text style={styles.startButtonText}>선택한 문장으로 시작하기</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
}

function SelectableQuoteCard({
  item,
  active,
  onPress,
}: {
  item: HomeCardItem;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={[styles.card, active && styles.cardActive]} onPress={onPress} activeOpacity={0.9}>
      <Text style={styles.meta}>
        {item.bookTitle} · {item.author} · P.{item.pageNumber}
      </Text>
      <Text style={styles.quoteText} numberOfLines={3}>
        {item.quoteText}
      </Text>
      {item.memoPreview ? <Text style={styles.memoText} numberOfLines={2}>{item.memoPreview}</Text> : null}
      <View style={styles.cardFooter}>
        <Text style={styles.cardFooterText}>{item.reactionSummary.totalCount} 반응</Text>
        <Text style={styles.cardFooterText}>{item.createdAt}</Text>
      </View>
    </TouchableOpacity>
  );
}

function BookShelfCard({
  item,
  onPress,
}: {
  item: BookGroup;
  onPress: () => void;
}) {
  const [hasImageError, setHasImageError] = useState(false);
  const resolvedCoverImageUrl = resolveRemoteImageUrl(item.coverImageUrl);

  return (
    <TouchableOpacity style={styles.bookShelfCard} onPress={onPress} activeOpacity={0.9}>
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
    </TouchableOpacity>
  );
}

function TabChip({
  label,
  icon,
  active,
  onPress,
}: {
  label: string;
  icon?: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={[styles.tabChip, active && styles.tabChipActive]} onPress={onPress} activeOpacity={0.9}>
      {icon ? <Text style={[styles.tabChipIcon, active && styles.tabChipIconActive]}>{icon}</Text> : null}
      <Text style={[styles.tabChipText, active && styles.tabChipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function FilterChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={[styles.filterChip, active && styles.filterChipActive]} onPress={onPress} activeOpacity={0.9}>
      <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function EmotionChip({
  icon,
  active,
  onPress,
}: {
  icon: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={[styles.emojiChip, active && styles.emojiChipActive]} onPress={onPress} activeOpacity={0.9}>
      <Text style={styles.emojiChipText}>{icon}</Text>
    </TouchableOpacity>
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

  return trimmed;
}

function emojiTypeToIcon(type: HomeCardEmojiType): string {
  if (type === 'SMILE') return '😊';
  if (type === 'HEART') return '😍';
  if (type === 'THINKING') return '🤔';
  if (type === 'FIRE') return '🔥';
  if (type === 'CLAP') return '👏';
  return '🙂';
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '82%',
    backgroundColor: '#44c3f3',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#111',
    paddingTop: 8,
  },
  handleArea: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  handle: {
    width: 52,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#d8cfc0',
    alignSelf: 'center',
    marginBottom: 12,
  },
  sheetHeader: {
    paddingHorizontal: 16,
    gap: 6,
    marginBottom: 12,
  },
  topPanel: {
    backgroundColor: '#44c3f3',
    paddingBottom: 14,
  },
  title: {
    fontSize: 22,
    color: '#111',
    fontWeight: '900',
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: '#66707a',
  },
  searchRow: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  searchPill: {
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#dbe3ea',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchIcon: {
    fontSize: 15,
    color: '#66707a',
    fontWeight: '700',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#111',
    paddingVertical: 0,
  },
  tabRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  tabChip: {
    flex: 1,
    minHeight: 42,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#dbe3ea',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabChipActive: {
    borderColor: '#111',
    backgroundColor: '#111',
  },
  tabChipIcon: {
    fontSize: 14,
    color: '#66707a',
    marginBottom: 2,
  },
  tabChipIconActive: {
    color: '#48c3f2',
  },
  tabChipText: {
    fontSize: 12,
    color: '#66707a',
    fontWeight: '700',
  },
  tabChipTextActive: {
    color: '#48c3f2',
  },
  filterRow: {
    paddingHorizontal: 16,
    gap: 8,
    paddingBottom: 12,
    paddingTop: 2,
  },
  filterChip: {
    minHeight: 38,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#dbe3ea',
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipActive: {
    borderColor: '#111',
    backgroundColor: '#111',
  },
  filterChipText: {
    fontSize: 12,
    color: '#685e53',
    fontWeight: '700',
  },
  filterChipTextActive: {
    color: '#fff8ef',
  },
  list: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#111',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 96,
    gap: 10,
  },
  stateRow: {
    gap: 8,
    paddingVertical: 8,
  },
  stateText: {
    fontSize: 13,
    color: '#6c6155',
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
  inlineState: {
    fontSize: 13,
    color: '#7a6f63',
    paddingVertical: 6,
  },
  bookShelfGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
    paddingTop: 4,
    paddingBottom: 12,
  },
  bookShelfCard: {
    width: '48.5%',
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#e8e8e8',
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
    color: '#6f6457',
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
  bookShelfCardTitle: { color: '#3f3830', fontWeight: '700', fontSize: 12, marginBottom: 3 },
  bookShelfCardAuthor: { color: '#7f7567', fontSize: 10 },
  bookSentenceSection: {
    gap: 10,
    paddingTop: 12,
  },
  bookSentenceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 2,
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
  bookSentenceBackText: {
    color: '#6f6457',
    fontSize: 11,
    fontWeight: '700',
  },
  bookSentenceMeta: {
    flex: 1,
  },
  bookSentenceTitle: {
    fontSize: 16,
    color: '#111',
    fontWeight: '900',
  },
  bookSentenceSub: {
    fontSize: 12,
    color: '#66707a',
    marginBottom: 4,
  },
  card: {
    borderWidth: 1,
    borderColor: '#dbe3ea',
    backgroundColor: '#fff',
    padding: 14,
    gap: 10,
  },
  cardActive: {
    backgroundColor: '#eef8fd',
  },
  meta: {
    fontSize: 11,
    color: '#66707a',
    fontWeight: '700',
  },
  quoteText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#111',
    fontWeight: '600',
  },
  memoText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#66707a',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  cardFooterText: {
    fontSize: 11,
    color: '#66707a',
    fontWeight: '600',
  },
  emptyState: {
    paddingVertical: 32,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    color: '#111',
    fontWeight: '800',
  },
  emptyBody: {
    fontSize: 13,
    color: '#66707a',
    textAlign: 'center',
    lineHeight: 19,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#dbe3ea',
    backgroundColor: '#fff',
  },
  startButton: {
    minHeight: 54,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#111',
    backgroundColor: '#48c3f2',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  startButtonDisabled: {
    opacity: 0.55,
  },
  startButtonText: {
    fontSize: 15,
    color: '#111',
    fontWeight: '800',
  },
  emojiChip: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 1,
    borderColor: '#dbe3ea',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiChipActive: {
    borderColor: '#111',
    backgroundColor: '#fff3de',
  },
  emojiChipText: {
    fontSize: 24,
    lineHeight: 24,
  },
});
