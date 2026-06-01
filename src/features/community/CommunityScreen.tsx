import React, { useMemo, useState } from 'react';
import { FlatList, Modal, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useMyCommunityBooks } from './hooks/useMyCommunityBooks';
import { usePopularCommunityBooks } from './hooks/usePopularCommunityBooks';
import { useCommunityBookDetail } from './hooks/useCommunityBookDetail';
import { useCommunityBookTopQuotes } from './hooks/useCommunityBookTopQuotes';
import { useBookDiscussions } from './hooks/useBookDiscussions';
import { useCreateBookDiscussion } from './hooks/useCreateBookDiscussion';
import { CommunityDiscussionCategory } from './model/communityBook.types';
import { useDiscussionDetail } from './hooks/useDiscussionDetail';
import { useToggleDiscussionLike } from './hooks/useToggleDiscussionLike';
import { useDiscussionComments } from './hooks/useDiscussionComments';
import { useCreateDiscussionComment } from './hooks/useCreateDiscussionComment';
import { toUserMessage } from '../../shared/utils/apiError';

type Props = {
  nickname: string;
  onPressHome: () => void;
  onPressAiChat: () => void;
  onPressMyPage: () => void;
};

export function CommunityScreen({ nickname, onPressHome, onPressAiChat, onPressMyPage }: Props) {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedBookId, setSelectedBookId] = useState<number | null>(null);
  const [selectedDiscussionId, setSelectedDiscussionId] = useState<number | null>(null);
  const [detailTab, setDetailTab] = useState<'TOP_QUOTES' | 'DISCUSSION' | 'VOTE'>('TOP_QUOTES');
  const [isCreateDiscussionVisible, setIsCreateDiscussionVisible] = useState(false);
  const [newDiscussionCategory, setNewDiscussionCategory] = useState<CommunityDiscussionCategory>('QUESTION');
  const [newDiscussionTitle, setNewDiscussionTitle] = useState('');
  const [newDiscussionContent, setNewDiscussionContent] = useState('');
  const [createDiscussionError, setCreateDiscussionError] = useState<string | null>(null);
  const [newCommentContent, setNewCommentContent] = useState('');
  const [createCommentError, setCreateCommentError] = useState<string | null>(null);
  const displayName = nickname.trim() ? nickname : 'User';
  const trimmedKeyword = searchKeyword.trim();
  const myBooksQuery = useMyCommunityBooks(
    useMemo(
      () => ({
        size: 10,
        q: trimmedKeyword || undefined,
      }),
      [trimmedKeyword],
    ),
  );
  const myBookItems = myBooksQuery.data?.items ?? [];
  const myBookCount = myBooksQuery.data?.totalCount ?? 0;
  const popularBooksQuery = usePopularCommunityBooks(
    useMemo(
      () => ({
        size: 10,
        period: 'WEEK' as const,
        sort: 'HOT' as const,
      }),
      [],
    ),
  );
  const popularBookItems = popularBooksQuery.data?.items ?? [];
  const bookDetailQuery = useCommunityBookDetail(selectedBookId);
  const topQuotesQuery = useCommunityBookTopQuotes(
    selectedBookId,
    useMemo(
      () => ({
        size: 3,
        period: 'ALL' as const,
        sort: 'SAVED_DESC' as const,
      }),
      [],
    ),
  );
  const discussionsQuery = useBookDiscussions(
    selectedBookId,
    useMemo(
      () => ({
        sort: 'LATEST' as const,
        size: 10,
      }),
      [],
    ),
  );
  const createDiscussionMutation = useCreateBookDiscussion(selectedBookId);
  const discussionDetailQuery = useDiscussionDetail(selectedDiscussionId);
  const toggleDiscussionLikeMutation = useToggleDiscussionLike();
  const discussionCommentsQuery = useDiscussionComments(
    selectedDiscussionId,
    useMemo(
      () => ({
        size: 20,
        sort: 'LATEST' as const,
      }),
      [],
    ),
  );
  const createCommentMutation = useCreateDiscussionComment(selectedDiscussionId);

  const handleCreateDiscussion = () => {
    if (createDiscussionMutation.isPending) {
      return;
    }

    const title = newDiscussionTitle.trim();
    const content = newDiscussionContent.trim();

    if (!title) {
      setCreateDiscussionError('제목을 입력해주세요.');
      return;
    }
    if (!content) {
      setCreateDiscussionError('내용을 입력해주세요.');
      return;
    }

    setCreateDiscussionError(null);
    createDiscussionMutation.mutate(
      {
        category: newDiscussionCategory,
        title,
        content,
      },
      {
        onSuccess: async () => {
          setIsCreateDiscussionVisible(false);
          setNewDiscussionTitle('');
          setNewDiscussionContent('');
          setNewDiscussionCategory('QUESTION');
          await discussionsQuery.refetch();
        },
      },
    );
  };

  const handleCreateComment = () => {
    if (createCommentMutation.isPending) {
      return;
    }

    const content = newCommentContent.trim();
    if (!content) {
      setCreateCommentError('댓글 내용을 입력해주세요.');
      return;
    }

    setCreateCommentError(null);
    createCommentMutation.mutate(
      { content },
      {
        onSuccess: async () => {
          setNewCommentContent('');
          await discussionCommentsQuery.refetch();
          await discussionDetailQuery.refetch();
          await discussionsQuery.refetch();
        },
      },
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <Text style={styles.username}>{displayName}</Text>

        <View style={styles.searchRow}>
          <View style={styles.searchPill}>
            <Text style={styles.searchIcon}>⌕</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="책 제목으로 검색"
              placeholderTextColor="#9f968a"
              value={searchKeyword}
              onChangeText={setSearchKeyword}
            />
          </View>
          <View style={styles.badgeButton}>
            <Text style={styles.badgeButtonText}>나</Text>
          </View>
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitleLarge}>내가 읽고 있는 책</Text>
            <Text style={styles.sectionCountText}>{myBookCount}권</Text>
          </View>

          {myBooksQuery.isLoading ? (
            <Text style={styles.infoText}>책 목록을 불러오는 중...</Text>
          ) : null}

          {!myBooksQuery.isLoading && myBooksQuery.isError ? (
            <View style={styles.stateWrap}>
              <Text style={styles.errorText}>{toUserMessage(myBooksQuery.error)}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={() => void myBooksQuery.refetch()}>
                <Text style={styles.retryButtonText}>다시 시도</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {!myBooksQuery.isLoading && !myBooksQuery.isError && myBookItems.length === 0 ? (
            <Text style={styles.infoText}>읽고 있는 책이 없어요.</Text>
          ) : null}

          {!myBooksQuery.isLoading && !myBooksQuery.isError
            ? myBookItems.map((book) => (
                <TouchableOpacity
                  key={book.bookId}
                  style={styles.bookCard}
                  onPress={() => {
                    setDetailTab('TOP_QUOTES');
                    setSelectedBookId(book.bookId);
                  }}
                >
                  <View style={styles.bookRow}>
                    <View style={styles.coverPlaceholder}>
                      <Text style={styles.coverText}>표지</Text>
                    </View>
                    <View style={styles.bookContent}>
                      <Text style={styles.bookTitle} numberOfLines={1}>{book.title}</Text>
                      <Text style={styles.bookAuthor}>{book.author}</Text>
                      <Text style={styles.bookMeta}>읽는 중 {book.readerCount}명 · 새 글 {book.recentPostCount}</Text>
                    </View>
                  </View>
                  <View style={styles.previewBox}>
                    <Text style={styles.previewLabel}>↗ 많이 저장한 문장</Text>
                    <Text style={styles.previewText} numberOfLines={1}>
                      {book.savedQuotePreview ?? '아직 저장한 문장이 없어요.'}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            : null}

          <Text style={styles.sectionTitleLarge}>인기 책 커뮤니티</Text>
          {popularBooksQuery.isLoading ? <Text style={styles.infoText}>인기 책을 불러오는 중...</Text> : null}
          {!popularBooksQuery.isLoading && popularBooksQuery.isError ? (
            <View style={styles.stateWrap}>
              <Text style={styles.errorText}>{toUserMessage(popularBooksQuery.error)}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={() => void popularBooksQuery.refetch()}>
                <Text style={styles.retryButtonText}>다시 시도</Text>
              </TouchableOpacity>
            </View>
          ) : null}
          {!popularBooksQuery.isLoading && !popularBooksQuery.isError && popularBookItems.length === 0 ? (
            <Text style={styles.infoText}>인기 책이 아직 없어요.</Text>
          ) : null}
          {!popularBooksQuery.isLoading && !popularBooksQuery.isError
            ? popularBookItems.map((book) => (
                <TouchableOpacity
                  key={`popular-${book.bookId}`}
                  style={styles.smallCard}
                  onPress={() => {
                    setDetailTab('TOP_QUOTES');
                    setSelectedBookId(book.bookId);
                  }}
                >
                  <View style={styles.popularBookRow}>
                    <View style={styles.popularCoverPlaceholder}>
                      <Text style={styles.coverText}>표지</Text>
                    </View>
                    <View style={styles.bookContent}>
                      <Text style={styles.bookTitle} numberOfLines={1}>{book.title}</Text>
                      <Text style={styles.bookAuthor}>{book.author}</Text>
                      <Text style={styles.bookMeta}>읽는 중 {book.readerCount}명 · 새 글 {book.recentPostCount}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            : null}
        </ScrollView>

        <Modal visible={selectedBookId !== null} transparent animationType="fade" onRequestClose={() => setSelectedBookId(null)}>
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>책별 커뮤니티</Text>
              {bookDetailQuery.isLoading ? <Text style={styles.infoText}>책 정보를 불러오는 중...</Text> : null}
              {!bookDetailQuery.isLoading && bookDetailQuery.isError ? (
                <View style={styles.stateWrap}>
                  <Text style={styles.errorText}>{toUserMessage(bookDetailQuery.error)}</Text>
                  <TouchableOpacity style={styles.retryButton} onPress={() => void bookDetailQuery.refetch()}>
                    <Text style={styles.retryButtonText}>다시 시도</Text>
                  </TouchableOpacity>
                </View>
              ) : null}
              {!bookDetailQuery.isLoading && !bookDetailQuery.isError && bookDetailQuery.data ? (
                <>
                  <View style={styles.detailHeaderCard}>
                    <View style={styles.bookRow}>
                      <View style={styles.coverPlaceholder}>
                        <Text style={styles.coverText}>표지</Text>
                      </View>
                      <View style={styles.bookContent}>
                        <Text style={styles.bookTitle} numberOfLines={1}>{bookDetailQuery.data.title}</Text>
                        <Text style={styles.bookAuthor}>{bookDetailQuery.data.author}</Text>
                        <Text style={styles.bookMeta}>지금 {bookDetailQuery.data.readerCount}명이 읽고 있어요</Text>
                      </View>
                    </View>
                    <Text style={styles.detailHelperText}>같은 책을 읽은 사람들은 어떤 문장을 남겼을까요?</Text>
                  </View>
                  <View style={styles.detailTabRow}>
                    <TouchableOpacity
                      style={[styles.detailTabButton, detailTab === 'TOP_QUOTES' && styles.detailTabButtonActive]}
                      onPress={() => setDetailTab('TOP_QUOTES')}
                    >
                      <Text style={[styles.detailTabButtonText, detailTab === 'TOP_QUOTES' && styles.detailTabButtonTextActive]}>
                        많이 저장한 문장
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.detailTabButton, detailTab === 'DISCUSSION' && styles.detailTabButtonActive]}
                      onPress={() => setDetailTab('DISCUSSION')}
                    >
                      <Text style={[styles.detailTabButtonText, detailTab === 'DISCUSSION' && styles.detailTabButtonTextActive]}>
                        토론
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.detailTabButton, detailTab === 'VOTE' && styles.detailTabButtonActive]}
                      onPress={() => setDetailTab('VOTE')}
                    >
                      <Text style={[styles.detailTabButtonText, detailTab === 'VOTE' && styles.detailTabButtonTextActive]}>
                        투표
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {detailTab === 'TOP_QUOTES' ? (
                    <>
                      {topQuotesQuery.isLoading ? <Text style={styles.infoText}>많이 저장한 문장을 불러오는 중...</Text> : null}
                      {!topQuotesQuery.isLoading && topQuotesQuery.isError ? (
                        <View style={styles.stateWrap}>
                          <Text style={styles.errorText}>{toUserMessage(topQuotesQuery.error)}</Text>
                          <TouchableOpacity style={styles.retryButton} onPress={() => void topQuotesQuery.refetch()}>
                            <Text style={styles.retryButtonText}>다시 시도</Text>
                          </TouchableOpacity>
                        </View>
                      ) : null}
                      {!topQuotesQuery.isLoading && !topQuotesQuery.isError && (topQuotesQuery.data?.items ?? []).length === 0 ? (
                        <Text style={styles.infoText}>많이 저장한 문장이 아직 없어요.</Text>
                      ) : null}
                      {!topQuotesQuery.isLoading && !topQuotesQuery.isError
                        ? (topQuotesQuery.data?.items ?? []).map((item) => (
                            <View key={item.quoteId} style={styles.quoteRankCard}>
                              <View style={styles.rankBadge}>
                                <Text style={styles.rankBadgeText}>{item.rank}</Text>
                              </View>
                              <View style={styles.rankContent}>
                                <Text style={styles.rankQuoteText} numberOfLines={1}>{item.quoteText}</Text>
                                <Text style={styles.rankMetaText}>저장 {item.savedCount}회</Text>
                              </View>
                            </View>
                          ))
                        : null}
                    </>
                  ) : detailTab === 'DISCUSSION' ? (
                    <>
                      <View style={styles.discussionHeaderRow}>
                        <TouchableOpacity style={styles.discussionCreateButton} onPress={() => setIsCreateDiscussionVisible(true)}>
                          <Text style={styles.discussionCreateButtonText}>토론 작성</Text>
                        </TouchableOpacity>
                      </View>
                      {discussionsQuery.isLoading ? <Text style={styles.infoText}>토론 목록을 불러오는 중...</Text> : null}
                      {!discussionsQuery.isLoading && discussionsQuery.isError ? (
                        <View style={styles.stateWrap}>
                          <Text style={styles.errorText}>{toUserMessage(discussionsQuery.error)}</Text>
                          <TouchableOpacity style={styles.retryButton} onPress={() => void discussionsQuery.refetch()}>
                            <Text style={styles.retryButtonText}>다시 시도</Text>
                          </TouchableOpacity>
                        </View>
                      ) : null}
                      {!discussionsQuery.isLoading && !discussionsQuery.isError && (discussionsQuery.data?.items ?? []).length === 0 ? (
                        <Text style={styles.infoText}>등록된 토론이 아직 없어요.</Text>
                      ) : null}
                      {!discussionsQuery.isLoading && !discussionsQuery.isError
                        ? (discussionsQuery.data?.items ?? []).map((item) => (
                            <TouchableOpacity
                              key={item.discussionId}
                              style={styles.discussionCard}
                              onPress={() => setSelectedDiscussionId(item.discussionId)}
                            >
                              <View style={styles.discussionBadge}>
                                <Text style={styles.discussionBadgeText}>{item.categoryLabel}</Text>
                              </View>
                              <Text style={styles.discussionTitle}>{item.title}</Text>
                              <Text style={styles.discussionPreview}>{item.preview}</Text>
                              <View style={styles.discussionActionRow}>
                                <Text style={styles.discussionMeta}>댓글 {item.commentCount}</Text>
                                <TouchableOpacity
                                  onPress={(e) => {
                                    e.stopPropagation();
                                    toggleDiscussionLikeMutation.mutate(item.discussionId, {
                                      onSuccess: async () => {
                                        await discussionsQuery.refetch();
                                        if (selectedDiscussionId === item.discussionId) {
                                          await discussionDetailQuery.refetch();
                                        }
                                      },
                                    });
                                  }}
                                >
                                  <Text style={styles.likeInlineText}>
                                    {item.myLike ? '♥' : '♡'} {item.likeCount}
                                  </Text>
                                </TouchableOpacity>
                              </View>
                            </TouchableOpacity>
                          ))
                        : null}
                    </>
                  ) : (
                    <Text style={styles.infoText}>준비 중인 탭입니다.</Text>
                  )}
                </>
              ) : null}
              <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedBookId(null)}>
                <Text style={styles.closeButtonText}>닫기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal visible={selectedDiscussionId !== null} transparent animationType="fade" onRequestClose={() => setSelectedDiscussionId(null)}>
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>토론 상세</Text>
              {discussionDetailQuery.isLoading ? <Text style={styles.infoText}>토론 상세를 불러오는 중...</Text> : null}
              {!discussionDetailQuery.isLoading && discussionDetailQuery.isError ? (
                <View style={styles.stateWrap}>
                  <Text style={styles.errorText}>{toUserMessage(discussionDetailQuery.error)}</Text>
                  <TouchableOpacity style={styles.retryButton} onPress={() => void discussionDetailQuery.refetch()}>
                    <Text style={styles.retryButtonText}>다시 시도</Text>
                  </TouchableOpacity>
                </View>
              ) : null}
              {!discussionDetailQuery.isLoading && !discussionDetailQuery.isError && discussionDetailQuery.data ? (
                <>
                  <View style={styles.detailHeaderCard}>
                    <View style={styles.bookRow}>
                      <View style={styles.coverPlaceholder}>
                        <Text style={styles.coverText}>표지</Text>
                      </View>
                      <View style={styles.bookContent}>
                        <Text style={styles.bookTitle} numberOfLines={1}>{discussionDetailQuery.data.bookTitle}</Text>
                        <Text style={styles.bookAuthor}>{discussionDetailQuery.data.bookAuthor}</Text>
                      </View>
                    </View>
                    <View style={styles.discussionBadge}>
                      <Text style={styles.discussionBadgeText}>{discussionDetailQuery.data.categoryLabel}</Text>
                    </View>
                    <Text style={styles.discussionTitle}>{discussionDetailQuery.data.title}</Text>
                    <Text style={styles.discussionPreview}>{discussionDetailQuery.data.content}</Text>
                    <Text style={styles.discussionMeta}>
                      작성자 {discussionDetailQuery.data.writer.nickname} · 댓글 {discussionDetailQuery.data.commentCount}
                    </Text>
                    <TouchableOpacity
                      style={styles.likeButton}
                      onPress={() => {
                        toggleDiscussionLikeMutation.mutate(discussionDetailQuery.data.discussionId, {
                          onSuccess: async () => {
                            await discussionDetailQuery.refetch();
                            await discussionsQuery.refetch();
                          },
                        });
                      }}
                    >
                      <Text style={styles.likeButtonText}>
                        {discussionDetailQuery.data.myLike ? '좋아요 취소' : '좋아요'} ({discussionDetailQuery.data.likeCount})
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.commentSectionCard}>
                    <Text style={styles.commentSectionTitle}>댓글</Text>
                    {discussionCommentsQuery.isLoading ? <Text style={styles.infoText}>댓글을 불러오는 중...</Text> : null}
                    {!discussionCommentsQuery.isLoading && discussionCommentsQuery.isError ? (
                      <View style={styles.stateWrap}>
                        <Text style={styles.errorText}>{toUserMessage(discussionCommentsQuery.error)}</Text>
                        <TouchableOpacity style={styles.retryButton} onPress={() => void discussionCommentsQuery.refetch()}>
                          <Text style={styles.retryButtonText}>다시 시도</Text>
                        </TouchableOpacity>
                      </View>
                    ) : null}
                    {!discussionCommentsQuery.isLoading &&
                    !discussionCommentsQuery.isError &&
                    (discussionCommentsQuery.data?.items ?? []).length === 0 ? (
                      <Text style={styles.infoText}>등록된 댓글이 아직 없어요.</Text>
                    ) : null}
                    {!discussionCommentsQuery.isLoading && !discussionCommentsQuery.isError ? (
                      <FlatList
                        data={discussionCommentsQuery.data?.items ?? []}
                        keyExtractor={(comment) => String(comment.commentId)}
                        style={styles.commentList}
                        renderItem={({ item: comment }) => (
                          <View style={styles.commentItemCard}>
                            <Text style={styles.commentWriter}>{comment.writer.nickname}</Text>
                            <Text style={styles.commentContent}>{comment.content}</Text>
                            <Text style={styles.commentMeta}>좋아요 {comment.likeCount}</Text>
                          </View>
                        )}
                      />
                    ) : null}
                    <TextInput
                      style={styles.inputBox}
                      placeholder="댓글을 입력하세요"
                      placeholderTextColor="#9f968a"
                      value={newCommentContent}
                      onChangeText={setNewCommentContent}
                    />
                    {createCommentError ? <Text style={styles.errorText}>{createCommentError}</Text> : null}
                    {createCommentMutation.isError ? <Text style={styles.errorText}>{toUserMessage(createCommentMutation.error)}</Text> : null}
                    <TouchableOpacity
                      style={styles.commentSubmitButton}
                      onPress={handleCreateComment}
                      disabled={createCommentMutation.isPending}
                    >
                      <Text style={styles.commentSubmitButtonText}>
                        {createCommentMutation.isPending ? '작성 중...' : '댓글 작성'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : null}
              <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedDiscussionId(null)}>
                <Text style={styles.closeButtonText}>닫기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal visible={isCreateDiscussionVisible} transparent animationType="fade" onRequestClose={() => setIsCreateDiscussionVisible(false)}>
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>토론 글 작성</Text>
              <Text style={styles.inputLabel}>카테고리</Text>
              <View style={styles.categoryRow}>
                {(['QUESTION', 'INTERPRETATION', 'IMPRESSION'] as const).map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[styles.categoryChip, newDiscussionCategory === category && styles.categoryChipActive]}
                    onPress={() => setNewDiscussionCategory(category)}
                  >
                    <Text style={[styles.categoryChipText, newDiscussionCategory === category && styles.categoryChipTextActive]}>
                      {category === 'QUESTION' ? '질문' : category === 'INTERPRETATION' ? '해석' : '감상'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.inputLabel}>제목</Text>
              <TextInput
                style={styles.inputBox}
                value={newDiscussionTitle}
                onChangeText={setNewDiscussionTitle}
                placeholder="토론 제목을 입력하세요"
                placeholderTextColor="#9f968a"
              />
              <Text style={styles.inputLabel}>내용</Text>
              <TextInput
                style={styles.textArea}
                value={newDiscussionContent}
                onChangeText={setNewDiscussionContent}
                multiline
                placeholder="토론 내용을 입력하세요"
                placeholderTextColor="#9f968a"
              />
              {createDiscussionError ? <Text style={styles.errorText}>{createDiscussionError}</Text> : null}
              {createDiscussionMutation.isError ? (
                <Text style={styles.errorText}>{toUserMessage(createDiscussionMutation.error)}</Text>
              ) : null}
              <View style={styles.createFooterRow}>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setIsCreateDiscussionVisible(false)}>
                  <Text style={styles.cancelButtonText}>취소</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={handleCreateDiscussion}
                  disabled={createDiscussionMutation.isPending}
                >
                  <Text style={styles.confirmButtonText}>
                    {createDiscussionMutation.isPending ? '작성 중...' : '작성 완료'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.bottomItem} onPress={onPressHome}>
            <Text style={styles.bottomIcon}>⌂</Text>
            <Text style={styles.bottomLabel}>홈</Text>
          </TouchableOpacity>
          <View style={styles.bottomItem}>
            <Text style={styles.bottomIcon}>◌</Text>
            <Text style={styles.bottomLabelActive}>커뮤니티</Text>
          </View>
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
  searchInput: { flex: 1, fontSize: 11, color: '#4a433a', paddingVertical: 0 },
  badgeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#8d7353',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeButtonText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  scroll: { flex: 1 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, marginBottom: 8 },
  sectionTitleLarge: { fontSize: 12, color: '#4f463c', fontWeight: '700' },
  sectionCountText: { fontSize: 12, color: '#8b8173', fontWeight: '600' },
  infoText: { fontSize: 13, color: '#7b7369', marginBottom: 10 },
  errorText: { fontSize: 13, color: '#b25555', marginBottom: 8 },
  stateWrap: { marginBottom: 10 },
  retryButton: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#c8beaf',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#f4efe7',
  },
  retryButtonText: { color: '#5f564b', fontSize: 12, fontWeight: '600' },
  bookCard: {
    backgroundColor: '#f9f6f0',
    borderWidth: 1,
    borderColor: '#ece4d9',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  bookRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  coverPlaceholder: {
    width: 60,
    height: 76,
    borderRadius: 10,
    backgroundColor: '#eee8de',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  coverText: { color: '#847a6d', fontSize: 11, fontWeight: '600' },
  bookContent: { flex: 1 },
  bookTitle: { fontSize: 13, color: '#2f2921', fontWeight: '700', marginBottom: 4 },
  bookAuthor: { fontSize: 11, color: '#6d6458', marginBottom: 6 },
  bookMeta: { fontSize: 10, color: '#756b5f' },
  previewBox: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9dfd2',
    backgroundColor: '#f4efe7',
    padding: 10,
  },
  previewLabel: { fontSize: 10, color: '#7b7369', fontWeight: '700', marginBottom: 4 },
  previewText: { fontSize: 12, color: '#2f2921', lineHeight: 18 },
  smallCard: {
    minHeight: 92,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ece4d9',
    backgroundColor: '#f9f6f0',
    justifyContent: 'center',
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  smallCardTitle: { fontSize: 12, color: '#3f362d', fontWeight: '600' },
  popularBookRow: { flexDirection: 'row', alignItems: 'center' },
  popularCoverPlaceholder: {
    width: 50,
    height: 62,
    borderRadius: 8,
    backgroundColor: '#eee8de',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
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
    maxHeight: '88%',
  },
  modalTitle: { fontSize: 16, color: '#2f2a24', fontWeight: '700', marginBottom: 10 },
  detailHeaderCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e8dfd2',
    backgroundColor: '#f7f2ea',
    padding: 12,
    marginBottom: 12,
  },
  detailHelperText: { fontSize: 12, color: '#7d7366' },
  detailTabRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  detailTabButton: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e3d9cb',
    backgroundColor: '#f4efe7',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  detailTabButtonActive: {
    backgroundColor: '#8d7353',
    borderColor: '#8d7353',
  },
  detailTabButtonText: { fontSize: 11, color: '#6c6256', fontWeight: '600' },
  detailTabButtonTextActive: { color: '#fff' },
  quoteRankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e8dfd2',
    backgroundColor: '#faf7f2',
    padding: 10,
    marginBottom: 8,
  },
  rankBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#efe8dd',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  rankBadgeText: { color: '#7d6f5e', fontSize: 13, fontWeight: '700' },
  rankContent: { flex: 1 },
  rankQuoteText: { color: '#312b23', fontSize: 13, marginBottom: 4 },
  rankMetaText: { color: '#7c7266', fontSize: 11 },
  discussionCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e8dfd2',
    backgroundColor: '#faf7f2',
    padding: 10,
    marginBottom: 8,
  },
  discussionBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: '#eef3e9',
    marginBottom: 6,
  },
  discussionBadgeText: { color: '#7d8d73', fontSize: 10, fontWeight: '700' },
  discussionTitle: { color: '#312b23', fontSize: 15, fontWeight: '700', marginBottom: 6 },
  discussionPreview: { color: '#696055', fontSize: 13, lineHeight: 18, marginBottom: 8 },
  discussionMeta: { color: '#7c7266', fontSize: 11 },
  discussionActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  likeInlineText: { color: '#8d7353', fontSize: 12, fontWeight: '700' },
  likeButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d6cbbb',
    backgroundColor: '#f4efe7',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  likeButtonText: { color: '#6c6256', fontSize: 12, fontWeight: '700' },
  commentSectionCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e8dfd2',
    backgroundColor: '#faf7f2',
    padding: 10,
    marginBottom: 10,
  },
  commentSectionTitle: { color: '#312b23', fontSize: 13, fontWeight: '700', marginBottom: 8 },
  commentList: {
    maxHeight: 240,
    marginBottom: 4,
  },
  commentItemCard: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e8dfd2',
    backgroundColor: '#f7f2ea',
    padding: 8,
    marginBottom: 8,
  },
  commentWriter: { color: '#5f564b', fontSize: 11, fontWeight: '700', marginBottom: 4 },
  commentContent: { color: '#312b23', fontSize: 13, lineHeight: 18, marginBottom: 4 },
  commentMeta: { color: '#7c7266', fontSize: 11 },
  commentSubmitButton: {
    alignSelf: 'flex-end',
    borderRadius: 8,
    backgroundColor: '#8d7353',
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginTop: 2,
  },
  commentSubmitButtonText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  discussionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  discussionCreateButton: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#8d7353',
    backgroundColor: '#8d7353',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  discussionCreateButtonText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  inputLabel: { color: '#6c6256', fontSize: 12, fontWeight: '700', marginBottom: 6, marginTop: 2 },
  categoryRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  categoryChip: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ded3c4',
    backgroundColor: '#f4efe7',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  categoryChipActive: { borderColor: '#8d7353', backgroundColor: '#8d7353' },
  categoryChipText: { color: '#6c6256', fontSize: 11, fontWeight: '600' },
  categoryChipTextActive: { color: '#fff' },
  inputBox: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2d8cb',
    backgroundColor: '#f7f2ea',
    paddingHorizontal: 10,
    minHeight: 38,
    marginBottom: 8,
    color: '#352f27',
  },
  textArea: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2d8cb',
    backgroundColor: '#f7f2ea',
    paddingHorizontal: 10,
    paddingTop: 10,
    minHeight: 92,
    marginBottom: 8,
    color: '#352f27',
    textAlignVertical: 'top',
  },
  createFooterRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 4 },
  cancelButton: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d8cdbf',
    backgroundColor: '#f4efe7',
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  cancelButtonText: { color: '#6c6256', fontSize: 12, fontWeight: '700' },
  confirmButton: {
    borderRadius: 8,
    backgroundColor: '#8d7353',
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  confirmButtonText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  closeButton: {
    alignSelf: 'flex-end',
    borderRadius: 10,
    backgroundColor: '#8d7353',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  closeButtonText: { color: '#fff', fontSize: 12, fontWeight: '700' },
});
